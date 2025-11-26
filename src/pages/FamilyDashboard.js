import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Users, UserPlus, Check, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Dashboard.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FamilyDashboard({ user, token, onLogout }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyReports, setFamilyReports] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const [membersRes, reportsRes, invitesRes] = await Promise.all([
        axios.get(`${API}/family/members`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/reports/family`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/family/invites`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setFamilyMembers(membersRes.data.members || []);
      setFamilyReports(reportsRes.data || []);
      setInvites(invitesRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch family data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteToken.trim()) {
      toast.error('Please enter a token');
      return;
    }

    try {
      await axios.post(
        `${API}/family/invite`,
        { invitee_token: inviteToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Invite sent successfully!');
      setShowInviteModal(false);
      setInviteToken('');
      fetchFamilyData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send invite');
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await axios.post(
        `${API}/family/accept/${inviteId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Invite accepted!');
      fetchFamilyData();
    } catch (error) {
      toast.error('Failed to accept invite');
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await axios.post(
        `${API}/family/reject/${inviteId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Invite rejected');
      fetchFamilyData();
    } catch (error) {
      toast.error('Failed to reject invite');
    }
  };

  return (
    <div className="family-page" data-testid="family-dashboard-page">
      <Navbar user={user} onLogout={onLogout} currentPage="family" />
      
      <div className="family-content">
        <div className="family-header">
          <div>
            <h1 className="page-title" data-testid="family-title">Family Dashboard</h1>
            <p className="user-token-display" data-testid="user-token-display">
              Your Token: <code>{user.unique_token}</code>
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            data-testid="invite-family-btn"
          >
            <UserPlus size={20} />
            Invite Family Member
          </Button>
        </div>

        {invites.length > 0 && (
          <div className="invites-section" data-testid="invites-section">
            <h2>Pending Invites</h2>
            <div className="invites-list">
              {invites.map((invite, index) => (
                <div key={invite.id} className="invite-card" data-testid={`invite-card-${index}`}>
                  <div className="invite-info">
                    <p><strong>{invite.requester_username}</strong> wants to connect with you</p>
                    <p className="invite-date">Sent: {new Date(invite.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="invite-actions">
                    <Button
                      onClick={() => handleAcceptInvite(invite.id)}
                      size="sm"
                      data-testid={`accept-invite-${index}`}
                    >
                      <Check size={16} />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectInvite(invite.id)}
                      size="sm"
                      data-testid={`reject-invite-${index}`}
                    >
                      <X size={16} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="family-members-section">
          <h2 data-testid="family-members-title">Connected Family Members ({familyMembers.length})</h2>
          {familyMembers.length === 0 ? (
            <div className="empty-state" data-testid="no-family-members">
              <Users size={64} />
              <h3>No Family Members Yet</h3>
              <p>Invite family members using their unique tokens to monitor their health reports</p>
            </div>
          ) : (
            <div className="members-grid" data-testid="members-grid">
              {familyMembers.map((member, index) => (
                <div key={member.id} className="member-card" data-testid={`member-card-${index}`}>
                  <Users size={32} />
                  <h3>{member.username}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="family-reports-section">
          <h2 data-testid="family-reports-title">Family Reports</h2>
          {familyReports.length === 0 ? (
            <div className="empty-state" data-testid="no-family-reports">
              <FileText size={64} />
              <p>No reports from family members yet</p>
            </div>
          ) : (
            <div className="reports-grid" data-testid="family-reports-grid">
              {familyReports.map((report, index) => (
                <div key={report.id} className="report-card" data-testid={`family-report-${index}`}>
                  <div className="report-header">
                    <FileText size={32} />
                    <div className="report-info">
                      <h3>Report Date: {report.report_date}</h3>
                      <p>Created: {new Date(report.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="report-actions">
                    <a
                      href={report.result_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`download-family-report-${index}`}
                    >
                      <Button size="sm">Download Report</Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="modal-content" data-testid="invite-modal">
          <DialogHeader>
            <DialogTitle className="modal-title">Invite Family Member</DialogTitle>
          </DialogHeader>
          <div className="invite-form">
            <p>Enter the unique token of the family member you want to invite:</p>
            <Input
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              placeholder="Enter token (e.g., ABC12345)"
              data-testid="invite-token-input"
            />
            <div className="modal-actions">
              <Button onClick={handleSendInvite} data-testid="send-invite-btn">Send Invite</Button>
              <Button
                variant="outline"
                onClick={() => setShowInviteModal(false)}
                data-testid="cancel-invite-btn"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChatWidget user={user} token={token} />
    </div>
  );
}
