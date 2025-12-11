module.exports = (io, globalRedis) => {

    const dropNz = io.of('/drop');
    const redis = globalRedis;

    console.log('✅ [Module] Drop System Logic Loaded');

    dropNz.on('connection', (socket) => {
        console.log(`[Drop] Connect: ${socket.id}`);

        socket.on('create-room', async () => {
            const roomId = Math.floor(100000 + Math.random() * 900000).toString();
            
            await redis.set(`drop:room:${roomId}`, socket.id, 'EX', 300);
            
            socket.join(roomId);
            socket.emit('room-created', roomId);
            console.log(`[Drop] Room Created: ${roomId}`);
        });

        socket.on('join-room', async (roomId) => {
            const hostId = await redis.get(`drop:room:${roomId}`);
            
            if (hostId) {
                socket.join(roomId);
                
                dropNz.to(hostId).emit('peer-joined', { peerId: socket.id });
                
                console.log(`[Drop] Joined: ${socket.id} -> ${roomId}`);
            } else {
                socket.emit('error', '代碼無效或已過期');
            }
        });

        socket.on('signal', (data) => {
            const { roomId, signalData } = data;
            socket.to(roomId).emit('signal', signalData);
        });

        socket.on('disconnect', () => {
            console.log(`[Drop] Disconnect: ${socket.id}`);
        });
    });
};