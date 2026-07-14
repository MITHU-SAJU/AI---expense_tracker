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
      <Col md={4} sm={6}>
        <SummaryCard title="Balance" value={`₹${stats.balance}`} />
      </Col>
      <Col md={4} sm={6}>
        <SummaryCard title="Total Income" value={`₹${stats.total_income}`} />
      </Col>
      <Col md={4} sm={6}>
        <SummaryCard title="Total Expenses" value={`₹${stats.total_expenses}`} />
      </Col>
      <Col md={4} sm={6}>
        <SummaryCard title="Today's Expenses" value={`₹${stats.today_expenses}`} />
      </Col>
      <Col md={4} sm={6}>
        <SummaryCard title="This Month" value={`₹${stats.this_month_expenses}`} />
      </Col>
      <Col md={4} sm={6}>
        <SummaryCard title="Total Transactions" value={stats.total_transactions} />
      </Col>
    </Row>
  );
}

export default Dashboard;
