import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Spinner } from 'react-bootstrap';
import api from '../services/api';

function Register({ setPage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { username, password });
      setSuccess(true);
      setTimeout(() => setPage('login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#FDFBF7' }}>
      <Card className="shadow-sm p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: 'none' }}>
        <h3 className="text-center mb-4" style={{ color: '#3E2723', fontWeight: 'bold' }}>Create Account</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Registered successfully! Redirecting...</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#4E342E' }}>Username</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Choose a username" 
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
              placeholder="Choose a password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #D7CCC8' }}
            />
          </Form.Group>

          <Button 
            type="submit" 
            className="w-100 mb-3" 
            disabled={loading || success}
            style={{ background: 'linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)', border: 'none', padding: '12px', borderRadius: '8px' }}
          >
            {loading ? <Spinner size="sm" /> : 'Register'}
          </Button>
        </Form>
        
        <div className="text-center mt-3">
          <span style={{ color: '#6d4c41' }}>Already have an account? </span>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }} style={{ color: '#3E2723', fontWeight: 'bold', textDecoration: 'none' }}>Login</a>
        </div>
      </Card>
    </Container>
  );
}

export default Register;
