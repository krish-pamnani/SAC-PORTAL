import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Shield, Users, Building2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      switch (user.user_type) {
        case 'student':
          navigate('/student');
          break;
        case 'entity':
          navigate('/entity');
          break;
        case 'treasury':
          navigate('/treasury');
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      // Navigate based on user type
      switch (data.user.user_type) {
        case 'student':
          navigate('/student');
          break;
        case 'entity':
          navigate('/entity');
          break;
        case 'treasury':
          navigate('/treasury');
          break;
        default:
          setError('Invalid user type');
      }
    } catch (err) {
      setError(err.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', boxShadow: '0 20px 80px rgba(255, 255, 255, 0.1)' }}>
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            background: '#ffffff',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)',
          }}>
            <Shield size={40} color="#000000" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}>
            SAC Treasury Portal
          </h1>
          <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>
            IIM Indore - Prize Money Management
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ 
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email" style={{ fontSize: '15px' }}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@iimidr.ac.in"
              required
              autoComplete="email"
              style={{ fontSize: '15px', padding: '12px 14px' }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" style={{ fontSize: '15px' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              style={{ fontSize: '15px', padding: '12px 14px' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '16px', fontWeight: '600' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login to Dashboard
              </>
            )}
          </button>
        </form>

        {/* User Type Info */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: '#0a0a0a',
          borderRadius: '12px',
          border: '1px solid #2a2a2a',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
            🎓 Access Levels:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999' }}>
              <Users size={16} style={{ color: '#ffffff' }} />
              <span><strong style={{ color: '#ffffff' }}>Students:</strong> View winnings & submit bank details</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999' }}>
              <Building2 size={16} style={{ color: '#ffffff' }} />
              <span><strong style={{ color: '#ffffff' }}>Entities:</strong> Create events & manage winners</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999' }}>
              <Shield size={16} style={{ color: '#ffffff' }} />
              <span><strong style={{ color: '#ffffff' }}>Treasury:</strong> Process payments & approve transactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
