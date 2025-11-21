import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [notices, setNotices] = useState([]);
    const [show, setShow] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Updated default category
    const [currentNotice, setCurrentNotice] = useState({ 
        _id: '', 
        title: '', 
        content: '', 
        category: 'Academics' 
    });
    
    // New state for file
    const [file, setFile] = useState(null);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const API_URL = `${process.env.REACT_APP_API_URL}/notices`;
    // Helper to get the base URL (e.g., http://localhost:5000) for file links
    const BASE_URL = process.env.REACT_APP_API_URL.replace('/api', '');

    useEffect(() => {
        // Allow access if user is Admin OR Faculty
        if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
            navigate('/login');
        } else {
            fetchNotices();
        }
    }, [user, navigate]); 

    const fetchNotices = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(API_URL, config);
            setNotices(data);
        } catch (error) {
            console.error("Error fetching notices", error);
        }
    };

    const handleClose = () => {
        setShow(false);
        setIsEditing(false);
        setFile(null); // Reset file
        setCurrentNotice({ _id: '', title: '', content: '', category: 'Academics' });
    };

    const handleShow = () => setShow(true);

    const handleEdit = (notice) => {
        setCurrentNotice(notice);
        setIsEditing(true);
        setFile(null); // Reset file on edit start
        handleShow();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`${API_URL}/${id}`, config);
                fetchNotices();
            } catch (error) {
                console.error("Failed to delete notice", error);
                alert("You are not authorized to delete this notice.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // CREATE MODE (With File Support)
            if (!isEditing) {
                const formData = new FormData();
                formData.append('title', currentNotice.title);
                formData.append('content', currentNotice.content);
                formData.append('category', currentNotice.category);
                if (file) {
                    formData.append('noticeFile', file);
                }

                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Crucial for files
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                
                await axios.post(API_URL, formData, config);
            } 
            // UPDATE MODE (Text only for simplicity)
            else {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                
                await axios.put(
                    `${API_URL}/${currentNotice._id}`, 
                    { 
                        title: currentNotice.title, 
                        content: currentNotice.content, 
                        category: currentNotice.category 
                    }, 
                    config
                );
            }

            fetchNotices();
            handleClose();
        } catch (error) {
            console.error("Failed to save notice", error);
            alert("Failed to save notice. Please try again.");
        }
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
                        <th>Category</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Attachment</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map((notice) => (
                        <tr key={notice._id}>
                            <td><Badge bg="info">{notice.category || 'General'}</Badge></td>
                            <td>{notice.title}</td>
                            <td>{notice.content.substring(0, 50)}...</td>
                            <td>
                                {notice.fileUrl ? (
                                    <a 
                                        href={notice.fileUrl}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        View File 📎
                                    </a>
                                ) : (
                                    <span className="text-muted">None</span>
                                )}
                            </td>
                            <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button variant="light" className="btn-sm me-2" onClick={() => handleEdit(notice)}>Edit</Button>
                                
                                {/* Delete Logic: Show if Admin OR if User matches Author */}
                                {(user.role === 'admin' || (user._id && notice.author && user._id === notice.author)) && (
                                    <Button variant="danger" className="btn-sm" onClick={() => handleDelete(notice._id)}>Delete</Button>
                                )}
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
                            <Form.Control 
                                type="text" 
                                value={currentNotice.title} 
                                onChange={(e) => setCurrentNotice({ ...currentNotice, title: e.target.value })} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group controlId="category" className="mt-2">
                            <Form.Label>Category</Form.Label>
                            <Form.Select 
                                value={currentNotice.category} 
                                onChange={(e) => setCurrentNotice({ ...currentNotice, category: e.target.value })}
                            >
                                <option value="Academics">Academics</option>
                                <option value="Events">Events</option>
                                <option value="Placements">Placements</option>
                                <option value="Exams">Exams</option>
                                <option value="Holidays">Holidays</option>
                                <option value="Emergency Alerts">Emergency Alerts</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group controlId="content" className="mt-2">
                            <Form.Label>Content</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                value={currentNotice.content} 
                                onChange={(e) => setCurrentNotice({ ...currentNotice, content: e.target.value })} 
                                required 
                            />
                        </Form.Group>

                        {/* File Upload - Only show in Create mode to keep it simple */}
                        {!isEditing && (
                            <Form.Group controlId="file" className="mt-2">
                                <Form.Label>Attach File (PDF/Image)</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    onChange={(e) => setFile(e.target.files[0])} 
                                />
                            </Form.Group>
                        )}

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