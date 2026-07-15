import Dashboard from "../components/Dashboard/Dashboard";
import ExpenseForm from "../components/ExpenseForm/ExpenseForm";
import ExpenseList from "../components/ExpenseList/ExpenseList";

function Home({ refresh, reloadExpenses }) {
  return (
    <>
      <Dashboard refresh={refresh} />
      
      <br />

      <ExpenseForm reloadExpenses={reloadExpenses} />

      <br />

      <ExpenseList refresh={refresh} reloadExpenses={reloadExpenses} />
    </>
  );
}

export default Home;
