import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar, Download, FileText, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Dashboard.css';
import ReportOverviewModal from '../components/ReportOverViewModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyReports({ user, token, onLogout }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [deletingReportId, setDeletingReportId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (searchDate) {
      const filtered = reports.filter(report => report.report_date === searchDate);
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [searchDate, reports]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/reports/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Delete report handler
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingReportId(reportId);
      const response = await axios.delete(
        `${API}/reports/${reportId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Report deleted:', response.data);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      console.error('Delete report error:', error.response?.data || error.message);
      toast.error(error.response?.data?.detail || 'Failed to delete report');
    } finally {
      setDeletingReportId(null);
    }
  };

  return (
    <div className="reports-page" data-testid="my-reports-page">
      <Navbar user={user} onLogout={onLogout} currentPage="reports" />
      
      <div className="reports-content">
        <div className="reports-header">
          <h1 className="page-title" data-testid="reports-title">My Reports</h1>
          <div className="search-bar">
            <Calendar size={20} />
            <Input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="Search by date"
              data-testid="date-search-input"
            />
            {searchDate && (
              <Button
                variant="ghost"
                onClick={() => setSearchDate('')}
                data-testid="clear-search-btn"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state" data-testid="loading-state">
            <div className="spinner"></div>
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            <FileText size={64} />
            <h3>No Reports Found</h3>
            <p>{searchDate ? 'No reports found for this date' : 'Upload your first medical report to get started'}</p>
            <Button onClick={() => window.location.href = '/dashboard'} data-testid="upload-first-report-btn">
              Upload Report
            </Button>
          </div>
        ) : (
          <div className="reports-grid" data-testid="reports-grid">
            {filteredReports.map((report, index) => (
              <div key={report.id} className="report-card" data-testid={`report-card-${index}`}>
                {/* Delete button - top right corner */}
                <button
                  className="report-delete-button"
                  onClick={() => handleDeleteReport(report.id)}
                  disabled={deletingReportId === report.id}
                  data-testid={`delete-report-${index}`}
                  title="Delete this report"
                  aria-label="Delete report"
                >
                  {deletingReportId === report.id ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>

                <div className="report-header">
                  <FileText size={32} className="report-icon" />
                  <div className="report-info">
                    <h3 data-testid={`report-date-${index}`}>Report Date: {report.report_date}</h3>
                    <p className="report-time">
                      Created: {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="report-body">
                  <p><strong>Files Uploaded:</strong> {report.original_files.length}</p>
                </div>

                <div className="report-actions">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(report)}
                    data-testid={`view-overview-${index}`}
                  >
                    <Eye size={16} />
                    View Overview
                  </Button>

                  <a
                    href={report.result_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`download-report-${index}`}
                  >
                    <Button>
                      <Download size={16} />
                      Download Report
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportOverviewModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      <ChatWidget user={user} token={token} />
    </div>
  );
}