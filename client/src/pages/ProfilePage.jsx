import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaArrowLeft, FaEnvelope, FaCalendarAlt, FaMap } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'User';
    const email = localStorage.getItem('email') || 'user@example.com';

    let joinedDate = 'Dec 2025';
    try {
        const storedDate = localStorage.getItem('loginDate');
        if (storedDate) {
            const date = new Date(storedDate);
            if (!isNaN(date.getTime())) {
                joinedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
        }
    } catch (e) {
        console.error("Date parsing error", e);
    }

    return (
        <div className="profile-page-container">
            <div className="profile-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <h1>User Profile</h1>
            </div>

            <div className="profile-card">
                <div className="profile-banner"></div>
                <div className="profile-content">
                    <div className="profile-avatar">
                        <FaUserCircle />
                    </div>
                    <h2 className="profile-name">{username}</h2>
                    <p className="profile-role">MindLink Creator</p>

                    <div className="profile-details">
                        <div className="detail-item">
                            <FaEnvelope className="detail-icon" />
                            <span>{email}</span>
                        </div>
                        <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <span>Joined {joinedDate}</span>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-box">
                            <span className="stat-value">Active</span>
                            <span className="stat-label">Status</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-value">Free</span>
                            <span className="stat-label">Plan</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
