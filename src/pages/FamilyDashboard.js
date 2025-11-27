import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Users, UserPlus, Check, X, FileText, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/Dashboard.css';
import '../styles/family.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FamilyDashboard({ user, token, onLogout }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyReports, setFamilyReports] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
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
      console.error('Fetch family data error:', error);
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

  const handleRemoveFamilyMember = async (memberId) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this family member? This will delink your connection and their reports will no longer be visible.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMemberId(memberId);
      console.log('Removing family member:', memberId);

      const response = await axios.post(
        `${API}/family/remove/${memberId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Member removed:', response.data);
      toast.success('Family member removed successfully');
      fetchFamilyData();
    } catch (error) {
      console.error('Remove member error:', error.response?.data || error.message);
      toast.error(error.response?.data?.detail || 'Failed to remove family member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (loading) {
    return (
      <div className="family-page" data-testid="family-dashboard-page">
        <Navbar user={user} onLogout={onLogout} currentPage="family" />
        <div className="family-content">
          <div className="loading-state" data-testid="loading-state">
            <div className="spinner"></div>
            Loading family data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="family-page" data-testid="family-dashboard-page">
      <Navbar user={user} onLogout={onLogout} currentPage="family" />
      
      <div className="family-content">
        {/* HEADER */}
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

        {/* PENDING INVITES SECTION */}
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

        {/* FAMILY MEMBERS SECTION */}
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
                  {/* Remove button - top right corner */}
                  <button
                    className="remove-member-button"
                    onClick={() => handleRemoveFamilyMember(member.id)}
                    disabled={removingMemberId === member.id}
                    data-testid={`remove-member-btn-${index}`}
                    title="Remove this family member"
                    aria-label="Remove family member"
                  >
                    {removingMemberId === member.id ? (
                      <div className="spinner-small"></div>
                    ) : (
                      <X size={18} />
                    )}
                  </button>

                  <Users size={32} />
                  <h3>{member.username}</h3>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAMILY REPORTS GROUPED BY MEMBER */}
        <div className="family-reports-section">
          <h2 data-testid="family-reports-title">Family Reports</h2>

          {familyMembers.length === 0 ? (
            <div className="empty-state" data-testid="no-family-reports">
              <FileText size={64} />
              <p>No family members, so no reports yet.</p>
            </div>
          ) : (
            <div>
              {familyMembers.map((member) => {
                const memberReports = familyReports.filter(
                  (r) => r.user_id === member.id
                );

                return (
                  <div key={member.id} className="member-report-section" data-testid={`member-report-section-${member.username}`}>
                    <h3 className="member-report-title">
                      📋 Reports for <span className="member-name">{member.username}</span>
                    </h3>

                    {memberReports.length === 0 ? (
                      <div className="empty-state small" data-testid={`no-reports-${member.username}`}>
                        <FileText size={48} />
                        <p>No reports uploaded by {member.username}</p>
                      </div>
                    ) : (
                      <div className="reports-grid" data-testid={`reports-${member.username}`}>
                        {memberReports.map((report, index) => (
                          <div
                            key={report.id}
                            className="report-card"
                            data-testid={`family-report-${member.username}-${index}`}
                          >
                            <div className="report-header">
                              <FileText size={32} className="report-icon" />
                              <div className="report-info">
                                <h3>Report Date: {report.report_date}</h3>
                                <p className="report-time">
                                  Uploaded: {new Date(report.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="report-body">
                              <p><strong>Files:</strong> {report.original_files?.length || 0}</p>
                            </div>

                            <div className="report-actions">
                              {report.result_pdf ? (
                                <a
                                  href={report.result_pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  data-testid={`download-family-report-${member.username}-${index}`}
                                >
                                  <Button size="sm">
                                    <Download size={16} />
                                    Download PDF
                                  </Button>
                                </a>
                              ) : (
                                <Button size="sm" disabled>
                                  No PDF
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* INVITE MODAL */}
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
              <Button onClick={handleSendInvite} data-testid="send-invite-btn">
                Send Invite
              </Button>
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