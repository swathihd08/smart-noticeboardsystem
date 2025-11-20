import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Table, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const FeedbackPage = () => {
    const [message, setMessage] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [success, setSuccess] = useState(null);
    const { user } = useContext(AuthContext);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchMyFeedback();
    }, []);

    const fetchMyFeedback = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/feedback/my`, config);
        setFeedbacks(data);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post(`${API_URL}/feedback`, { message }, config);
        setMessage('');
        setSuccess('Feedback sent successfully!');
        fetchMyFeedback();
    };

    return (
        <Container>
            <h1>Send Feedback</h1>
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={submitHandler} className="mb-4">
                <Form.Group controlId="message">
                    <Form.Label>Your Message</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        required 
                    />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3">Submit Feedback</Button>
            </Form>

            <h3>My Feedback History</h3>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Message</th>
                        <th>Admin Reply</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.map((item) => (
                        <tr key={item._id}>
                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td>{item.message}</td>
                            <td className={item.reply ? "text-success" : "text-muted"}>
                                {item.reply || "Pending reply..."}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default FeedbackPage;