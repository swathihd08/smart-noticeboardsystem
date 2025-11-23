import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Modal, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [notices, setNotices] = useState([]);
    const [show, setShow] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [currentNotice, setCurrentNotice] = useState({ 
        _id: '', title: '', content: '', category: 'Academics' 
    });
    
    const [file, setFile] = useState(null);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const API_URL = `${process.env.REACT_APP_API_URL}/notices`;

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
            navigate('/login');
        } else {
            fetchNotices();
        }
    }, [user, navigate]); 

    const fetchNotices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(API_URL, config);
            setNotices(data);
        } catch (error) { console.error(error); }
    };

    const handleClose = () => {
        setShow(false);
        setIsEditing(false);
        setFile(null);
        setUploading(false);
        setCurrentNotice({ _id: '', title: '', content: '', category: 'Academics' });
    };

    const handleShow = () => setShow(true);

    const handleEdit = (notice) => {
        setCurrentNotice(notice);
        setIsEditing(true);
        handleShow();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this notice?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`${API_URL}/${id}`, config);
                fetchNotices();
            } catch (error) { alert("Delete failed"); }
        }
    };

    // --- SMART UPLOAD FUNCTION (FIXED FOR PDFS) ---
    const uploadFileToCloudinary = async () => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'college_preset'); 
        formData.append('cloud_name', 'dyiz54vhg'); 

        // SMART CHECK: If it's a PDF, use 'raw'. If it's an image, use 'auto'.
        // 'raw' is safer for documents like PDFs, Docs, etc.
        const resourceType = file.type.includes('pdf') ? 'raw' : 'auto';

        try {
            setUploading(true);
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/dyiz54vhg/${resourceType}/upload`, 
                formData
            );
            setUploading(false);
            return res.data.secure_url;
        } catch (error) {
            setUploading(false);
            console.error("Cloudinary Upload Error:", error);
            alert("File upload failed!");
            return null;
        }
    };
    // ----------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let fileUrl = currentNotice.fileUrl;

        if (file) {
            fileUrl = await uploadFileToCloudinary();
            if (!fileUrl) return; 
        }

        const noticeData = {
            title: currentNotice.title,
            content: currentNotice.content,
            category: currentNotice.category,
            fileUrl: fileUrl
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        };

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${currentNotice._id}`, noticeData, config);
            } else {
                await axios.post(API_URL, noticeData, config);
            }
            fetchNotices();
            handleClose();
        } catch (error) {
            console.error("Save Error:", error);
            alert("Failed to save notice.");
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map((notice) => (
                        <tr key={notice._id}>
                            <td><Badge bg="info">{notice.category}</Badge></td>
                            <td>{notice.title}</td>
                            <td>{notice.content.substring(0, 50)}...</td>
                            <td>
                                {notice.fileUrl ? 
                                    <a href={notice.fileUrl} target="_blank" rel="noreferrer">View 📎</a> 
                                    : 'None'}
                            </td>
                            <td>
                                <Button variant="light" size="sm" className="me-2" onClick={() => handleEdit(notice)}>Edit</Button>
                                {(user.role === 'admin' || user._id === notice.author) && (
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(notice._id)}>Delete</Button>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" value={currentNotice.title} onChange={(e) => setCurrentNotice({...currentNotice, title: e.target.value})} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={currentNotice.category} onChange={(e) => setCurrentNotice({...currentNotice, category: e.target.value})}>
                                <option>Academics</option>
                                <option>Events</option>
                                <option>Exams</option>
                                <option>Placements</option>
                                <option>Holidays</option>
                                <option>Emergency Alerts</option>
                                <option>Sports</option>
                                <option>Library</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Content</Form.Label>
                            <Form.Control as="textarea" rows={3} value={currentNotice.content} onChange={(e) => setCurrentNotice({...currentNotice, content: e.target.value})} required />
                        </Form.Group>
                        
                        {!isEditing && (
                            <Form.Group className="mb-3">
                                <Form.Label>Attach File (PDF/Image)</Form.Label>
                                <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
                            </Form.Group>
                        )}

                        <Button variant="primary" type="submit" disabled={uploading}>
                            {uploading ? <Spinner animation="border" size="sm" /> : (isEditing ? 'Update' : 'Create')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminDashboard;