import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const { resetToken } = useParams(); 
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords don't match");
        }

        try {
            await axios.put(`${API_URL}/auth/resetpassword/${resetToken}`, { password });
            setMessage('Password updated! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('Invalid or expired token');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Reset Password</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </Form.Group>
                <Button variant="primary" type="submit">Update Password</Button>
            </Form>
        </Container>
    );
};

export default ResetPasswordPage;