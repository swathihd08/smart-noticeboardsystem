import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Use env variable
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
            setMessage(data.msg);
            setError('');
        } catch (err) {
            setError('Email not found or could not send mail');
            setMessage('');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Forgot Password</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3">
                    <Form.Label>Enter your registered email</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
                <Button variant="primary" type="submit">Send Reset Link</Button>
            </Form>
        </Container>
    );
};

export default ForgotPasswordPage;