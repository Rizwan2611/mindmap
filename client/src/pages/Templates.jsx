import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaMoon, FaSun, FaSearch, FaMap } from 'react-icons/fa';
import axios from 'axios';
import './Templates.css';

// Template Data Definitions
const TEMPLATES = {
    BASIC: {
        title: 'Basic Brainstorm',
        nodes: [
            { id: 'root', type: 'text', content: 'Central Idea', x: 400, y: 300, width: 120, height: 60, style: { backgroundColor: '#7C7CFF', color: 'white', fontSize: 16 } },
            { id: 'n1', type: 'text', content: 'Idea 1', x: 400, y: 150, width: 100, height: 50, style: { backgroundColor: '#ffffff', color: '#333' } },
            { id: 'n2', type: 'text', content: 'Idea 2', x: 600, y: 300, width: 100, height: 50, style: { backgroundColor: '#ffffff', color: '#333' } },
            { id: 'n3', type: 'text', content: 'Idea 3', x: 400, y: 450, width: 100, height: 50, style: { backgroundColor: '#ffffff', color: '#333' } },
            { id: 'n4', type: 'text', content: 'Idea 4', x: 200, y: 300, width: 100, height: 50, style: { backgroundColor: '#ffffff', color: '#333' } },
        ],
        edges: [
            { id: 'e1', source: 'root', target: 'n1' },
            { id: 'e2', source: 'root', target: 'n2' },
            { id: 'e3', source: 'root', target: 'n3' },
            { id: 'e4', source: 'root', target: 'n4' },
        ]
    },
    PLANNING: {
        title: 'Project Plan',
        nodes: [
            { id: 'root', type: 'text', content: 'Project Goal', x: 400, y: 100, width: 140, height: 70, style: { backgroundColor: '#00F5D4', color: '#0B0F1A', fontSize: 18, fontWeight: 'bold' } },
            { id: 'p1', type: 'text', content: 'Phase 1', x: 200, y: 250, width: 120, height: 60, style: { backgroundColor: '#e2e8f0', color: '#333' } },
            { id: 'p2', type: 'text', content: 'Phase 2', x: 600, y: 250, width: 120, height: 60, style: { backgroundColor: '#e2e8f0', color: '#333' } },
            { id: 't1', type: 'text', content: 'Task 1.1', x: 100, y: 400, width: 100, height: 50, style: { backgroundColor: '#fff', color: '#555' } },
            { id: 't2', type: 'text', content: 'Task 1.2', x: 300, y: 400, width: 100, height: 50, style: { backgroundColor: '#fff', color: '#555' } },
            { id: 't3', type: 'text', content: 'Task 2.1', x: 500, y: 400, width: 100, height: 50, style: { backgroundColor: '#fff', color: '#555' } },
            { id: 't4', type: 'text', content: 'Task 2.2', x: 700, y: 400, width: 100, height: 50, style: { backgroundColor: '#fff', color: '#555' } },
        ],
        edges: [
            { id: 'e1', source: 'root', target: 'p1' },
            { id: 'e2', source: 'root', target: 'p2' },
            { id: 'e3', source: 'p1', target: 't1' },
            { id: 'e4', source: 'p1', target: 't2' },
            { id: 'e5', source: 'p2', target: 't3' },
            { id: 'e6', source: 'p2', target: 't4' },
        ]
    },
    SYSTEM: {
        title: 'System Architecture',
        nodes: [
            { id: 'core', type: 'text', content: 'Core System', x: 400, y: 300, width: 140, height: 140, style: { backgroundColor: '#FF6AD5', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            { id: 'c1', type: 'text', content: 'Service A', x: 400, y: 100, width: 100, height: 50, style: { backgroundColor: '#334155', color: '#fff' } },
            { id: 'c2', type: 'text', content: 'Service B', x: 600, y: 400, width: 100, height: 50, style: { backgroundColor: '#334155', color: '#fff' } },
            { id: 'c3', type: 'text', content: 'Service C', x: 200, y: 400, width: 100, height: 50, style: { backgroundColor: '#334155', color: '#fff' } },
            { id: 'db', type: 'text', content: 'Database', x: 400, y: 500, width: 100, height: 60, style: { backgroundColor: '#475569', color: '#cbd5e1', border: '2px solid #94a3b8' } },
        ],
        edges: [
            { id: 'e1', source: 'core', target: 'c1' },
            { id: 'e2', source: 'core', target: 'c2' },
            { id: 'e3', source: 'core', target: 'c3' },
            { id: 'e4', source: 'core', target: 'db' },
            { id: 'e5', source: 'c1', target: 'c2' }, // Interconnect
        ]
    }
};

const Templates = () => {
    const navigate = useNavigate();

    // Independent Dark Mode with Persistence
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    const [showProfile, setShowProfile] = useState(false);
    const [loading, setLoading] = useState(false);

    // Sync Dark Mode to LocalStorage
    React.useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    const handleUseTemplate = async (templateKey) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const template = TEMPLATES[templateKey];
        if (!template) return;

        setLoading(true);
        try {
            const res = await axios.post('/api/maps', {
                title: template.title,
                nodes: template.nodes,
                edges: template.edges
            }, {
                headers: { 'Authorization': token }
            });

            // Navigate to the newly created map
            navigate(`/map/${res.data._id}`);
        } catch (err) {
            console.error("Failed to create template map", err);
            alert("Failed to create map from template. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`templates-page-wrapper ${darkMode ? 'dark' : ''}`}>
            {/* Reusing Dashboard-like Header for Consistency */}
            <header className="templates-nav-header">
                <div className="brand-section" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                    <img src="/logo.jpg" alt="MindLink" className="brand-logo" />
                    <h1>MindLink</h1>
                </div>

                <div className="header-right">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input type="text" placeholder="Search templates..." />
                    </div>

                    <div className="action-buttons">
                        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                    </div>

                    <div className="user-profile" onClick={() => setShowProfile(!showProfile)}>
                        <div className="user-avatar">
                            <FaUserCircle />
                        </div>
                        <span className="user-name">{username}</span>

                        {showProfile && (
                            <div className="profile-dropdown">
                                <button onClick={handleLogout} className="full-logout-btn">
                                    <FaSignOutAlt /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="dashboard-body-layout">
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        <button
                            className="nav-item"
                            onClick={() => navigate('/dashboard?view=dashboard')}
                        >
                            <FaMap className="nav-icon" />
                            My Projects
                        </button>
                        <button
                            className="nav-item"
                            onClick={() => navigate('/dashboard?view=live')}
                        >
                            <div className="live-indicator"></div>
                            Live Session
                        </button>
                        <button className="nav-item active">
                            <FaMap className="nav-icon" />
                            Templates
                        </button>
                    </nav>
                </aside>

                <main className="templates-main-content">
                    <div className="templates-hero">
                        <h1>Choose a Template</h1>
                        <p>Start your project with a pre-designed structure.</p>
                    </div>

                    <div className="templates-grid">
                        {/* Basic Template */}
                        <div className="template-card basic">
                            <div className="template-preview">
                                <div className="mini-map basic-map">
                                    <div className="mm-node root"></div>
                                    <div className="mm-node child c1"></div>
                                    <div className="mm-node child c2"></div>
                                    <div className="mm-node child c3"></div>
                                    <div className="mm-node child c4"></div>
                                    <div className="mm-link l1"></div>
                                    <div className="mm-link l2"></div>
                                    <div className="mm-link l3"></div>
                                    <div className="mm-link l4"></div>
                                </div>
                            </div>
                            <div className="template-info">
                                <div className="template-top">
                                    <h3>Basic</h3>
                                    <span className="template-badge free">Free</span>
                                </div>
                                <p>Simple star structure. Ideal for quick brainstorming.</p>
                                <button
                                    className="btn-use-template"
                                    onClick={() => handleUseTemplate('BASIC')}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Use Template'}
                                </button>
                            </div>
                        </div>

                        {/* Intermediate Template */}
                        <div className="template-card intermediate">
                            <div className="template-preview">
                                <div className="mini-map inter-map">
                                    <div className="mm-node root"></div>
                                    <div className="mm-node sub s1"></div>
                                    <div className="mm-node sub s2"></div>
                                    <div className="mm-node child c1"></div>
                                    <div className="mm-node child c2"></div>
                                    <div className="mm-link l1"></div>
                                    <div className="mm-link l2"></div>
                                </div>
                            </div>
                            <div className="template-info">
                                <div className="template-top">
                                    <h3>Planning</h3>
                                    <span className="template-badge popular">Popular</span>
                                </div>
                                <p>Hierarchical tree structure. Best for project planning.</p>
                                <button
                                    className="btn-use-template"
                                    onClick={() => handleUseTemplate('PLANNING')}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Use Template'}
                                </button>
                            </div>
                        </div>

                        {/* Pro Template */}
                        <div className="template-card pro">
                            <div className="template-preview">
                                <div className="mini-map pro-map">
                                    <div className="mm-node root"></div>
                                    <div className="mm-node orbit o1"></div>
                                    <div className="mm-node orbit o2"></div>
                                    <div className="mm-node orbit o3"></div>
                                    <div className="mm-node sat s1"></div>
                                    <div className="mm-node sat s2"></div>
                                    <svg className="mm-lines">
                                        <line x1="50%" y1="50%" x2="20%" y2="20%" />
                                        <line x1="50%" y1="50%" x2="80%" y2="20%" />
                                        <line x1="50%" y1="50%" x2="50%" y2="80%" />
                                        <line x1="20%" y1="20%" x2="10%" y2="40%" />
                                        <line x1="80%" y1="20%" x2="90%" y2="40%" />
                                    </svg>
                                </div>
                            </div>
                            <div className="template-info">
                                <div className="template-top">
                                    <h3>System Core</h3>
                                    <span className="template-badge pro">Pro</span>
                                </div>
                                <p>Complex network structure. Designed for systems thinking.</p>
                                <button
                                    className="btn-use-template"
                                    onClick={() => handleUseTemplate('SYSTEM')}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Use Template'}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Templates;
