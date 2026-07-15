import { useState, useEffect } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { addExpense, parseTextWithAI } from "../../services/expenseService";

function VoiceModal({ show, onHide, reloadExpenses }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (show) {
      setAiError("");
      setRecognizedText("");
      setSuccess(false);
      startListening();
    }
  }, [show]);

  const startListening = () => {
    setAiError("");
    setRecognizedText("");
    setSuccess(false);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

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
        await addExpense({
          amount: Number(parsedData.amount) || 0,
          category: parsedData.category || "Others",
          description: parsedData.description || text,
          type: parsedData.type || "expense"
        });
        setSuccess(true);
        if (reloadExpenses) reloadExpenses();
        setTimeout(() => {
          onHide();
        }, 1500);
      }
    } catch (err) {
      setAiError("Failed to parse AI response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>AI Voice Input</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        {isListening ? (
          <div>
            <div className="mic-animation mb-3">🎙️</div>
            <h5>Listening... Speak now</h5>
            <p className="text-muted">Example: "Added 500 rupees for petrol"</p>
          </div>
        ) : isProcessing ? (
          <div>
            <Spinner animation="border" className="mb-3 text-primary" />
            <h5>Analyzing your input...</h5>
          </div>
        ) : success ? (
          <div>
            <h1 className="text-success mb-3">✅</h1>
            <h5>Expense Added Successfully!</h5>
          </div>
        ) : (
          <div>
            <Button variant="primary" size="lg" onClick={startListening} className="rounded-circle p-4 mb-3">
              🎤
            </Button>
            <h5>Tap to try again</h5>
          </div>
        )}

        {recognizedText && (
          <Alert variant="info" className="mt-4 text-start">
            <strong>You said:</strong> "{recognizedText}"
          </Alert>
        )}

        {aiError && (
          <Alert variant="danger" className="mt-4 text-start">
            {aiError}
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default VoiceModal;
