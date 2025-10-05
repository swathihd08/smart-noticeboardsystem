import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            alert('Invalid credentials');
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col xs={12} md={6}>
                    <h1>Sign In</h1>
                    <Form onSubmit={submitHandler}>
                        <Form.Group controlId="email">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)}></Form.Control>
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                        </Form.Group>
                        <Button type="submit" variant="primary" className="mt-3">Sign In</Button>
                    </Form>
                    <Row className="py-3">
                        <Col>
                            New Customer? <Link to="/register">Register</Link>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;