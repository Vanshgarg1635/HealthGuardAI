import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Upload, FileText, Loader2, CheckCircle, Zap, Shield, Activity, X } from 'lucide-react';
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
      
      <div className="dashboard-content centered-layout">
        
        {/* --- 1. HEADINGS (Top) --- */}
        <div className="dashboard-header center-text">
          <h1 className="page-title">Upload Medical Reports</h1>
          <p className="page-subtitle">Upload your medical reports and get AI-powered analysis instantly</p>
        </div>

        {/* --- 2. UPLOAD STRIP (Middle) --- */}
        <div className="upload-container-wrapper">
          {resultReport ? (
             /* RESULT VIEW */
             <div className="result-strip">
                <div className="result-strip-content">
                  <CheckCircle className="text-green-500" size={32} />
                  <div className="result-text">
                    <h3>Analysis Ready</h3>
                    <p>Your health report has been generated.</p>
                  </div>
                  <div className="result-actions-inline">
                    <a href={resultReport.result_pdf} target="_blank" rel="noopener noreferrer">
                      <Button className="btn-primary-compact">Download</Button>
                    </a>
                    <Button variant="outline" onClick={() => setResultReport(null)} className="btn-secondary-compact">
                      New Upload
                    </Button>
                  </div>
                </div>
             </div>
          ) : (
            /* UPLOAD VIEW */
            <>
              <div 
                className={`upload-strip-horizontal ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="strip-left">
                  <div className="icon-circle-small">
                    <Upload size={20} />
                  </div>
                  <div className="strip-text">
                    <h3>Drag & Drop Files</h3>
                    <p>Max 20MB per file (PDF, JPG, PNG)</p>
                  </div>
                </div>

                <div className="strip-right">
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-input">
                    <Button className="browse-btn-compact" onClick={() => document.getElementById('file-input').click()}>
                      Browse Files
                    </Button>
                  </label>
                </div>
              </div>

              {/* SELECTED FILES & ANALYZE BUTTON (Appears below strip) */}
              {files.length > 0 && (
                <div className="active-files-container">
                  <div className="files-row">
                    {files.map((file, index) => (
                      <div key={index} className="file-chip">
                        <FileText size={14} />
                        <span className="file-name-truncate">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="chip-remove"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="analyze-btn-wide" 
                    onClick={handleUpload} 
                    disabled={uploading}
                  >
                     {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Analyze Now'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- 3. INFO GRID (Bottom) --- */}
        <div className="dashboard-info-grid">
          
          {/* Why HealthGuard? */}
          <div className="info-card-panel">
            <h2>Why HealthGuard?</h2>
            <div className="benefits-row">
              <div className="benefit-pill">
                <Zap size={16} className="text-blue-500" /> <span>Instant</span>
              </div>
              <div className="benefit-pill">
                <Shield size={16} className="text-green-500" /> <span>Secure</span>
              </div>
              <div className="benefit-pill">
                <Activity size={16} className="text-purple-500" /> <span>Accurate</span>
              </div>
            </div>
            <p>Trusted by doctors and patients. We turn complex medical data into clear, actionable summaries in seconds.</p>
          </div>

          {/* How It Works */}
          <div className="info-card-panel">
            <h2>How It Works</h2>
            <div className="steps-row">
              <div className="step-dot">1</div>
              <span className="step-line"></span>
              <div className="step-dot">2</div>
              <span className="step-line"></span>
              <div className="step-dot">3</div>
            </div>
            <div className="steps-labels">
              <span>Upload</span>
              <span>AI Scan</span>
              <span>Result</span>
            </div>
          </div>

        </div>

      </div>
      <ChatWidget user={user} token={token} />
    </div>
  );
}