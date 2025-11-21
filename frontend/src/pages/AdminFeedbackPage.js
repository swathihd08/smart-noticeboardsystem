import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Container, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminFeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [replyMsg, setReplyMsg] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Use environment variable for API URL
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        // Ensure only Admin can access this page
        if (user && user.role === 'admin') {
            fetchFeedbacks();
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchFeedbacks = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/feedback`, config);
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedback", error);
        }
    };

    const handleReplyClick = (id, existingReply) => {
        setSelectedId(id);
        setReplyMsg(existingReply || ''); // Pre-fill if editing
        setShowModal(true);
    };

    const submitReply = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/feedback/${selectedId}/reply`, { reply: replyMsg }, config);
            setShowModal(false);
            setReplyMsg('');
            fetchFeedbacks(); // Refresh list
        } catch (error) {
            console.error("Error sending reply", error);
            alert("Failed to send reply");
        }
    };

    // --- NEW DELETE REPLY FUNCTION ---
    const handleDeleteReply = async (id) => {
        if (window.confirm('Are you sure you want to remove this reply?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`${API_URL}/feedback/${id}/reply`, config);
                fetchFeedbacks(); // Refresh list immediately
            } catch (error) {
                console.error("Error deleting reply", error);
                alert('Failed to delete reply');
            }
        }
    };

    return (
        <Container>
            <h1 className="mb-4">User Feedback Management</h1>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Message</th>
                        <th>My Reply</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.length > 0 ? (
                        feedbacks.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <strong>{item.user ? item.user.name : 'Unknown User'}</strong>
                                    <br />
                                    <small className="text-muted">{item.user?.email}</small>
                                </td>
                                <td>{item.message}</td>
                                <td>
                                    {item.reply ? (
                                        <div className="d-flex justify-content-between align-items-start bg-light p-2 rounded border">
                                            <span className="text-success">{item.reply}</span>
                                            
                                            {/* Delete Reply Button (X) */}
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                style={{ 
                                                    padding: '0px 6px', 
                                                    fontSize: '0.8rem', 
                                                    marginLeft: '10px',
                                                    lineHeight: '1.2' 
                                                }}
                                                onClick={() => handleDeleteReply(item._id)}
                                                title="Remove Reply"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ) : (
                                        <Badge bg="warning" text="dark">Pending</Badge>
                                    )}
                                </td>
                                <td>
                                    <Button 
                                        size="sm" 
                                        variant="primary"
                                        onClick={() => handleReplyClick(item._id, item.reply)}
                                    >
                                        {item.reply ? 'Edit Reply' : 'Reply'}
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">No feedback received yet.</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Reply Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Send Reply</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Type your response:</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={replyMsg} 
                            onChange={(e) => setReplyMsg(e.target.value)} 
                            placeholder="Enter reply here..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={submitReply}>Send Reply</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminFeedbackPage;