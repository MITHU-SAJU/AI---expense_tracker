import { useState } from "react";
import { Form, Button, Card, InputGroup, Spinner, Alert, Row, Col } from "react-bootstrap";
import { addExpense, parseTextWithAI } from "../../services/expenseService";

function ExpenseForm({ reloadExpenses }) {
  const [expense, setExpense] = useState({
    amount: "",
    category: "",
    description: "",
    type: "expense",
  });
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [recognizedText, setRecognizedText] = useState("");

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
    setRecognizedText("");
    setAiError("");
  };

  const startListening = () => {
    setAiError("");
    setRecognizedText("");
    
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      setIsListening(false);
      const text = event.results[0][0].transcript;
      setRecognizedText(text);
      processTextWithAI(text);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setAiError(`Microphone error: ${event.error}`);
    };

    recognition.start();
  };
  
  const processTextWithAI = async (text) => {
    setIsProcessing(true);
    try {
      const parsedData = await parseTextWithAI(text);
      
      if (parsedData.error) {
        setAiError(parsedData.error);
      } else {
        setExpense({
          amount: parsedData.amount || "",
          category: parsedData.category || "Others",
          description: parsedData.description || text,
          type: parsedData.type || "expense"
        });
      }
    } catch (err) {
      setAiError("Failed to parse AI response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Add Expense</Card.Title>
          <Button 
            variant={isListening ? "danger" : "outline-primary"} 
            onClick={startListening}
            disabled={isProcessing}
            title="Use AI Voice Input"
          >
            {isListening ? "🎙️ Listening..." : "🎤 AI Voice Input"}
          </Button>
        </div>
        
        {recognizedText && (
          <Alert variant="info" className="py-2">
            <strong>Heard:</strong> "{recognizedText}"
          </Alert>
        )}
        
        {isProcessing && (
          <Alert variant="warning" className="py-2 d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            AI is analyzing your input...
          </Alert>
        )}
        
        {aiError && (
          <Alert variant="danger" className="py-2">
            {aiError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={expense.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={expense.type}
                  onChange={handleChange}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
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
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={expense.description}
                  onChange={handleChange}
                  placeholder="Example: Lunch"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" variant="primary" className="w-100" disabled={isProcessing}>
            Save Record
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ExpenseForm;
