import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Form, Badge, Container } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [notices, setNotices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDate, setFilterDate] = useState('All');

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            const fetchNotices = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/notices`, config);
                    setNotices(data);
                } catch (error) { console.error("Error loading notices", error); }
            };
            fetchNotices();
        }
    }, [user, navigate]);

    const filteredNotices = notices.filter(notice => {
        const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              notice.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || notice.category === filterCategory;
        
        let matchesDate = true;
        const noticeDate = new Date(notice.createdAt);
        const today = new Date();
        
        if (filterDate === 'Today') matchesDate = noticeDate.toDateString() === today.toDateString();
        else if (filterDate === 'This Week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            matchesDate = noticeDate >= oneWeekAgo;
        } else if (filterDate === 'This Month') {
            matchesDate = noticeDate.getMonth() === today.getMonth() && noticeDate.getFullYear() === today.getFullYear();
        }

        return matchesSearch && matchesCategory && matchesDate;
    });

    const getBadgeColor = (category) => {
        switch(category) {
            case 'Academics': return 'primary';
            case 'Exams': return 'danger';
            case 'Events': return 'success';
            case 'Placements': return 'warning';
            case 'Holidays': return 'info';
            case 'Emergency Alerts': return 'dark';
            // --- NEW COLORS ---
            case 'Sports': return 'success';
            case 'Library': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <Container>
            <h1 className="mb-4 text-center">Notice Board</h1>
            <Row className="mb-4 g-2">
                <Col md={5}>
                    <Form.Control type="text" placeholder="🔍 Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </Col>
                <Col md={4}>
                    <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Academics">Academics</option>
                        <option value="Events">Events</option>
                        <option value="Placements">Placements</option>
                        <option value="Exams">Exams</option>
                        <option value="Holidays">Holidays</option>
                        <option value="Emergency Alerts">Emergency Alerts</option>
                        {/* --- NEW OPTIONS --- */}
                        <option value="Sports">Sports</option>
                        <option value="Library">Library</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row>
                {filteredNotices.length > 0 ? (
                    filteredNotices.map((notice) => (
                        <Col key={notice._id} sm={12} md={6} lg={4} xl={3} className="d-flex align-items-stretch">
                            <Card className="my-3 rounded shadow-sm w-100 border-0">
                                <Card.Header className="bg-white border-bottom-0 pt-3">
                                    <Badge bg={getBadgeColor(notice.category)}>{notice.category || 'General'}</Badge>
                                </Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title as="h5" className="mb-3">{notice.title}</Card.Title>
                                    <Card.Text className="flex-grow-1 text-secondary">
                                        {notice.content.length > 100 ? notice.content.substring(0, 100) + '...' : notice.content}
                                    </Card.Text>
                                    {notice.fileUrl && (
                                        <div className="mt-3 mb-2">
                                            {/* Updated Link logic to ensure new tab */}
                                            <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary w-100">
                                                📄 View Attachment
                                            </a>
                                        </div>
                                    )}
                                    <Card.Text as="small" className="text-muted mt-auto pt-3 border-top">
                                        🕒 {new Date(notice.createdAt).toLocaleDateString()}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col className="text-center mt-5"><h4>No notices found.</h4></Col>
                )}
            </Row>
        </Container>
    );
};

export default HomePage;