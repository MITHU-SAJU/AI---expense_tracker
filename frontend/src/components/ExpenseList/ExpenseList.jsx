import { useEffect, useState } from "react";
import { Table, Card, Badge, Button, Modal, Form, Spinner, InputGroup, Pagination } from "react-bootstrap";
import { getExpenses, deleteExpense, updateExpense } from "../../services/expenseService";

function ExpenseList({ refresh, reloadExpenses }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Pagination & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State for delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // State for edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    category: "",
    description: "",
    type: "expense"
  });

  useEffect(() => {
    loadExpenses();
  }, [refresh]);

  const loadExpenses = async () => {
    setIsLoading(true);
    const data = await getExpenses();
    setExpenses(data);
    setIsLoading(false);
  };

  const confirmDelete = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (expenseToDelete) {
      await deleteExpense(expenseToDelete._id);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      if (reloadExpenses) reloadExpenses();
    }
  };

  const handleEditClick = (expense) => {
    setExpenseToEdit(expense);
    setEditFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      type: expense.type
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (expenseToEdit) {
      await updateExpense(expenseToEdit._id, {
        amount: parseFloat(editFormData.amount),
        category: editFormData.category,
        description: editFormData.description,
        type: editFormData.type
      });
      setShowEditModal(false);
      setExpenseToEdit(null);
      if (reloadExpenses) reloadExpenses();
    }
  };
  
  // Date filtering logic
  const isWithinDateFilter = (dateString, filter) => {
    if (filter === "all") return true;
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Set time to start of day for comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    
    if (filter === "today") {
      return date >= startOfToday;
    } else if (filter === "yesterday") {
      return date >= startOfYesterday && date < startOfToday;
    } else if (filter === "week") {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 7); // roughly last 7 days
      return date >= startOfWeek;
    } else if (filter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    return true;
  };

  // Derived state for display
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = isWithinDateFilter(expense.created_at, dateFilter);
    return matchesSearch && matchesDate;
  });
  
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
            <Card.Title className="mb-0">Recent Transactions</Card.Title>
            <div className="d-flex gap-2">
              <Form.Select 
                style={{ width: '150px' }}
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
              </Form.Select>
              <InputGroup style={{ width: '250px' }}>
                <Form.Control
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
              </InputGroup>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading transactions...</p>
            </div>
          ) : (
            <>
              <Table responsive striped bordered hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-muted">
                        No expenses found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((expense) => (
                      <tr key={expense._id}>
                        <td className="text-muted" style={{ fontSize: '0.9em' }}>
                          {formatDate(expense.created_at)}
                        </td>
                        <td>
                          <Badge bg="info" text="dark" className="px-2 py-1">
                            {expense.category}
                          </Badge>
                        </td>
                        <td>{expense.description}</td>
                        <td className="fw-bold">₹{expense.amount}</td>
                        <td>
                          <Badge bg={expense.type === "income" ? "success" : "danger"}>
                            {expense.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(expense)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(expense)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-3">
                  <Pagination size="sm">
                    <Pagination.Prev 
                      disabled={currentPage === 1} 
                      onClick={() => handlePageChange(currentPage - 1)} 
                    />
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item 
                        key={i + 1} 
                        active={i + 1 === currentPage}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      disabled={currentPage === totalPages} 
                      onClick={() => handlePageChange(currentPage + 1)} 
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this {expenseToDelete?.type}?
          {expenseToDelete && (
            <div className="mt-3 p-3 bg-light rounded">
              <strong>{expenseToDelete.category}</strong>: {expenseToDelete.description}<br/>
              <span className="fw-bold fs-5 text-danger">₹{expenseToDelete.amount}</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Record</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={editFormData.amount}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={editFormData.category}
                onChange={handleEditFormChange}
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
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={editFormData.type}
                onChange={handleEditFormChange}
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default ExpenseList;
