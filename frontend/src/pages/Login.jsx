import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Container, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { startAuthentication } from '@simplewebauthn/browser';

function Login({ setPage }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.access_token, res.data.username);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    if (!username) {
      setError('Please enter your username first for Fingerprint login.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Get auth options from server
      const res = await api.get(`/auth/webauthn/login/generate?username=${encodeURIComponent(username)}`);
      const options = res.data;

      // 2. Pass options to browser authenticator
      const asseResp = await startAuthentication({ optionsJSON: options });

      // 3. Send response to server to verify
      const verifyRes = await api.post(`/auth/webauthn/login/verify?username=${encodeURIComponent(username)}`, asseResp);
      
      login(verifyRes.data.access_token, verifyRes.data.username);
    } catch (err) {
      console.error(err);
      setError('Fingerprint login failed. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#FDFBF7' }}>
      <Card className="shadow-sm p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: 'none' }}>
        <h3 className="text-center mb-4" style={{ color: '#3E2723', fontWeight: 'bold' }}>Welcome Back</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#4E342E' }}>Username</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D7CCC8' }}
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label style={{ color: '#4E342E' }}>Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D7CCC8' }}
            />
          </Form.Group>

          <Button 
            type="submit" 
            className="w-100 mb-3" 
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)', border: 'none', padding: '12px', borderRadius: '8px' }}
          >
            {loading ? <Spinner size="sm" /> : 'Login'}
          </Button>

          <Button 
            type="button" 
            variant="outline-secondary" 
            className="w-100 mb-3" 
            onClick={handleWebAuthnLogin}
            disabled={loading}
            style={{ padding: '12px', borderRadius: '8px', color: '#5D4037', borderColor: '#5D4037' }}
          >
            👆 Login with Fingerprint
          </Button>
        </Form>
        
        <div className="text-center mt-3">
          <span style={{ color: '#6d4c41' }}>Don't have an account? </span>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('register'); }} style={{ color: '#3E2723', fontWeight: 'bold', textDecoration: 'none' }}>Register</a>
        </div>
      </Card>
    </Container>
  );
}

export default Login;
