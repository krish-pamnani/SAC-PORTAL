import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI } from '../services/api';
import { Trophy, CreditCard, User, LogOut, DollarSign, CheckCircle, Clock, Eye } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === `/student${path}`;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)', backgroundAttachment: 'fixed' }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        zIndex: 100,
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              🎓 Student Portal
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              padding: '8px 16px', 
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#475569',
              fontWeight: '500',
            }}>
              {user?.email}
            </div>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)',
        }}>
          <div className="container" style={{
            display: 'flex',
            gap: '8px',
            padding: '0 16px',
          }}>
            <button
              onClick={() => navigate('/student')}
              style={{
                padding: '14px 24px',
                border: 'none',
                background: isActive('') || isActive('/') ? 'white' : 'transparent',
                borderBottom: isActive('') || isActive('/') ? '3px solid #6366f1' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive('') || isActive('/') ? '600' : '500',
                color: isActive('') || isActive('/') ? '#6366f1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                transition: 'all 0.2s ease',
              }}
            >
              <Trophy size={18} />
              My Events
            </button>
            <button
              onClick={() => navigate('/student/profile')}
              style={{
                padding: '14px 24px',
                border: 'none',
                background: isActive('/profile') ? 'white' : 'transparent',
                borderBottom: isActive('/profile') ? '3px solid #6366f1' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive('/profile') ? '600' : '500',
                color: isActive('/profile') ? '#6366f1' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                transition: 'all 0.2s ease',
              }}
            >
              <User size={18} />
              My Profile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <Routes>
          <Route path="/" element={<MyEvents />} />
          <Route path="/profile" element={<MyProfile />} />
        </Routes>
      </div>
    </div>
  );
};

// My Events Component
const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.error || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Trophy size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
        <h3>No Events Yet</h3>
        <p style={{ color: '#666' }}>You haven't won any prizes yet. Keep participating!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>My Prize-Winning Events</h3>
      
      <div className="grid grid-2">
        {events.map((event) => (
          <EventCard
            key={event.event_id}
            event={event}
            onViewBankDetails={(team) => {
              setSelectedTeam(team);
              setShowBankForm(false);
            }}
            onProvideBankDetails={(team) => {
              setSelectedTeam(team);
              setShowBankForm(true);
            }}
          />
        ))}
      </div>

      {selectedTeam && !showBankForm && (
        <ViewBankDetailsModal
          teamId={selectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      )}

      {selectedTeam && showBankForm && (
        <BankDetailsFormModal
          event={events.find(e => e.team_id === selectedTeam)}
          onClose={() => {
            setSelectedTeam(null);
            setShowBankForm(false);
            loadEvents();
          }}
        />
      )}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onViewBankDetails, onProvideBankDetails }) => {
  const isLeader = event.is_team_leader;
  const submitted = event.bank_details_submitted;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0' }}>{event.event_name}</h4>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {event.entity_name} • {new Date(event.created_at).toLocaleDateString()}
          </p>
        </div>
        {isLeader && (
          <span className="badge badge-leader">
            Team Leader
          </span>
        )}
      </div>

      <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <DollarSign size={20} color="#667eea" />
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            ₹{event.prize_amount.toLocaleString('en-IN')}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
          Prize Amount - {event.team_position}{getOrdinalSuffix(event.team_position)} Place
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Team Members:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {event.team_members?.map((member) => (
            <div key={member.student_email} style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {member.is_team_leader && '⭐'}
              {member.student_email}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        {submitted ? (
          <>
            <CheckCircle size={16} color="#28a745" />
            <span style={{ fontSize: '14px', color: '#28a745', fontWeight: '600' }}>
              Bank Details Submitted
            </span>
          </>
        ) : (
          <>
            <Clock size={16} color="#ffc107" />
            <span style={{ fontSize: '14px', color: '#856404', fontWeight: '600' }}>
              Bank Details Pending
            </span>
          </>
        )}
      </div>

      {submitted ? (
        <button
          onClick={() => onViewBankDetails(event.team_id)}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          <Eye size={16} />
          View Bank Details
        </button>
      ) : isLeader ? (
        <button
          onClick={() => onProvideBankDetails(event.team_id)}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <CreditCard size={16} />
          Provide Bank Details
        </button>
      ) : (
        <div className="alert alert-info" style={{ fontSize: '13px', padding: '8px 12px' }}>
          Your team leader will submit the bank details.
        </div>
      )}
    </div>
  );
};

// View Bank Details Modal
const ViewBankDetailsModal = ({ teamId, onClose }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const data = await studentAPI.viewBankDetails(teamId);
        setBankDetails(data.bankDetails);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBankDetails();
  }, [teamId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Bank Account Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : bankDetails ? (
          <div>
            <div className="input-group">
              <label>Account Holder's Name</label>
              <input value={bankDetails.account_holder_name} disabled />
            </div>
            <div className="input-group">
              <label>Account Number</label>
              <input value={bankDetails.account_number_masked} disabled />
            </div>
            <div className="input-group">
              <label>IFSC Code</label>
              <input value={bankDetails.ifsc_code} disabled />
            </div>
            <div className="input-group">
              <label>Bank Name</label>
              <input value={bankDetails.bank_name} disabled />
            </div>
            <div className="input-group">
              <label>Branch Name</label>
              <input value={bankDetails.branch_name} disabled />
            </div>
            <div className="input-group">
              <label>Amount</label>
              <input value={`₹${bankDetails.amount.toLocaleString('en-IN')}`} disabled />
            </div>
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              Bank details have been submitted to the treasury. Payment will be processed soon.
            </div>
          </div>
        ) : (
          <div className="alert alert-error">No bank details found.</div>
        )}
      </div>
    </div>
  );
};

// Bank Details Form Modal
const BankDetailsFormModal = ({ event, onClose }) => {
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
    save_profile: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Load saved profile if exists
    const loadProfile = async () => {
      try {
        const data = await studentAPI.getBankProfile();
        if (data.profile) {
          setFormData({
            account_holder_name: data.profile.account_holder_name,
            account_number: '', // Don't pre-fill account number for security
            ifsc_code: data.profile.ifsc_code,
            bank_name: data.profile.bank_name,
            branch_name: data.profile.branch_name,
            save_profile: false,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await studentAPI.submitBankDetails({
        team_id: event.team_id,
        ...formData,
      });
      alert('Bank details submitted successfully!');
      onClose();
    } catch (err) {
      setError(err.error || 'Failed to submit bank details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Provide Bank Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ marginBottom: '20px', padding: '12px', background: '#e7f3ff', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            <strong>{event.event_name}</strong><br />
            Prize Amount: <strong>₹{event.prize_amount.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        {loadingProfile ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label>Account Holder's Name *</label>
              <input
                value={formData.account_holder_name}
                onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label>Account Number *</label>
              <input
                value={formData.account_number}
                onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                pattern="\d{9,18}"
                required
                placeholder="9-18 digits"
              />
            </div>

            <div className="input-group">
              <label>IFSC Code *</label>
              <input
                value={formData.ifsc_code}
                onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})}
                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                required
                placeholder="e.g., SBIN0001234"
              />
            </div>

            <div className="input-group">
              <label>Bank Name *</label>
              <input
                value={formData.bank_name}
                onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label>Branch Name *</label>
              <input
                value={formData.branch_name}
                onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
                required
              />
            </div>

            <div className="input-group">
              <label>Amount (Read Only)</label>
              <input
                value={`₹${event.prize_amount.toLocaleString('en-IN')}`}
                disabled
                style={{ fontWeight: 'bold', color: '#667eea' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.save_profile}
                  onChange={(e) => setFormData({...formData, save_profile: e.target.checked})}
                />
                <span style={{ fontSize: '14px' }}>Save these details for future use</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Details'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// My Profile Component
const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await studentAPI.getBankProfile();
      setProfile(data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>My Profile</h3>

      <div className="card">
        <h4>Account Information</h4>
        <div className="input-group">
          <label>Email</label>
          <input value={user.email} disabled />
        </div>
        <div className="input-group">
          <label>Account Type</label>
          <input value="Student" disabled />
        </div>
      </div>

      <div className="card">
        <h4>Saved Bank Account</h4>
        {profile ? (
          <div>
            <div className="input-group">
              <label>Account Holder</label>
              <input value={profile.account_holder_name} disabled />
            </div>
            <div className="input-group">
              <label>Account Number</label>
              <input value={profile.account_number_masked} disabled />
            </div>
            <div className="input-group">
              <label>IFSC Code</label>
              <input value={profile.ifsc_code} disabled />
            </div>
            <div className="input-group">
              <label>Bank Name</label>
              <input value={profile.bank_name} disabled />
            </div>
            <div className="input-group">
              <label>Branch Name</label>
              <input value={profile.branch_name} disabled />
            </div>
            <p style={{ fontSize: '13px', color: '#666' }}>
              Last updated: {new Date(profile.updated_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="alert alert-info">
            No saved bank profile. You'll be able to save your bank details when submitting for an event.
          </div>
        )}
      </div>
    </div>
  );
};

function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export default StudentDashboard;
