import Dashboard from "../components/Dashboard/Dashboard";
import ExpenseForm from "../components/ExpenseForm/ExpenseForm";
import ExpenseList from "../components/ExpenseList/ExpenseList";
import ExpenseCharts from "../components/Charts/ExpenseCharts";

function Home({ refresh, reloadExpenses }) {
  return (
    <>
      <Dashboard refresh={refresh} />
      
      <ExpenseCharts refresh={refresh} />

      <br />

      <ExpenseForm reloadExpenses={reloadExpenses} />

      <br />

      <ExpenseList refresh={refresh} reloadExpenses={reloadExpenses} />
    </>
  );
}

export default Home;
