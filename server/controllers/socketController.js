const Map = require('../models/Map');

// Track users per map: { mapId: [{ id: socketId, username: string, color: string }] }
const mapUsers = {};

const getMapUsers = (mapId) => {
    return mapUsers[mapId] || [];
};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-map', async (data) => {
            // Handle both legacy (string) and new (object) payloads
            const mapId = typeof data === 'string' ? data : data.mapId;
            const username = typeof data === 'object' && data.username ? data.username : 'Guest';

            socket.join(mapId);

            // Store data on socket for disconnect handling
            socket.data.mapId = mapId;
            socket.data.username = username;

            console.log(`User ${username} (${socket.id}) joined map ${mapId}`);

            // Add user to active list
            if (!mapUsers[mapId]) {
                mapUsers[mapId] = [];
            }
            // Avoid duplicates check (though socket id is unique)
            if (!mapUsers[mapId].find(u => u.id === socket.id)) {
                mapUsers[mapId].push({
                    id: socket.id,
                    username: username,
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Assign random color
                });
            }

            // Broadcast active users to everyone in the room (including sender)
            io.to(mapId).emit('room-users', mapUsers[mapId]);

            // Send initial map data
            try {
                let map = await Map.findById(mapId);
                if (map) {
                    socket.emit('init-map', map);
                }
            } catch (err) {
                console.error("Error fetching map:", err);
            }
        });

        socket.on('operation', async ({ mapId, operation }) => {
            // Broadcast to others immediately (Optimistic UI)
            socket.to(mapId).emit('operation', operation);

            // Persist to DB
            try {
                const map = await Map.findById(mapId);
                if (!map) return;

                switch (operation.type) {
                    case 'NODE_ADD':
                        map.nodes.push(operation.payload);
                        break;
                    case 'NODE_UPDATE': // Legacy full update
                        const index = map.nodes.findIndex(n => n.id === operation.payload.id);
                        if (index !== -1) map.nodes[index] = operation.payload;
                        break;
                    case 'NODE_MOVE':
                        const moveNode = map.nodes.find(n => n.id === operation.payload.id);
                        if (moveNode) {
                            moveNode.x = operation.payload.x;
                            moveNode.y = operation.payload.y;
                        }
                        break;
                    case 'NODE_EDIT':
                        const editNode = map.nodes.find(n => n.id === operation.payload.id);
                        if (editNode) {
                            editNode.content = operation.payload.content;
                        }
                        break;
                    case 'EDGE_ADD':
                        // Check if edge already exists to prevent duplicates
                        if (!map.edges.find(e => e.id === operation.payload.id)) {
                            map.edges.push(operation.payload);
                        }
                        break;
                    case 'NODE_DELETE':
                        map.nodes = map.nodes.filter(n => n.id !== operation.payload.id);
                        map.edges = map.edges.filter(e => e.source !== operation.payload.id && e.target !== operation.payload.id);
                        break;
                    case 'EDGE_DELETE':
                        map.edges = map.edges.filter(e => e.id !== operation.payload.id);
                        break;
                    case 'EDGE_UPDATE':
                        const edgeIndex = map.edges.findIndex(e => e.id === operation.payload.id);
                        if (edgeIndex !== -1) map.edges[edgeIndex] = operation.payload;
                        break;
                }
                await map.save();
            } catch (err) {
                console.error('Error saving operation:', err);
            }
        });

        socket.on('cursor', ({ mapId, x, y, username }) => {
            const user = mapUsers[mapId]?.find(u => u.id === socket.id);
            const color = user ? user.color : '#ff5722';
            socket.to(mapId).emit('cursor', { id: socket.id, x, y, username, color });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const { mapId } = socket.data;
            if (mapId && mapUsers[mapId]) {
                // Remove user from list
                mapUsers[mapId] = mapUsers[mapId].filter(u => u.id !== socket.id);
                // Emit new list
                io.to(mapId).emit('room-users', mapUsers[mapId]);

                // Cleanup if empty
                if (mapUsers[mapId].length === 0) {
                    delete mapUsers[mapId];
                }
            }
        });
    });
};
