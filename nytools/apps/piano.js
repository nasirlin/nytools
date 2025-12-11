module.exports = (io, globalRedis) => {
    const pianoNz = io.of('/piano');
    const redis = globalRedis;

    let adminSocketId = null;

    console.log('✅ [Module] Piano System Logic Loaded');

    pianoNz.on('connection', async (socket) => {
        console.log(`[Piano] User connected: ${socket.id}`);

        sendCurrentPlaylist(socket.id);

        pianoNz.to(socket.id).emit('system_status', { online: (adminSocketId !== null) });

        socket.on('admin_join', () => {
            console.log(`🎹 [Piano] Nasir (Admin) 上線了！ID: ${socket.id}`);
            adminSocketId = socket.id;
            pianoNz.emit('system_status', { online: true });
        });

        socket.on('request_song', async (songName) => {
            if (!adminSocketId) return; 
            if (!songName) return;

            await redis.rpush('piano:playlist', songName);
            
            broadcastPlaylist();
            
            if (adminSocketId) {
                pianoNz.to(adminSocketId).emit('admin_notification', `🎤 新點歌：${songName}`);
            }
        });

        socket.on('play_next', async () => {
            if (socket.id !== adminSocketId) return;

            const currentSong = await redis.lpop('piano:playlist');
            
            if (currentSong) {
                broadcastPlaylist();
                pianoNz.emit('now_playing', currentSong);
            }
        });

        socket.on('delete_song', async (songName) => {
            if (socket.id !== adminSocketId) return;
            
            await redis.lrem('piano:playlist', 1, songName);
            broadcastPlaylist();
        });

        socket.on('disconnect', () => {
            if (socket.id === adminSocketId) {
                console.log('🎹 [Piano] Nasir 下線了，系統暫停。');
                adminSocketId = null;
                pianoNz.emit('system_status', { online: false });
            }
        });
    });

    async function broadcastPlaylist() {
        const list = await redis.lrange('piano:playlist', 0, -1);
        pianoNz.emit('update_playlist', list);
    }

    async function sendCurrentPlaylist(socketId) {
        const list = await redis.lrange('piano:playlist', 0, -1);
        pianoNz.to(socketId).emit('update_playlist', list);
    }
};