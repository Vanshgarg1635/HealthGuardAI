import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Dashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyReports({ user, token, onLogout }) {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');

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
          <div className="loading-state" data-testid="loading-state">Loading reports...</div>
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
                  {report.extracted_data?.analysis && (
                    <div className="report-preview">
                      <strong>Analysis Preview:</strong>
                      <p>{report.extracted_data.analysis.substring(0, 200)}...</p>
                    </div>
                  )}
                </div>
                <div className="report-actions">
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

      <ChatWidget user={user} token={token} />
    </div>
  );
}
