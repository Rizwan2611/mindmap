import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaMap, FaUserCircle, FaSignOutAlt, FaSearch, FaMoon, FaSun, FaEllipsisV, FaEdit, FaTrash, FaFilePdf, FaCheck, FaTimes } from 'react-icons/fa';
import './Dashboard.css';

// Mini Map Preview Component
const MiniMapPreview = ({ nodes, edges }) => {
    if (!nodes || nodes.length === 0) {
        return (
            <div className="empty-preview">
                <FaMap className="map-icon" />
            </div>
        );
    }

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        const nx = Number(node.x) || 0;
        const ny = Number(node.y) || 0;
        const nw = Number(node.width) || 120;
        const nh = Number(node.height) || 40;

        minX = Math.min(minX, nx);
        minY = Math.min(minY, ny);
        maxX = Math.max(maxX, nx + nw);
        maxY = Math.max(maxY, ny + nh);
    });

    if (minX === Infinity) return null;

    // Add padding
    const padding = 50;
    const viewBoxX = minX - padding;
    const viewBoxY = minY - padding;
    const viewBoxW = (maxX - minX) + (padding * 2);
    const viewBoxH = (maxY - minY) + (padding * 2);

    return (
        <div className="mini-map-svg-container">
            <svg viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`} className="mini-map-svg">
                {/* Edges */}
                {edges && edges.map((edge, i) => {
                    const source = nodes.find(n => n.id === edge.source);
                    const target = nodes.find(n => n.id === edge.target);
                    if (!source || !target) return null;

                    const sw = Number(source.width) || 120;
                    const sh = Number(source.height) || 40;
                    const tw = Number(target.width) || 120;
                    const th = Number(target.height) || 40;

                    const sx = (Number(source.x) || 0) + sw / 2;
                    const sy = (Number(source.y) || 0) + sh / 2;
                    const tx = (Number(target.x) || 0) + tw / 2;
                    const ty = (Number(target.y) || 0) + th / 2;

                    return (
                        <line
                            key={`edge-${i}`}
                            x1={sx} y1={sy} x2={tx} y2={ty}
                            stroke="#cbd5e1"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map((node, i) => {
                    const x = Number(node.x) || 0;
                    const y = Number(node.y) || 0;
                    const w = Number(node.width) || 120;
                    const h = Number(node.height) || 40;

                    // Parse borderRadius
                    let rx = 4;
                    const br = node.style?.borderRadius;
                    if (br) {
                        if (br === '50%') rx = Math.min(w, h) / 2;
                        else if (typeof br === 'string' && br.includes('px')) rx = parseInt(br, 10);
                        else if (typeof br === 'number') rx = br;
                        else rx = 4;
                    }

                    return (
                        <g key={`node-${i}`}>
                            <rect
                                x={x}
                                y={y}
                                width={w}
                                height={h}
                                rx={rx}
                                fill={node.style?.backgroundColor || '#ffffff'}
                                stroke={node.style?.borderColor || '#94a3b8'}
                                strokeWidth="2"
                            />
                            {node.content && (
                                <text
                                    x={x + w / 2}
                                    y={y + h / 2}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={node.style?.fontSize ? Number(node.style.fontSize) : 14}
                                    fill={node.style?.color || '#1e293b'}
                                    style={{
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                >
                                    {node.content.length > 20 ? node.content.substring(0, 18) + '...' : node.content}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State Initialization
    const [maps, setMaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Independent Dark Mode with Persistence
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    const [showProfile, setShowProfile] = useState(false);

    // Active View from URL or Default
    const [activeView, setActiveView] = useState(() => {
        const viewParam = searchParams.get('view');
        return viewParam === 'live' ? 'live' : 'dashboard';
    });

    // Sync Dark Mode to LocalStorage
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Update View if URL changes (optional, but good for back button)
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam === 'live' && activeView !== 'live') {
            setActiveView('live');
        } else if ((!viewParam || viewParam === 'dashboard') && activeView !== 'dashboard' && activeView !== 'templates') {
            // Careful not to override 'templates' if that was a state, but templates is now a route.
            setActiveView('dashboard');
        }
    }, [searchParams]);


    // Menu & Rename State
    const [activeMenuMapId, setActiveMenuMapId] = useState(null);
    const [renamingMapId, setRenamingMapId] = useState(null);
    const [newMapTitle, setNewMapTitle] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mapToDelete, setMapToDelete] = useState(null);

    const username = localStorage.getItem('username');
    const menuRef = useRef(null);

    // Live Session State
    const [joinSessionId, setJoinSessionId] = useState('');

    const handleJoinSession = (e) => {
        e.preventDefault();
        const input = joinSessionId.trim();
        if (!input) {
            alert("Please enter a Session ID or URL.");
            return;
        }

        let targetId = input;
        // Attempt to extract ID if a URL is pasted
        if (input.includes('http') || input.includes('localhost') || input.includes('/map/')) {
            try {
                // If it's a full URL
                if (input.startsWith('http')) {
                    const url = new URL(input);
                    const pathParts = url.pathname.split('/');
                    // Looking for /map/:id
                    const mapIndex = pathParts.indexOf('map');
                    if (mapIndex !== -1 && pathParts[mapIndex + 1]) {
                        targetId = pathParts[mapIndex + 1];
                    }
                } else {
                    // unexpected format, just try splitting by slash
                    const parts = input.split('/');
                    targetId = parts[parts.length - 1];
                }
            } catch (err) {
                // Fallback to input
            }
        }

        navigate(`/map/${targetId}`);
    };

    // ... (useEffect and other functions remain same)

    const handleDeleteMap = (e, mapId) => {
        e.stopPropagation();
        setMapToDelete(mapId);
        setShowDeleteModal(true);
        setActiveMenuMapId(null);
    };

    const confirmDelete = async () => {
        if (!mapToDelete) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5001/api/maps/${mapToDelete}`, {
                headers: { 'Authorization': token }
            });
            setMaps(maps.filter(m => m._id !== mapToDelete));
            setShowDeleteModal(false);
            setMapToDelete(null);
        } catch (err) {
            console.error("Failed to delete map", err);
            alert("Failed to delete project");
        }
    };

    // ... (rest of the component)


    useEffect(() => {
        fetchMaps();
        // Close menu when clicking outside
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuMapId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchMaps = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            const res = await axios.get('http://localhost:5001/api/maps', {
                headers: { 'Authorization': token }
            });
            setMaps(res.data);
        } catch (err) {
            console.error("Failed to fetch maps", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const createMap = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/maps', { title: 'New Mind Map' }, {
                headers: { 'Authorization': token }
            });
            navigate(`/map/${res.data._id}`);
        } catch (err) {
            console.error("Failed to create map", err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/');
    };

    // Card Actions
    const toggleMenu = (e, mapId) => {
        e.stopPropagation();
        setActiveMenuMapId(activeMenuMapId === mapId ? null : mapId);
    };



    const startRenaming = (e, map) => {
        e.stopPropagation();
        setRenamingMapId(map._id);
        setNewMapTitle(map.title);
        setActiveMenuMapId(null);
    };

    const saveRename = async (e, mapId) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5001/api/maps/${mapId}`,
                { title: newMapTitle },
                { headers: { 'Authorization': token } }
            );
            setMaps(maps.map(m => m._id === mapId ? { ...m, title: newMapTitle } : m));
            setRenamingMapId(null);
        } catch (err) {
            console.error("Failed to rename map", err);
            alert("Failed to rename project");
        }
    };

    const handleExportPDF = (e, mapId) => {
        e.stopPropagation();
        alert("PDF Export feature coming soon!");
        setActiveMenuMapId(null);
    };

    const filteredMaps = maps.filter(map =>
        map.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-screen">Loading your workspace...</div>;

    // ... existing filters ...

    return (
        <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
            {/* Header ... */}
            <header className="dashboard-header">
                <div className="brand-section">
                    <img src="/logo.jpg" alt="MindLink" className="brand-logo" />
                    <h1>MindLink</h1>
                </div>

                <div className="header-right">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search maps..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="action-buttons">
                        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                    </div>

                    <div className="user-profile" onClick={() => setShowProfile(!showProfile)} style={{ cursor: 'pointer', position: 'relative' }}>
                        <div className="user-avatar">
                            <FaUserCircle />
                        </div>
                        <span className="user-name">{username}</span>

                        {showProfile && (
                            <div className="profile-dropdown" style={{
                                position: 'absolute',
                                top: '60px',
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
                                            {username}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {localStorage.getItem('email') || 'User'}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => navigate('/profile')} className="full-logout-btn" style={{
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
                                    justifyContent: 'flex-start',
                                    textAlign: 'left'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#374151' : '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <FaUserCircle /> Your Profile
                                </button>

                                <button onClick={handleLogout} className="full-logout-btn" style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'transparent',
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
                                    justifyContent: 'flex-start', // Align left to match profile
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
            </header>

            <div className="dashboard-body">
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveView('dashboard')}
                        >
                            <FaMap className="nav-icon" />
                            My Projects
                        </button>
                        <button
                            className={`nav-item ${activeView === 'live' ? 'active' : ''}`}
                            onClick={() => setActiveView('live')}
                        >
                            <div className="live-indicator"></div>
                            Live Session
                        </button>
                        <button
                            className={`nav-item ${activeView === 'templates' ? 'active' : ''}`}
                            onClick={() => navigate('/dashboard/templates')}
                        >
                            <FaMap className="nav-icon" /> {/* Using FaMap as generic icon for now, or import another */}
                            Templates
                        </button>
                    </nav>
                </aside>

                <main className="dashboard-content">
                    {activeView === 'dashboard' ? (
                        <>
                            <div className="content-header">
                                <div className="header-text">
                                    <h2>My Projects</h2>
                                    <p className="project-count">{filteredMaps.length} Project{filteredMaps.length !== 1 ? 's' : ''}</p>
                                </div>
                                <button onClick={createMap} className="create-btn">
                                    <FaPlus /> Create New Map
                                </button>
                            </div>

                            <div className="maps-grid">
                                {filteredMaps.map(map => (
                                    <div key={map._id} className="map-card" onClick={() => navigate(`/map/${map._id}`)}>
                                        <div className="map-preview">
                                            <MiniMapPreview nodes={map.nodes} edges={map.edges} />
                                            {/* 3-Dot Menu Button */}
                                            <button
                                                className="card-menu-btn"
                                                onClick={(e) => toggleMenu(e, map._id)}
                                            >
                                                <FaEllipsisV />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenuMapId === map._id && (
                                                <div className="card-menu-dropdown" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={(e) => startRenaming(e, map)}>
                                                        <FaEdit /> Edit Name
                                                    </button>
                                                    <button onClick={(e) => handleDeleteMap(e, map._id)} className="delete-option">
                                                        <FaTrash /> Delete Project
                                                    </button>
                                                    <button onClick={(e) => handleExportPDF(e, map._id)}>
                                                        <FaFilePdf /> Export as PDF
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="map-info">
                                            {renamingMapId === map._id ? (
                                                <div className="rename-container" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={newMapTitle}
                                                        onChange={(e) => setNewMapTitle(e.target.value)}
                                                        autoFocus
                                                        className="rename-input"
                                                    />
                                                    <button className="save-rename-btn" onClick={(e) => saveRename(e, map._id)}><FaCheck /></button>
                                                    <button className="cancel-rename-btn" onClick={(e) => { e.stopPropagation(); setRenamingMapId(null); }}><FaTimes /></button>
                                                </div>
                                            ) : (
                                                <h3>{map.title}</h3>
                                            )}
                                            <p>Last edited: {new Date(map.updatedAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="live-session-view">
                            <div className="session-cards-container">
                                {/* Start New Session Card */}
                                <div className="session-card create-session" onClick={createMap}>
                                    <div className="icon-wrapper">
                                        <FaPlus />
                                    </div>
                                    <h3>Start New Session</h3>
                                    <p>Create a new collaborative map and invite others.</p>
                                    <button className="btn-session-action">Create Now</button>
                                </div>

                                {/* Join Session Card */}
                                <div className="session-card join-session">
                                    <div className="icon-wrapper">
                                        <FaSignOutAlt style={{ transform: 'rotate(180deg)' }} /> {/* Enter icon */}
                                    </div>
                                    <h3>Join a Session</h3>
                                    <p>Enter a Session ID or URL to join an existing room.</p>
                                    <form onSubmit={handleJoinSession} className="join-form" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            placeholder="Enter Session ID..."
                                            value={joinSessionId}
                                            onChange={(e) => setJoinSessionId(e.target.value)}
                                            className="session-input"
                                        />
                                        <button type="submit" className="btn-session-action join-btn">
                                            Join Now
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this project?</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn-delete" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
