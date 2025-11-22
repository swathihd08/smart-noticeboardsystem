import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [demoLink, setDemoLink] = useState(''); // State to store the link
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setDemoLink('');

        try {
            // 1. Ask Backend to generate a token
            const { data } = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
            
            // 2. Construct the Link manually in the frontend
            const resetLink = `${window.location.origin}/reset-password/${data.resetToken}`;

            // --- DEMO MODE: Display link on screen instead of emailing ---
            setMessage('Success! Since this is a demo, click the link below to reset:');
            setDemoLink(resetLink);
            // -------------------------------------------------------------

        } catch (err) {
            console.error(err);
            setError('User not found.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <h2>Forgot Password</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {/* Success Message */}
            {message && <Alert variant="success">{message}</Alert>}

            {/* THE MAGIC LINK (Simulates the Email) */}
            {demoLink && (
                <Card className="mb-4 p-3 bg-light border-success">
                    <h5>📧 Simulated Email Inbox</h5>
                    <p>Subject: Password Reset Request</p>
                    <hr />
                    <p>Click this link to reset your password:</p>
                    <a href={demoLink} className="btn btn-success">Reset Password Now</a>
                </Card>
            )}

            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3">
                    <Form.Label>Enter your registered email</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Generating Link...' : 'Get Reset Link'}
                </Button>
            </Form>
        </Container>
    );
};

export default ForgotPasswordPage;