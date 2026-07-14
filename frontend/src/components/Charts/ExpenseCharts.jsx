import { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { getExpenses } from "../../services/expenseService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF1919", "#19FF66"];

function ExpenseCharts({ refresh }) {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadExpenses();
  }, [refresh]);

  const loadExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data);
  };

  // Prepare data for Category Pie Chart (only expenses)
  const categoryData = expenses
    .filter(e => e.type === "expense")
    .reduce((acc, curr) => {
      const existingCategory = acc.find(item => item.name === curr.category);
      if (existingCategory) {
        existingCategory.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []);

  // Prepare data for Income vs Expense
  const typeData = expenses.reduce((acc, curr) => {
    const existingType = acc.find(item => item.name === curr.type.toUpperCase());
    if (existingType) {
      existingType.value += curr.amount;
    } else {
      acc.push({ name: curr.type.toUpperCase(), value: curr.amount });
    }
    return acc;
  }, []);

  // Prepare data for Last 7 Days (Income vs Expense)
  const last7DaysData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateString = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    
    // Calculate for this specific day
    let dailyExpense = 0;
    let dailyIncome = 0;
    
    expenses.forEach(e => {
      if (e.created_at) {
        const eDate = new Date(e.created_at);
        if (eDate.getDate() === d.getDate() && eDate.getMonth() === d.getMonth() && eDate.getFullYear() === d.getFullYear()) {
          if (e.type === "expense") dailyExpense += e.amount;
          else if (e.type === "income") dailyIncome += e.amount;
        }
      }
    });

    last7DaysData.push({
      name: dateString,
      Expense: dailyExpense,
      Income: dailyIncome
    });
  }

  return (
    <Row className="g-4 mb-4">
      <Col md={6}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Expenses by Category</Card.Title>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Last 7 Days (Income vs Expense)</Card.Title>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={last7DaysData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Bar dataKey="Income" fill="#28a745" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#dc3545" name="Expense" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default ExpenseCharts;
