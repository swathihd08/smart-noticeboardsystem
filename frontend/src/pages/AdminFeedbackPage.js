import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Container, Modal } from 'react-bootstrap';
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
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchFeedbacks();
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchFeedbacks = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/feedback`, config);
        setFeedbacks(data);
    };

    const handleReplyClick = (id) => {
        setSelectedId(id);
        setShowModal(true);
    };

    const submitReply = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`${API_URL}/feedback/${selectedId}/reply`, { reply: replyMsg }, config);
        setShowModal(false);
        setReplyMsg('');
        fetchFeedbacks();
    };

    return (
        <Container>
            <h1>User Feedback</h1>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Message</th>
                        <th>Reply</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.map((item) => (
                        <tr key={item._id}>
                            <td>{item.user ? item.user.name : 'Unknown'}</td>
                            <td>{item.message}</td>
                            <td>{item.reply || '-'}</td>
                            <td>
                                <Button size="sm" onClick={() => handleReplyClick(item._id)}>
                                    {item.reply ? 'Edit Reply' : 'Reply'}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Send Reply</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={replyMsg} 
                        onChange={(e) => setReplyMsg(e.target.value)} 
                        placeholder="Type your reply here..."
                    />
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