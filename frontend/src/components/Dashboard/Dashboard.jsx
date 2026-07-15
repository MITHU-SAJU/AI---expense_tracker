import { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import SummaryCard from "../SummaryCard/SummaryCard";
import { getDashboardStats } from "../../services/expenseService";

function Dashboard({ refresh }) {
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

  return (
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
  );
}

export default Dashboard;
