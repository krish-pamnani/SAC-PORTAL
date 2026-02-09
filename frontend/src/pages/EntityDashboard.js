import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { entityAPI } from '../services/api';
import { PlusCircle, List, LogOut, Trash2, UserPlus } from 'lucide-react';

const EntityDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === `/entity${path}`;

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
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>
              Entity Portal
            </h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {user?.entity_name}
            </p>
          </div>
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
              onClick={() => navigate('/entity')}
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
              <List size={16} />
              Past Events
            </button>
            <button
              onClick={() => navigate('/entity/new')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: isActive('/new') ? 'white' : 'transparent',
                borderBottom: isActive('/new') ? '3px solid #667eea' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive('/new') ? '600' : '400',
                color: isActive('/new') ? '#667eea' : '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <PlusCircle size={16} />
              New Event
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <Routes>
          <Route path="/" element={<PastEvents />} />
          <Route path="/new" element={<NewEvent />} />
        </Routes>
      </div>
    </div>
  );
};

// Past Events Component
const PastEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await entityAPI.getMyEvents();
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
        <PlusCircle size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
        <h3>No Events Created Yet</h3>
        <p style={{ color: '#666' }}>Create your first event to start distributing prizes.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>All Events ({events.length})</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.map((event) => (
          <div key={event.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>{event.event_name}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Created on {new Date(event.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                  ₹{event.total_prize_pool.toLocaleString('en-IN')}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Prize Pool</p>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <strong style={{ fontSize: '14px' }}>Teams ({event.teams?.length || 0}):</strong>
              {event.teams?.map((team, index) => (
                <div key={team.id} style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: '4px solid' + (team.bank_details_submitted ? '#28a745' : '#ffc107'),
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Team {index + 1}</strong>
                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                      ₹{team.prize_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Members: {team.team_members?.map(m => (
                      <span key={m.id}>
                        {m.users.email}
                        {m.is_team_leader && ' (Leader)'}
                        {', '}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    {team.bank_details_submitted ? (
                      <span className="badge badge-success">Bank Details Submitted</span>
                    ) : (
                      <span className="badge badge-pending">Pending Submission</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// New Event Component
const NewEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    event_name: '',
    total_prize_pool: '',
    teams: [
      {
        prize_amount: '',
        members: [{ email: '', is_team_leader: false }],
        selected_leader: '',
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTeam = () => {
    setFormData({
      ...formData,
      teams: [
        ...formData.teams,
        {
          prize_amount: '',
          members: [{ email: '', is_team_leader: false }],
          selected_leader: '',
        },
      ],
    });
  };

  const removeTeam = (index) => {
    const newTeams = formData.teams.filter((_, i) => i !== index);
    setFormData({ ...formData, teams: newTeams });
  };

  const addMember = (teamIndex) => {
    const newTeams = [...formData.teams];
    newTeams[teamIndex].members.push({ email: '', is_team_leader: false });
    setFormData({ ...formData, teams: newTeams });
  };

  const removeMember = (teamIndex, memberIndex) => {
    const newTeams = [...formData.teams];
    newTeams[teamIndex].members = newTeams[teamIndex].members.filter((_, i) => i !== memberIndex);
    setFormData({ ...formData, teams: newTeams });
  };

  const updateMemberEmail = (teamIndex, memberIndex, email) => {
    const newTeams = [...formData.teams];
    newTeams[teamIndex].members[memberIndex].email = email;
    setFormData({ ...formData, teams: newTeams });
  };

  const updateTeamPrize = (teamIndex, amount) => {
    const newTeams = [...formData.teams];
    newTeams[teamIndex].prize_amount = amount;
    setFormData({ ...formData, teams: newTeams });
  };

  const setTeamLeader = (teamIndex, memberEmail) => {
    const newTeams = [...formData.teams];
    newTeams[teamIndex].selected_leader = memberEmail;
    newTeams[teamIndex].members = newTeams[teamIndex].members.map(m => ({
      ...m,
      is_team_leader: m.email === memberEmail,
    }));
    setFormData({ ...formData, teams: newTeams });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    for (let i = 0; i < formData.teams.length; i++) {
      const team = formData.teams[i];
      if (!team.selected_leader) {
        setError(`Please select a team leader for Team ${i + 1}`);
        return;
      }
      if (team.members.length === 0) {
        setError(`Team ${i + 1} must have at least one member`);
        return;
      }
    }

    setLoading(true);
    try {
      await entityAPI.createEvent({
        event_name: formData.event_name,
        total_prize_pool: parseFloat(formData.total_prize_pool),
        teams: formData.teams.map(team => ({
          prize_amount: parseFloat(team.prize_amount),
          members: team.members.filter(m => m.email.trim()),
        })),
      });
      alert('Event created successfully!');
      navigate('/entity');
    } catch (err) {
      setError(err.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Create New Event</h3>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h4>Event Details</h4>
          
          <div className="input-group">
            <label>Event Name *</label>
            <input
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              required
              placeholder="e.g., Annual Fest Dance Competition"
            />
          </div>

          <div className="input-group">
            <label>Total Prize Pool (₹) *</label>
            <input
              type="number"
              value={formData.total_prize_pool}
              onChange={(e) => setFormData({ ...formData, total_prize_pool: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        {formData.teams.map((team, teamIndex) => (
          <div key={teamIndex} className="card" style={{ borderLeft: '4px solid #667eea' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0 }}>Team {teamIndex + 1}</h4>
              {formData.teams.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTeam(teamIndex)}
                  className="btn btn-danger"
                  style={{ padding: '6px 12px' }}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              )}
            </div>

            <div className="input-group">
              <label>Prize Amount (₹) *</label>
              <input
                type="number"
                value={team.prize_amount}
                onChange={(e) => updateTeamPrize(teamIndex, e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Team Members *
              </label>
              {team.members.map((member, memberIndex) => (
                <div key={memberIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMemberEmail(teamIndex, memberIndex, e.target.value)}
                    required
                    placeholder="student@iimidr.ac.in"
                    style={{ flex: 1 }}
                  />
                  {team.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(teamIndex, memberIndex)}
                      className="btn btn-danger"
                      style={{ padding: '10px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addMember(teamIndex)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <UserPlus size={16} />
                Add Member
              </button>
            </div>

            <div className="input-group">
              <label>Select Team Leader *</label>
              <select
                value={team.selected_leader}
                onChange={(e) => setTeamLeader(teamIndex, e.target.value)}
                required
              >
                <option value="">-- Select Team Leader --</option>
                {team.members.filter(m => m.email.trim()).map((member, idx) => (
                  <option key={idx} value={member.email}>
                    {member.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addTeam}
          className="btn btn-secondary"
          style={{ marginBottom: '16px', width: '100%' }}
        >
          <PlusCircle size={16} />
          Add Another Team
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/entity')}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntityDashboard;
