import ExpenseCharts from "../components/Charts/ExpenseCharts";
import { Card } from "react-bootstrap";

function ChartsPage({ refresh }) {
  return (
    <div>
      <h2 className="mb-4">Expense Analytics</h2>
      <Card className="shadow-sm">
        <Card.Body>
          <ExpenseCharts refresh={refresh} />
        </Card.Body>
      </Card>
    </div>
  );
}

export default ChartsPage;
