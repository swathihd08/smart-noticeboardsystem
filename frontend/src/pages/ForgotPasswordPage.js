import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import emailjs from '@emailjs/browser';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            // 1. Ask Backend to generate a secure token
            const { data } = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
            
            // 2. Construct the Reset Link
            const resetLink = `${window.location.origin}/reset-password/${data.resetToken}`;

            // 3. Prepare EmailJS Parameters (Must match your Template variables!)
            const templateParams = {
                to_email: email,       // Matches {{to_email}} in your template
                reset_link: resetLink  // Matches {{reset_link}} in your template
            };

            // 4. Send the Email
            await emailjs.send(
                'service_qywmlqt',   // Paste Service ID from EmailJS
                'template_0p5wzto',  // Paste Template ID from EmailJS
                templateParams,
                'fw5rAm6iJgU-vd77e'    // Paste Public Key (Account -> General)
            );

            setMessage('✅ Email sent successfully! Check your inbox.');
        } catch (err) {
            console.error(err);
            // Even if user not found, sometimes it's safer to show a generic message, 
            // but for this project:
            setError('User not found or failed to send email.');
        } finally {
            setLoading(false);
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
                    <Form.Control 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Sending Email...' : 'Send Reset Link'}
                </Button>
            </Form>
        </Container>
    );
};

export default ForgotPasswordPage;