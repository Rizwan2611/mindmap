import { useState, useCallback, useEffect } from 'react';
import './Canvas.css';

import Node from './Node';
import Cursor from './Cursor';
import { socket } from '../../socket';

import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaMinus, FaSearchPlus, FaSearchMinus, FaHandPointer, FaUserCircle, FaSignOutAlt, FaMapMarkedAlt, FaLink, FaBezierCurve, FaGripLines, FaVectorSquare, FaPalette, FaShapes, FaSquare, FaCircle, FaRegSquare, FaRegCircle } from 'react-icons/fa';
import { LuMousePointer2 } from "react-icons/lu";

const Canvas = ({ mapId, darkMode, nodes, setNodes, edges, setEdges }) => {
    // Lifted state to MapPage
    // const [nodes, setNodes] = useState([]);
    // const [edges, setEdges] = useState([]);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const [isConnecting, setIsConnecting] = useState(false); // Connection Mode
    const [edgeStyle, setEdgeStyle] = useState('curve'); // curve, straight, step
    const [showCollaborators, setShowCollaborators] = useState(true);

    const [connectingNodeId, setConnectingNodeId] = useState(null);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [cursors, setCursors] = useState({});

    const [activeNodeId, setActiveNodeId] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
                    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
                    setEdges(prev => prev.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
                    socket.emit('operation', { mapId, operation: { type: 'NODE_DELETE', payload: { id: selectedNodeId } } });
                    setSelectedNodeId(null);
                }
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeId) {
                setEdges(prev => prev.filter(edge => edge.id !== selectedEdgeId));
                socket.emit('operation', { mapId, operation: { type: 'EDGE_DELETE', payload: { id: selectedEdgeId } } });
                setSelectedEdgeId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, selectedEdgeId, mapId]);

    useEffect(() => {
        if (!mapId) return;

        socket.auth = { token: localStorage.getItem('token') };
        socket.connect();
        socket.emit('join-map', mapId);

        socket.on('init-map', (mapData) => {
            setNodes(mapData.nodes || []);
            setEdges(mapData.edges || []);
        });

        socket.on('operation', handleRemoteOperation);

        socket.on('cursor', (data) => {
            setCursors(prev => ({ ...prev, [data.id]: data }));
        });

        return () => {
            socket.disconnect();
            socket.off('operation');
            socket.off('init-map');
            socket.off('cursor');
        };
    }, [mapId]);

    const handleRemoteOperation = (op) => {
        if (op.type === 'NODE_ADD') {
            setNodes((prev) => {
                if (prev.find(n => n.id === op.payload.id)) return prev;
                return [...prev, op.payload];
            });
        } else if (op.type === 'NODE_UPDATE') {
            setNodes((prev) => prev.map(n => n.id === op.payload.id ? op.payload : n));
        } else if (op.type === 'NODE_MOVE') {
            setNodes((prev) => prev.map(n => n.id === op.payload.id ? { ...n, x: op.payload.x, y: op.payload.y } : n));
        } else if (op.type === 'NODE_EDIT') {
            setNodes((prev) => prev.map(n => n.id === op.payload.id ? { ...n, ...op.payload } : n));
        } else if (op.type === 'EDGE_UPDATE') {
            setEdges((prev) => prev.map(e => e.id === op.payload.id ? { ...e, ...op.payload } : e));
        } else if (op.type === 'NODE_DELETE') {
            setNodes((prev) => prev.filter(n => n.id !== op.payload.id));
            setEdges((prev) => prev.filter(e => e.source !== op.payload.id && e.target !== op.payload.id));
        } else if (op.type === 'EDGE_ADD') {
            setEdges((prev) => {
                if (prev.find(e => e.id === op.payload.id)) return prev;
                return [...prev, op.payload];
            });
        } else if (op.type === 'EDGE_DELETE') {
            setEdges((prev) => prev.filter(e => e.id !== op.payload.id));
        }
    };

    const addNode = (shapeType = 'pill') => {
        const id = uuidv4();
        const branchColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
        const randomColor = branchColors[Math.floor(Math.random() * branchColors.length)];

        let borderRadius = '20px';
        if (shapeType === 'square') borderRadius = '4px';
        if (shapeType === 'circle') borderRadius = '50%';

        const newNode = {
            id,
            x: (-offset.x + window.innerWidth / 2 - 75) / scale,
            y: (-offset.y + window.innerHeight / 2 - 25) / scale,
            content: 'New Idea',
            type: 'text',
            style: {
                backgroundColor: '#ffffff',
                fontSize: 16,
                borderColor: randomColor,
                borderRadius: borderRadius
            }
        };
        setNodes((prev) => [...prev, newNode]);
        socket.emit('operation', { mapId, operation: { type: 'NODE_ADD', payload: newNode } });
    };

    const handleClientUpdate = (updatedNode) => {
        setNodes((prev) => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
        socket.emit('operation', { mapId, operation: { type: 'NODE_EDIT', payload: updatedNode } });
    };

    const updateNodeStyle = (key, value) => {
        if (!selectedNodeId) return;
        const node = nodes.find(n => n.id === selectedNodeId);
        if (!node) return;

        const newStyle = { ...node.style, [key]: value };
        const updatedNode = { ...node, style: newStyle };

        handleClientUpdate(updatedNode);
    };

    const updateEdgeStyle = (key, value) => {
        if (!selectedEdgeId) return;
        const edge = edges.find(e => e.id === selectedEdgeId);
        if (!edge) return;

        const updatedEdge = { ...edge, [key]: value };
        setEdges(prev => prev.map(e => e.id === selectedEdgeId ? updatedEdge : e));
        socket.emit('operation', { mapId, operation: { type: 'EDGE_UPDATE', payload: updatedEdge } });
    };

    const deleteSelectedNode = () => {
        if (!selectedNodeId) return;
        setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
        setEdges(prev => prev.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
        socket.emit('operation', { mapId, operation: { type: 'NODE_DELETE', payload: { id: selectedNodeId } } });
        setSelectedNodeId(null);
    };

    const handleCanvasMouseDown = (e) => {
        if (e.target.closest('.node-element') || e.target.closest('.inspector-panel')) return;
        setIsDraggingCanvas(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
    };

    const handleNodeMouseDown = (e, nodeId) => {
        e.stopPropagation();
        setSelectedNodeId(nodeId);
        setSelectedEdgeId(null);
        if (isConnecting || e.shiftKey) { // Check connection mode or shift key
            setConnectingNodeId(nodeId);
        } else {
            setActiveNodeId(nodeId);
        }
    };

    const handleNodeMouseUp = (e, nodeId) => {
        e.stopPropagation();
        setActiveNodeId(null); // Stop dragging the node
        if (connectingNodeId && connectingNodeId !== nodeId) {
            // Check if connection already exists
            const existingEdge = edges.find(e =>
                (e.source === connectingNodeId && e.target === nodeId) ||
                (e.source === nodeId && e.target === connectingNodeId)
            );

            if (!existingEdge) {
                const newEdge = {
                    id: uuidv4(),
                    source: connectingNodeId,
                    target: nodeId
                };
                setEdges(prev => [...prev, newEdge]);
                socket.emit('operation', { mapId, operation: { type: 'EDGE_ADD', payload: newEdge } });
            }
        }
        setConnectingNodeId(null);
    };

    const handleMouseMove = (e) => {
        if (isDraggingCanvas) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        } else if (activeNodeId) {
            const node = nodes.find(n => n.id === activeNodeId);
            if (node) {
                const dx = e.movementX / scale;
                const dy = e.movementY / scale;
                const updatedNode = { ...node, x: node.x + dx, y: node.y + dy };
                setNodes(prev => prev.map(n => n.id === activeNodeId ? updatedNode : n));
                socket.emit('operation', { mapId, operation: { type: 'NODE_MOVE', payload: { id: updatedNode.id, x: updatedNode.x, y: updatedNode.y } } });
            }
        } else if (connectingNodeId) {
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }

        socket.emit('cursor', {
            mapId,
            x: (e.clientX - offset.x) / scale,
            y: (e.clientY - offset.y) / scale,
            username: localStorage.getItem('username') || 'Guest'
        });
    };

    const handleMouseUp = () => {
        setIsDraggingCanvas(false);
        setActiveNodeId(null);
        setConnectingNodeId(null);
    };

    const handleAddChild = (parentId, direction) => {
        const parent = nodes.find(n => n.id === parentId);
        if (!parent) return;

        const distance = 150;
        let dx = 0;
        let dy = 0;

        if (direction === 'right') dx = distance;
        if (direction === 'left') dx = -distance;
        if (direction === 'bottom') dy = distance;
        if (direction === 'top') dy = -distance;

        // Colors for branches
        const branchColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
        const randomColor = branchColors[Math.floor(Math.random() * branchColors.length)];

        const nodeColor = parent.style?.borderColor || randomColor;

        const newId = uuidv4();
        const newNode = {
            id: newId,
            x: parent.x + dx,
            y: parent.y + dy,
            content: 'New Node',
            type: 'text',
            style: {
                backgroundColor: '#ffffff',
                fontSize: 16,
                borderColor: nodeColor
            }
        };

        const newEdge = { id: uuidv4(), source: parentId, target: newId };

        setNodes(prev => [...prev, newNode]);
        setEdges(prev => [...prev, newEdge]);

        socket.emit('operation', { mapId, operation: { type: 'NODE_ADD', payload: newNode } });
        socket.emit('operation', { mapId, operation: { type: 'EDGE_ADD', payload: newEdge } });
    };

    const handleDoubleClick = (e) => {
        if (e.target.dataset.type === 'canvas') {
            addNode();
        }
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const selectedEdge = edges.find(e => e.id === selectedEdgeId);
    const colors = ['#ffffff', '#fff9c4', '#c8e6c9', '#bbdefb', '#ffcdd2', '#e1bee7'];
    const lineColors = ['#ffffff', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#000000'];

    // Toggle Edge Style
    const cycleEdgeStyle = () => {
        if (edgeStyle === 'curve') setEdgeStyle('straight');
        else if (edgeStyle === 'straight') setEdgeStyle('step');
        else setEdgeStyle('curve');
    };

    const getEdgePath = (x1, y1, x2, y2) => {
        if (edgeStyle === 'straight') {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (edgeStyle === 'step') {
            const midX = (x1 + x2) / 2;
            return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        } else {
            // Curve (Default)
            const cvx = (x1 + x2) / 2;
            return `M ${x1} ${y1} C ${cvx} ${y1}, ${cvx} ${y2}, ${x2} ${y2}`;
        }
    };

    return (
        <div className={`canvas-container ${darkMode ? 'dark' : ''}`} style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

            {selectedNode && (
                <div className="inspector-panel">
                    <div className="inspector-header">
                        <h3>Node Properties</h3>
                        <button onClick={() => setSelectedNodeId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div className="inspector-section">
                        <label>Color</label>
                        <div className="color-grid">
                            {colors.map(c => (
                                <div
                                    key={c}
                                    className={`color-option ${selectedNode.style?.backgroundColor === c ? 'active' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => updateNodeStyle('backgroundColor', c)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="inspector-section">
                        <label>Text Size</label>
                        <div className="font-controls">
                            <button className="font-btn" onClick={() => updateNodeStyle('fontSize', 14)}>S</button>
                            <button className="font-btn" onClick={() => updateNodeStyle('fontSize', 18)}>M</button>
                            <button className="font-btn" onClick={() => updateNodeStyle('fontSize', 24)}>L</button>
                        </div>
                    </div>

                    <button className="delete-btn" onClick={deleteSelectedNode}>
                        Delete Node
                    </button>
                </div>
            )}

            {selectedEdge && (
                <div className="inspector-panel">
                    <div className="inspector-header">
                        <h3>Edge Properties</h3>
                        <button onClick={() => setSelectedEdgeId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div className="inspector-section">
                        <label>Line Color</label>
                        <div className="color-grid">
                            {lineColors.map(c => (
                                <div
                                    key={c}
                                    className={`color-option ${selectedEdge.color === c ? 'active' : ''}`}
                                    style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
                                    onClick={() => updateEdgeStyle('color', c)}
                                />
                            ))}
                        </div>
                    </div>
                    <button className="delete-btn" onClick={() => {
                        setEdges(prev => prev.filter(e => e.id !== selectedEdgeId));
                        socket.emit('operation', { mapId, operation: { type: 'EDGE_DELETE', payload: { id: selectedEdgeId } } });
                        setSelectedEdgeId(null);
                    }}>
                        Delete Connection
                    </button>
                </div>
            )}

            <div
                className="canvas-container"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                data-type="canvas"
                style={{ cursor: isConnecting ? 'crosshair' : isDraggingCanvas ? 'grabbing' : activeNodeId ? 'grabbing' : 'default' }}
            >
                <div
                    className="canvas-content"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: '0 0'
                    }}
                >
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                        {edges.map(edge => {
                            const source = nodes.find(n => n.id === edge.source);
                            const target = nodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;

                            const x1 = source.x + (source.style?.fontSize ? source.style.fontSize * 4 : 60);
                            const y1 = source.y + 20;
                            const x2 = target.x + (target.style?.fontSize ? target.style.fontSize * 4 : 60);
                            const y2 = target.y + 20;

                            const path = getEdgePath(x1, y1, x2, y2);

                            return (
                                <g key={edge.id} onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }} style={{ cursor: 'pointer' }}>
                                    {/* Invisible wider path for easier clicking */}
                                    <path
                                        d={path}
                                        stroke="transparent"
                                        strokeWidth="15"
                                        fill="none"
                                    />
                                    <path
                                        d={path}
                                        stroke={edge.color || (target.style?.borderColor || '#ffffff')}
                                        strokeWidth={selectedEdgeId === edge.id ? "5" : "3"}
                                        fill="none"
                                        opacity={selectedEdgeId === edge.id ? "1" : "0.8"}
                                    />
                                </g>
                            );
                        })}
                        {connectingNodeId && (
                            <line
                                x1={nodes.find(n => n.id === connectingNodeId)?.x + 50}
                                y1={nodes.find(n => n.id === connectingNodeId)?.y + 20}
                                x2={(lastMousePos.x - offset.x) / scale}
                                y2={(lastMousePos.y - offset.y) / scale}
                                stroke="#ffffff"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.8"
                            />
                        )}
                    </svg>
                    {nodes.map(node => (
                        <Node
                            key={node.id}
                            data={node}
                            onUpdate={handleClientUpdate}
                            onAddChild={handleAddChild}
                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                            onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                            selected={selectedNodeId === node.id}
                        />
                    ))}
                    {Object.values(cursors).map(cursor => (
                        <Cursor key={cursor.id} x={cursor.x} y={cursor.y} username={cursor.username} />
                    ))}
                </div>

            </div>

            <div className="toolbar">
                {/* ... existing toolbar ... */}
                <button onClick={() => addNode('pill')} title="Add Pill Node"><FaPlus /></button>
                <button onClick={() => addNode('square')} title="Add Square Node"><FaSquare /></button>
                <button onClick={() => addNode('circle')} title="Add Circle Node"><FaCircle /></button>

                <div className="divider"></div>

                <button onClick={() => setIsConnecting(!isConnecting)} title="Connection Mode" style={{ color: isConnecting ? '#667eea' : '' }}><FaLink /></button>
                <button onClick={cycleEdgeStyle} title={`Edge Style: ${edgeStyle}`}>
                    {edgeStyle === 'curve' && <FaBezierCurve />}
                    {edgeStyle === 'straight' && <FaGripLines style={{ transform: 'rotate(45deg)' }} />}
                    {edgeStyle === 'step' && <FaVectorSquare />}
                </button>

                <div className="divider"></div>

                <div className="zoom-controls">
                    <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} title="Zoom Out"><FaMinus /></button>
                    <span style={{ fontSize: '0.9rem', margin: '0 4px', minWidth: '40px', textAlign: 'center' }}>
                        {Math.round(scale * 100)}%
                    </span>
                    <button onClick={() => setScale(s => s + 0.1)} title="Zoom In"><FaPlus /></button>
                </div>
            </div>

            {/* Active Collaborators Panel */}
            <div className="collaborators-panel">
                <div className="collaborators-header" onClick={() => setShowCollaborators(!showCollaborators)}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Active Users ({Object.values(cursors).length + 1})</span>
                    <span style={{ fontSize: '0.8rem' }}>{showCollaborators ? '▼' : '▲'}</span>
                </div>

                {showCollaborators && (
                    <div className="collaborators-list">
                        <div className="collaborator-item me">
                            <div className="avatar me"><FaUserCircle /></div>
                            <span>{localStorage.getItem('username')} (You)</span>
                        </div>
                        {Object.values(cursors).map(cursor => (
                            <div key={cursor.id} className="collaborator-item">
                                <div className="avatar"><FaUserCircle /></div>
                                <span>{cursor.username}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Canvas;
