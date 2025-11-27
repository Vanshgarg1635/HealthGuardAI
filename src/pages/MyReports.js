import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';  // Make sure to import Input
import { Calendar, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Dashboard.css';
import ReportOverviewModal from "../components/ReportOverViewModal";
import ChatWidget from '../components/ChatWidget';  // Import the ChatWidget


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyReports({ user, token, onLogout }) {
  // 1. RAW DATA (Everything from the database)
  const [allReportsFromBackend, setAllReportsFromBackend] = useState([]);

  // 2. THE VIEW (What the user actually sees)
  const [visibleReports, setVisibleReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  // Initial Fetch
  useEffect(() => {
    fetchReports();
  }, []);

  // MASTER FILTER: This runs automatically whenever Data or Search changes
  useEffect(() => {
    let processedData = allReportsFromBackend;

    // Step A: Apply Date Search (if exists)
    if (searchDate) {
      processedData = processedData.filter(report => report.report_date === searchDate);
    }

    // Step B: Update the View
    setVisibleReports(processedData);

  }, [allReportsFromBackend, searchDate]);

  // Fetch from Backend
  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/reports/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllReportsFromBackend(response.data); // Store raw data, let useEffect handle filtering
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
          <div className="loading-state" data-testid="loading-state">
            Loading reports...
          </div>
        ) : visibleReports.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            <FileText size={64} />
            <h3>No Reports Found</h3>
            <p>
              {searchDate
                ? "No reports found for this date"
                : "Upload your first medical report to get started"}
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              data-testid="upload-first-report-btn"
            >
              Upload Report
            </Button>
          </div>
        ) : (
          <div className="reports-grid" data-testid="reports-grid">
            {/* Map over visibleReports instead of filteredReports */}
            {visibleReports.map((report) => (
              <div key={report._id} className="report-card" data-testid={`report-card-${report._id}`}>
                <div className="report-header">
                  <FileText size={32} className="report-icon" />
                  <div className="report-info">
                    <h3 data-testid={`report-date-${report._id}`}>
                      Report Date: {report.report_date}
                    </h3>
                    {/* Display the user's name or account name here */}
                    <p className="report-user" data-testid={`report-user-${report._id}`}>
                      Uploaded by: {user?.name || user?.username || 'Unknown User'}
                    </p>
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
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(report)}
                    data-testid={`view-overview-${report._id}`}
                  >
                    View Overview
                  </Button>

                  <a
                    href={report.result_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>
                      <Download size={16} /> Download Report
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChatWidget user={user} token={token} />

      {selectedReport && (
        <ReportOverviewModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
