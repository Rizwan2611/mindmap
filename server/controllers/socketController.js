const Map = require('../models/Map');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-map', async (mapId) => {
            socket.join(mapId);
            console.log(`User ${socket.id} joined map ${mapId}`);
            // Send initial map data
            try {
                let map = await Map.findById(mapId);
                if (!map) {
                    // Create default map if not exists (for prototype simplicity)
                    if (mapId === 'default-map') {
                        map = new Map({ _id: 'default-map', title: 'My Mind Map', nodes: [], edges: [] }); // _id likely needs to be ObjectId or we handle string
                        // Mongoose _id is ObjectId by default. 'default-map' is not valid ObjectId.
                        // We'll search by a custom id or just create one if not found.
                    }
                }
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
                const map = await Map.findById(mapId); // Assuming mapId is valid ObjectId now
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
                }
                await map.save();
            } catch (err) {
                console.error('Error saving operation:', err);
            }
        });

        socket.on('cursor', ({ mapId, x, y, username }) => {
            socket.to(mapId).emit('cursor', { id: socket.id, x, y, username });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
