import { Container } from "react-bootstrap";

function Layout({ children }) {
  return (
    <div className="main-content">
      <Container fluid className="py-4">
        {children}
      </Container>
    </div>
  );
}

export default Layout;
