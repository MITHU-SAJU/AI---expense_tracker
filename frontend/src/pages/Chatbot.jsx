import { useState } from "react";
import { Card, Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { getAIChatResponse } from "../services/expenseService";

function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your AI Expense Assistant. Ask me anything about your finances.", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await getAIChatResponse(userMessage.text);
      const aiMessage = { text: response.reply || "Sorry, I couldn't process that.", sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Error communicating with AI.", sender: "ai" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="shadow-sm mt-4">
      <Card.Header className="bg-primary text-white">
        <strong>AI Assistant</strong>
      </Card.Header>
      <Card.Body style={{ height: "400px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div className="flex-grow-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded text-white ${
                msg.sender === "user" ? "bg-secondary ms-auto" : "bg-primary me-auto"
              }`}
              style={{ maxWidth: "75%", width: "fit-content" }}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="mb-3 p-3 rounded bg-primary text-white me-auto" style={{ maxWidth: "75%", width: "fit-content" }}>
              <Spinner animation="grow" size="sm" />
              <Spinner animation="grow" size="sm" className="mx-1" />
              <Spinner animation="grow" size="sm" />
            </div>
          )}
        </div>
      </Card.Body>
      <Card.Footer>
        <Form onSubmit={handleSend}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Ask about your expenses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <Button type="submit" variant="primary" disabled={isTyping}>
              Send
            </Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  );
}

export default Chatbot;
