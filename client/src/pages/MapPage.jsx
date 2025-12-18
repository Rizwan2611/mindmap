import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { FaUserCircle, FaSignOutAlt, FaMapMarkedAlt, FaMoon, FaSun, FaShareAlt, FaCopy, FaTimes } from 'react-icons/fa';
import Canvas from '../components/MindMap/Canvas';
import './MapPage.css';

import { socket } from '../socket';


const MapPage = () => {
    const navigate = useNavigate();
    const { mapId } = useParams();
    const [title, setTitle] = useState('Untitled Map');
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    // Lifted state from Canvas for Manual Saving
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    // Share State
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    const handleShare = () => {
        setShowShareModal(true);
        setCopySuccess('');
        setInviteStatus(null);
        setInviteEmail('');
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        try {
            const token = localStorage.getItem('token');
            const res = await api.post(`/api/maps/${mapId}/invite`, { email: inviteEmail }, {
                headers: { 'Authorization': token }
            });
            setInviteStatus({ type: 'success', message: `Invited ${res.data.user.username}!` });
            setInviteEmail('');
        } catch (err) {
            setInviteStatus({ type: 'error', message: err.response?.data?.error || 'Failed to invite user.' });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    // Live Users State
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchMapMetadata = async () => {
            try {
                const res = await api.get(`/api/maps/${mapId}`, {
                    headers: { 'Authorization': token }
                });
                setTitle(res.data.title);
                // Load nodes/edges from HTTP as a reliable fallback/initial source
                if (res.data.nodes) setNodes(res.data.nodes);
                if (res.data.edges) setEdges(res.data.edges);
            } catch (err) {
                console.error("Failed to fetch map metadata", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    // Specific handling for 403 Access Denied
                    if (err.response.status === 403) {
                        setError("Access Denied. You are not a collaborator on this map.");
                        return;
                    }
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    navigate('/');
                    return;
                }
                setError("Failed to load map. It might not exist.");
            } finally {
                setLoading(false);
            }
        };

        if (mapId) fetchMapMetadata();
    }, [navigate, mapId]);

    // Connection State
    const [isConnected, setIsConnected] = useState(socket.connected);

    // Socket listener for active users & connection status
    useEffect(() => {
        if (socket) {
            const onConnect = () => setIsConnected(true);
            const onDisconnect = () => setIsConnected(false);

            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);
            socket.on('room-users', (users) => {
                setActiveUsers(users);
            });

            return () => {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
                socket.off('room-users');
            };
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading Editor...</div>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', flexDirection: 'column' }}>
            <div style={{ fontSize: '1.2rem', color: '#ef4444', marginBottom: '20px' }}>{error}</div>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Go to Dashboard</button>
        </div>
    );

    return (
        <div className={`map-page-container ${darkMode ? 'dark' : ''}`} style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: darkMode ? '#1a202c' : '#fff', color: darkMode ? '#fff' : '#333' }}>
            {/* ... Header ... */}
            <div className={`header-bar ${darkMode ? 'dark' : ''}`}>
                <div className="logo-section" onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpg" alt="MindLink Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span className="logo-text" style={{ fontSize: '1rem' }}>MindLink</span>
                </div>

                <div className="user-section">
                    <div style={{
                        marginRight: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: isConnected ? '#10b981' : '#ef4444',
                        fontWeight: '500'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: isConnected ? '#10b981' : '#ef4444',
                            boxShadow: isConnected ? '0 0 5px #10b981' : 'none'
                        }}></div>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                    <button className="share-btn" onClick={handleShare} title="Invite Collaborators">
                        <FaShareAlt /> Share
                    </button>

                    <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme" style={{ marginRight: '15px' }}>
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>

                    <div className="user-profile-container" style={{ position: 'relative' }}>
                        <div className="user-info" onClick={() => setShowProfile(!showProfile)} style={{ cursor: 'pointer' }}>
                            <FaUserCircle size={20} />
                            <span>{localStorage.getItem('username')}</span>
                        </div>
                        {showProfile && (
                            <div className="profile-dropdown" style={{
                                position: 'absolute',
                                top: '48px',
                                right: '0',
                                background: darkMode ? '#1f2937' : 'white',
                                border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                padding: '8px',
                                width: '240px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <div style={{
                                    padding: '12px',
                                    borderBottom: `1px solid ${darkMode ? '#374151' : '#f1f5f9'}`,
                                    marginBottom: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: darkMode ? '#374151' : '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: darkMode ? '#9ca3af' : '#64748b'
                                    }}>
                                        <FaUserCircle size={20} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', color: darkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {localStorage.getItem('username')}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {localStorage.getItem('email') || 'User'}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => navigate('/profile')} className="dropdown-item-btn" style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    color: darkMode ? '#d1d5db' : '#475569',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#374151' : '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <FaUserCircle /> Your Profile
                                </button>

                                <button onClick={handleLogout} className="dropdown-item-btn" style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'transparent', // consistent style
                                    color: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <FaSignOutAlt /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="map-title-section">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="map-title-input"
                    placeholder="Project Name"
                />
                <button className="save-btn" onClick={async () => {
                    try {
                        const token = localStorage.getItem('token');
                        await api.put(`/api/maps/${mapId}`, {
                            title,
                            nodes,
                            edges
                        }, {
                            headers: { 'Authorization': token }
                        });
                        alert("Project saved successfully!");
                    } catch (err) {
                        console.error("Failed to save project", err);
                        alert("Failed to save project.");
                    }
                }}>
                    Save Project
                </button>
            </div>

            {/* Collaborators Sidebar */}
            <div className="collaborators-sidebar">
                <div className="collaborators-header">
                    <span>Active Collaborators</span>
                    <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                        {activeUsers.length}
                    </span>
                </div>
                {activeUsers.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        You are alone in this session.
                    </div>
                ) : (
                    activeUsers.map(user => (
                        <div key={user.id} className="collaborator-item">
                            <div className="collaborator-avatar" style={{ backgroundColor: user.color || '#3b82f6' }}>
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="collaborator-info">
                                <div className="collaborator-name">
                                    {user.username} {user.id === (socket?.id) && '(You)'}
                                </div>
                                <div className="collaborator-status">
                                    <div className="online-dot"></div> Online
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {mapId && <Canvas
                mapId={mapId}
                darkMode={darkMode}
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
            />}

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay">
                    <div className="modal-content share-modal">
                        <div className="modal-header">
                            <h3>Invite Collaborators</h3>
                            <button onClick={() => setShowShareModal(false)} className="close-btn"><FaTimes /></button>
                        </div>
                        <p>Invite users by email or share the link securely.</p>

                        <div className="share-field">
                            <label>Invite by Email</label>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Enter user email..."
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                                <button onClick={handleInvite} style={{ background: '#10b981' }}>
                                    Invite
                                </button>
                            </div>
                            {inviteStatus && (
                                <div style={{
                                    marginTop: '8px',
                                    fontSize: '0.9rem',
                                    color: inviteStatus.type === 'success' ? '#10b981' : '#ef4444'
                                }}>
                                    {inviteStatus.message}
                                </div>
                            )}
                        </div>

                        <div className="share-field">
                            <label>Session Link</label>
                            <div className="input-group">
                                <input type="text" readOnly value={window.location.href} />
                                <button onClick={() => copyToClipboard(window.location.href)} title="Copy Link">
                                    <FaCopy />
                                </button>
                            </div>
                        </div>

                        <div className="share-field">
                            <label>Session ID</label>
                            <div className="input-group">
                                <input type="text" readOnly value={mapId} />
                                <button onClick={() => copyToClipboard(mapId)} title="Copy Session ID">
                                    <FaCopy />
                                </button>
                            </div>
                        </div>

                        {copySuccess && <div className="copy-success">{copySuccess}</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPage;
