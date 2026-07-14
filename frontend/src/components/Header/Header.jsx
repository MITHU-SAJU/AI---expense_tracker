import { Navbar, Container, Nav } from "react-bootstrap";

function Header({ currentPage, setCurrentPage }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand 
          style={{ cursor: "pointer" }} 
          onClick={() => setCurrentPage("home")}
        >
          💰 AI Expense Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              active={currentPage === "home"} 
              onClick={() => setCurrentPage("home")}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              active={currentPage === "chatbot"} 
              onClick={() => setCurrentPage("chatbot")}
            >
              🤖 AI Chat Assistant
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
