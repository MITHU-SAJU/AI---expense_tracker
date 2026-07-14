import { Container } from "react-bootstrap";

function Layout({ children }) {
  return <Container className="py-4">{children}</Container>;
}

export default Layout;
