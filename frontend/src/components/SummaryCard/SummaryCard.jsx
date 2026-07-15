import { Card } from "react-bootstrap";

function SummaryCard({ title, value, gradientClass }) {
  return (
    <Card className={`summary-card shadow-sm h-100 ${gradientClass || ''}`}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>

        <h2>{value}</h2>
      </Card.Body>
    </Card>
  );
}

export default SummaryCard;
