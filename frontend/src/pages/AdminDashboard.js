import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [notices, setNotices] = useState([]);
    const [show, setShow] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNotice, setCurrentNotice] = useState({ _id: '', title: '', content: '' });

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const API_URL = `${process.env.REACT_APP_API_URL}/notices`;

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        } else {
            fetchNotices();
        }
    }, [user, navigate]);

    const fetchNotices = async () => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(API_URL, config);
        setNotices(data);
    };

    const handleClose = () => {
        setShow(false);
        setIsEditing(false);
        setCurrentNotice({ _id: '', title: '', content: '' });
    };

    const handleShow = () => setShow(true);

    const handleEdit = (notice) => {
        setCurrentNotice(notice);
        setIsEditing(true);
        handleShow();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/${id}`, config);
            fetchNotices();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
        
        if (isEditing) {
            await axios.put(`${API_URL}/${currentNotice._id}`, { title: currentNotice.title, content: currentNotice.content }, config);
        } else {
            await axios.post(API_URL, { title: currentNotice.title, content: currentNotice.content }, config);
        }
        fetchNotices();
        handleClose();
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Manage Notices</h1>
                <Button variant="primary" onClick={handleShow}>Create Notice</Button>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map((notice) => (
                        <tr key={notice._id}>
                            <td>{notice.title}</td>
                            <td>{notice.content}</td>
                            <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button variant="light" className="btn-sm me-2" onClick={() => handleEdit(notice)}>Edit</Button>
                                <Button variant="danger" className="btn-sm" onClick={() => handleDelete(notice._id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Notice' : 'Create Notice'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" value={currentNotice.title} onChange={(e) => setCurrentNotice({ ...currentNotice, title: e.target.value })} required />
                        </Form.Group>
                        <Form.Group controlId="content" className="mt-2">
                            <Form.Label>Content</Form.Label>
                            <Form.Control as="textarea" rows={3} value={currentNotice.content} onChange={(e) => setCurrentNotice({ ...currentNotice, content: e.target.value })} required />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminDashboard;