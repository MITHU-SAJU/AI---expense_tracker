import { Card } from "react-bootstrap";

function SummaryCard({ title, value }) {
  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title>{title}</Card.Title>

        <h2 className="text-primary">{value}</h2>
      </Card.Body>
    </Card>
  );
}

export default SummaryCard;
