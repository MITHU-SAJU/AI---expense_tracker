import { useEffect, useState, useContext } from "react";
import { Row, Col, Button, Dropdown } from "react-bootstrap";
import SummaryCard from "../SummaryCard/SummaryCard";
import { getDashboardStats } from "../../services/expenseService";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { startRegistration } from "@simplewebauthn/browser";

function Dashboard({ refresh }) {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total_expenses: 0,
    total_income: 0,
    balance: 0,
    total_transactions: 0,
    today_expenses: 0,
    this_month_expenses: 0
  });

  useEffect(() => {
    loadStats();
  }, [refresh]);

  const loadStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
  };

  const handleSetupFingerprint = async () => {
    try {
      const res = await api.get('/auth/webauthn/register/generate');
      const options = res.data;
      const attResp = await startRegistration({ optionsJSON: options });
      await api.post('/auth/webauthn/register/verify', attResp);
      alert('Fingerprint successfully registered!');
    } catch (err) {
      console.error(err);
      alert('Fingerprint registration failed: ' + (err.message || ''));
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ color: '#3E2723', fontWeight: 'bold', margin: 0 }}>Hi, {user?.username}</h4>
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm" style={{ borderColor: '#D7CCC8', color: '#4E342E' }}>
            Settings
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleSetupFingerprint}>👆 Setup Fingerprint</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={logout} className="text-danger">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4} xs={6}>
          <SummaryCard title="Balance" value={`₹${stats.balance}`} gradientClass="bg-gradient-1" />
        </Col>
        <Col md={4} xs={6}>
          <SummaryCard title="Total Income" value={`₹${stats.total_income}`} gradientClass="bg-gradient-2" />
        </Col>
        <Col md={4} xs={6}>
          <SummaryCard title="Total Expenses" value={`₹${stats.total_expenses}`} gradientClass="bg-gradient-3" />
        </Col>
        <Col md={4} xs={6}>
          <SummaryCard title="Today's Expenses" value={`₹${stats.today_expenses}`} gradientClass="bg-gradient-4" />
        </Col>
        <Col md={4} xs={6}>
          <SummaryCard title="This Month" value={`₹${stats.this_month_expenses}`} gradientClass="bg-gradient-5" />
        </Col>
        <Col md={4} xs={6}>
          <SummaryCard title="Total Transactions" value={stats.total_transactions} gradientClass="bg-gradient-6" />
        </Col>
      </Row>
    </>
  );
}

export default Dashboard;
