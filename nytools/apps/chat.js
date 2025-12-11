module.exports = (io, globalRedis) => {
  const chatNz = io.of('/chat'); 
  const redis = globalRedis;

  chatNz.on('connection', (socket) => {
    console.log('[Chat] User connected:', socket.id);

    socket.on('customer_join', async () => {
      socket.role = 'customer';
      
      const agentId = await redis.spop('chat:agents:idle');
      
      if (agentId) {
        startChat(socket.id, agentId);
      } else {
        await redis.rpush('chat:customer:queue', socket.id);
        updateQueueStatus();
        socket.emit('status', { code: 'waiting', msg: '目前客服忙線中，請稍候...' });
      }
    });

    socket.on('agent_join', async () => {
      socket.role = 'agent';
      const customerId = await redis.lpop('chat:customer:queue');
      
      if (customerId) {
        startChat(customerId, socket.id);
        updateQueueStatus();
      } else {
        await redis.sadd('chat:agents:idle', socket.id);
        socket.emit('status', { code: 'idle', msg: '目前尚無客人，偷懶一下！' });
      }
    });

    socket.on('send_message', (data) => {
      chatNz.to(data.to).emit('receive_message', { msg: data.msg, from: socket.role });
    });

    socket.on('disconnect', async () => {
      if (socket.role === 'agent') {
        await redis.srem('chat:agents:idle', socket.id);
      }
      if (socket.partnerId) {
        chatNz.to(socket.partnerId).emit('status', { code: 'ended', msg: '對方已離開對話' });
        const partnerSocket = chatNz.sockets.get(socket.partnerId);
        if (partnerSocket) partnerSocket.partnerId = null;
      }
    });

    function startChat(customerId, agentId) {
        const customerSocket = chatNz.sockets.get(customerId);
        const agentSocket = chatNz.sockets.get(agentId);
        
        if (customerSocket) customerSocket.partnerId = agentId;
        if (agentSocket) agentSocket.partnerId = customerId;

        chatNz.to(customerId).emit('status', { code: 'chatting', partnerId: agentId, msg: '已配對到客服人員！' });
        chatNz.to(agentId).emit('status', { code: 'chatting', partnerId: customerId, msg: '新客人接入！' });
    }

    async function updateQueueStatus() {
        const count = await redis.llen('chat:customer:queue');
        chatNz.emit('queue_update', count); 
    }
  });
};