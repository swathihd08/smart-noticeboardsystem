import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Table, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const FeedbackPage = () => {
    const [message, setMessage] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [success, setSuccess] = useState(null);
    const { user } = useContext(AuthContext);

    // Use the environment variable for the API URL
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (user) {
            fetchMyFeedback();
        }
    }, [user]);

    const fetchMyFeedback = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/feedback/my`, config);
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedback", error);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/feedback`, { message }, config);
            setMessage('');
            setSuccess('Feedback sent successfully!');
            
            // Refresh the list immediately
            fetchMyFeedback();
            
            // Clear alert after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error("Error sending feedback", error);
            alert("Failed to send feedback");
        }
    };

    // --- NEW DELETE FUNCTION ---
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this feedback?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`${API_URL}/feedback/${id}`, config);
                
                // Refresh the list to remove the deleted item
                fetchMyFeedback();
            } catch (error) {
                console.error("Error deleting feedback", error);
                alert('Failed to delete feedback');
            }
        }
    };

    return (
        <Container>
            <h1 className="mb-3">Send Feedback / Support</h1>
            
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={submitHandler} className="mb-5">
                <Form.Group controlId="message">
                    <Form.Label>Your Message</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        placeholder="Describe your issue or suggestion..."
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
                        <th>Action</th> {/* New Column */}
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.length > 0 ? (
                        feedbacks.map((item) => (
                            <tr key={item._id}>
                                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td>{item.message}</td>
                                <td className={item.reply ? "text-success" : "text-muted"}>
                                    {item.reply || "Pending reply..."}
                                </td>
                                <td>
                                    {/* Delete Button */}
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => handleDelete(item._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">No feedback sent yet.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default FeedbackPage;