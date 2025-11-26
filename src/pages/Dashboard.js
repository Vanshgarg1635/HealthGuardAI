import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Dashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, token, onLogout }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [resultReport, setResultReport] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (selectedFiles) => {
    if (files.length + selectedFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${API}/reports/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResultReport(response.data);
      toast.success('Report processed successfully!');
      setFiles([]);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-page" data-testid="dashboard-page">
      <Navbar user={user} onLogout={onLogout} currentPage="dashboard" />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="page-title" data-testid="dashboard-title">Upload Medical Reports</h1>
          <p className="page-subtitle">Upload your medical reports and get AI-powered analysis instantly</p>
        </div>

        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="upload-zone"
        >
          <Upload className="upload-icon" size={48} />
          <h3>Drag & Drop Files Here</h3>
          <p>or</p>
          <label htmlFor="file-input" className="file-input-label">
            <Button data-testid="browse-files-btn" type="button" onClick={() => document.getElementById('file-input').click()}>
              Browse Files
            </Button>
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            data-testid="file-input"
          />
          <p className="upload-info">Supports PDF, PNG, JPG, JPEG, DOC, DOCX (Max 20MB per file, up to 10 files)</p>
        </div>

        {files.length > 0 && (
          <div className="selected-files" data-testid="selected-files">
            <h3>Selected Files ({files.length}/10)</h3>
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item" data-testid={`file-item-${index}`}>
                  <FileText size={20} />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    data-testid={`remove-file-${index}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="upload-btn"
              data-testid="upload-submit-btn"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                'Upload & Analyze'
              )}
            </Button>
          </div>
        )}

        {resultReport && (
          <div className="result-report" data-testid="result-report">
            <h3>Analysis Complete!</h3>
            <p>Your health report has been generated and saved to your dashboard.</p>
            <div className="result-actions">
              <a
                href={resultReport.result_pdf}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="download-report-link"
              >
                <Button>Download Report</Button>
              </a>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/reports'}
                data-testid="view-reports-btn"
              >
                View All Reports
              </Button>
            </div>
          </div>
        )}
      </div>

      <ChatWidget user={user} token={token} />
    </div>
  );
}
