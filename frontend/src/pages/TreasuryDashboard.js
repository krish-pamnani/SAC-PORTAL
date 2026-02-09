import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { treasuryAPI } from '../services/api';
import { BarChart3, Download, LogOut, Bell, CheckCircle } from 'lucide-react';

const TreasuryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === `/treasury${path}`;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 100,
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
        }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>
            Treasury Portal
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {user?.email}
            </span>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div style={{
          borderTop: '1px solid #e0e0e0',
          background: '#f8f9fa',
        }}>
          <div className="container" style={{
            display: 'flex',
            gap: '4px',
            padding: '0',
          }}>
            <button
              onClick={() => navigate('/treasury')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: isActive('') || isActive('/') ? 'white' : 'transparent',
                borderBottom: isActive('') || isActive('/') ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive('') || isActive('/') ? '600' : '400',
                color: isActive('') || isActive('/') ? '#667eea' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BarChart3 size={16} />
              All Events
            </button>
            <button
              onClick={() => navigate('/treasury/download')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: isActive('/download') ? 'white' : 'transparent',
                borderBottom: isActive('/download') ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive('/download') ? '600' : '400',
                color: isActive('/download') ? '#667eea' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Download size={16} />
              Download Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <Routes>
          <Route path="/" element={<AllEvents />} />
          <Route path="/download" element={<DownloadData />} />
        </Routes>
      </div>
    </div>
  );
};

// All Events Component
const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        treasuryAPI.getAllEvents(),
        treasuryAPI.getStatistics(),
      ]);
      setEvents(eventsData.events || []);
      setStatistics(statsData.statistics);
    } catch (err) {
      setError(err.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    if (!window.confirm('Send reminder emails to all team leaders with pending bank details?')) {
      return;
    }

    setSendingReminders(true);
    try {
      const result = await treasuryAPI.sendReminders();
      alert(`Reminders sent to ${result.sent} team leaders!`);
    } catch (err) {
      alert(err.error || 'Failed to send reminders');
    } finally {
      setSendingReminders(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  // Calculate pending count
  const pendingCount = events.reduce((count, event) => {
    return count + (event.teams?.filter(t => !t.bank_details_submitted).length || 0);
  }, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>All Events & Bank Submissions</h3>
        <button
          onClick={handleSendReminders}
          className="btn btn-warning"
          disabled={sendingReminders || pendingCount === 0}
        >
          <Bell size={16} />
          {sendingReminders ? 'Sending...' : `Send Reminder (${pendingCount} pending)`}
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-3" style={{ marginBottom: '24px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Total Events</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
              {statistics.totalEvents}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Amount Paid</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
              ₹{statistics.totalAmountPaid.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>Amount Pending</p>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
              ₹{statistics.totalAmountPending.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#666' }}>No events created yet.</p>
          </div>
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} onUpdate={loadData} />
          ))
        )}
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onUpdate }) => {
  const submittedCount = event.teams?.filter(t => t.bank_details_submitted).length || 0;
  const totalCount = event.teams?.length || 0;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0' }}>{event.event_name}</h4>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {event.entity?.entity_name} • {new Date(event.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
            ₹{event.total_prize_pool.toLocaleString('en-IN')}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Prize Pool</p>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>Bank Details Submission</span>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>
            {submittedCount} / {totalCount}
          </span>
        </div>
        <div style={{
          height: '8px',
          background: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(submittedCount / totalCount) * 100}%`,
            height: '100%',
            background: submittedCount === totalCount ? '#28a745' : '#ffc107',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <strong style={{ fontSize: '14px' }}>Teams ({totalCount}):</strong>
        {event.teams?.map((team, index) => (
          <TeamCard key={team.id} team={team} teamNumber={index + 1} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
};

// Team Card Component
const TeamCard = ({ team, teamNumber, onUpdate }) => {
  const [showMarkPaid, setShowMarkPaid] = useState(false);

  return (
    <>
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid ' + (team.bank_details_submitted ? '#28a745' : '#ffc107'),
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <strong>Team {teamNumber}</strong>
          <span style={{ color: '#667eea', fontWeight: 'bold' }}>
            ₹{team.prize_amount.toLocaleString('en-IN')}
          </span>
        </div>

        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
          <strong>Members:</strong>
          {team.team_members?.map(m => (
            <div key={m.id} style={{ marginLeft: '12px' }}>
              • {m.users.email} {m.is_team_leader && '(Team Leader)'}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
          {team.bank_details_submitted ? (
            <>
              <span className="badge badge-success">Bank Details Submitted</span>
              {team.bank_details?.[0]?.payment_status === 'completed' ? (
                <span className="badge" style={{ background: '#28a745', color: 'white' }}>
                  ✓ Paid
                </span>
              ) : (
                <button
                  onClick={() => setShowMarkPaid(true)}
                  className="btn btn-success"
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                >
                  <CheckCircle size={14} />
                  Mark as Paid
                </button>
              )}
            </>
          ) : (
            <span className="badge badge-pending">Pending Submission</span>
          )}
        </div>
      </div>

      {showMarkPaid && team.bank_details?.[0] && (
        <MarkPaidModal
          bankDetailsId={team.bank_details[0].id}
          amount={team.prize_amount}
          eventName={team.event_name}
          onClose={() => setShowMarkPaid(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

// Mark as Paid Modal
const MarkPaidModal = ({ bankDetailsId, amount, eventName, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_reference: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await treasuryAPI.markPaid(bankDetailsId, formData);
      alert('Payment marked as completed!');
      onUpdate();
      onClose();
    } catch (err) {
      alert(err.error || 'Failed to mark payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Mark Payment as Completed</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ marginBottom: '16px', padding: '12px', background: '#e7f3ff', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>Event:</strong> {eventName}<br />
            <strong>Amount:</strong> ₹{amount.toLocaleString('en-IN')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Payment Date *</label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>UTR / Reference Number *</label>
            <input
              value={formData.payment_reference}
              onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
              required
              placeholder="Enter UTR or transaction reference"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Confirming...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Download Data Component
const DownloadData = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await treasuryAPI.downloadData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treasury_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.error || 'Failed to download data');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Download Treasury Data</h3>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Download size={64} color="#667eea" style={{ margin: '0 auto 20px' }} />
          <h4>Export All Bank Details</h4>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Download an Excel file containing all bank account details, payment information, and transaction history.
          </p>

          <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <strong>The Excel file will contain:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Account holder names</li>
              <li>Full account numbers (decrypted)</li>
              <li>IFSC codes and bank details</li>
              <li>Prize amounts</li>
              <li>Payment status and dates</li>
              <li>UTR/Reference numbers</li>
            </ul>
          </div>

          <button
            onClick={handleDownload}
            className="btn btn-primary"
            disabled={downloading}
            style={{ minWidth: '200px' }}
          >
            {downloading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                Downloading...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Excel File
              </>
            )}
          </button>

          <p style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
            ⚠️ This file contains sensitive financial information. Handle with care.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TreasuryDashboard;
