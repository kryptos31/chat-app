/* REACT MODULES */
import {Container, Navbar, Nav, Offcanvas, Card} from 'react-bootstrap';
import {useState, useEffect, useContext} from 'react';
import {NavLink, Link} from 'react-router-dom';

import UserContext from '../UserContext';



export default function AppNavBar(){

    const {user, currentPage} = useContext(UserContext);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

	return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container className="col-2 col-sm-2 col-md-1 col-lg-4">
                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-lg-none" onClick={handleShow} />
                    <Nav className="d-none d-lg-block">
                        <Nav.Item>
                          <Nav.Link href="/home">Channels</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Container>
                <Nav className="justify-content-left col-10 col-sm-10 col-md-11 col-lg-8">
                    <Nav.Item className="mx-3">
                      <Nav.Link href="/home">Welcome</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Navbar>
            <Offcanvas show={show} onHide={handleClose} responsive="lg" className="col-lg-4">
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>Channels</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="flex-column">
                   <Card className={'p-2'}>Channel</Card>
                   <Card className={'p-2'}>Channel</Card>
                   <Card className={'p-2'}>Channel</Card>
                   <Card className={'p-2'}>Channel</Card>
                   <Card className={'p-2'}>Channel</Card>
                </Offcanvas.Body>
            </Offcanvas>
        </>
	)
}