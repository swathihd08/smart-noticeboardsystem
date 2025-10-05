import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [notices, setNotices] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    useEffect(() => {
    if (!user) {
        navigate('/login');
    } else {
        const fetchNotices = async () => {
            // --- THIS CONFIG OBJECT IS CRUCIAL ---
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
           const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/notices`, config);
        };
        fetchNotices();
    }
}, [user, navigate]);

    return (
        <>
            <h1>Latest Notices</h1>
            <Row>
                {notices.map((notice) => (
                    <Col key={notice._id} sm={12} md={6} lg={4} xl={3}>
                        <Card className="my-3 p-3 rounded">
                            <Card.Body>
                                <Card.Title as="div">
                                    <strong>{notice.title}</strong>
                                </Card.Title>
                                <Card.Text as="p">{notice.content}</Card.Text>
                                <Card.Text as="small" className="text-muted">
                                    Posted on {new Date(notice.createdAt).toLocaleDateString()}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default HomePage;