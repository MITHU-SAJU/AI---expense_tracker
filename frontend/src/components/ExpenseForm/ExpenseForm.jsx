import { useState } from "react";
import { Form, Button, Card, Row, Col, FloatingLabel } from "react-bootstrap";
import { addExpense } from "../../services/expenseService";

function ExpenseForm({ reloadExpenses }) {
  const [expense, setExpense] = useState({
    amount: "",
    category: "",
    description: "",
    type: "expense",
  });

  const handleChange = (e) => {
    setExpense({
      ...expense,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addExpense({
      ...expense,
      amount: Number(expense.amount),
    });
    alert("Expense Added Successfully");
    reloadExpenses();
    setExpense({
      amount: "",
      category: "",
      description: "",
      type: "expense",
    });
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Add Expense</Card.Title>
        </div>
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
                <FloatingLabel controlId="expenseAmount" label="Amount (₹)" className="mb-3">
                  <Form.Control
                    type="number"
                    name="amount"
                    value={expense.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    required
                  />
                </FloatingLabel>
            </Col>
            <Col md={6}>
                <FloatingLabel controlId="expenseType" label="Type" className="mb-3">
                  <Form.Select
                    name="type"
                    value={expense.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </Form.Select>
                </FloatingLabel>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
                <FloatingLabel controlId="expenseCategory" label="Category" className="mb-3">
                  <Form.Select
                    name="category"
                    value={expense.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Salary">Salary</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Others">Others</option>
                  </Form.Select>
                </FloatingLabel>
            </Col>
            <Col md={6}>
                <FloatingLabel controlId="expenseDescription" label="Description" className="mb-3">
                  <Form.Control
                    type="text"
                    name="description"
                    value={expense.description}
                    onChange={handleChange}
                    placeholder="Example: Lunch"
                    required
                  />
                </FloatingLabel>
            </Col>
          </Row>

          <Button type="submit" variant="primary" className="w-100">
            Save Record
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ExpenseForm;
