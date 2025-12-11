require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const Redis = require("ioredis");
const cors = require('cors');

const app = express();

app.use(cors({ origin: "*" })); 
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => console.log('✅ [System] Redis Connected'));
redis.on('error', (err) => console.error('wq [System] Redis Error:', err));

app.get('/', (req, res) => {
  res.send('NY SysBackend is Running! (Chat / Drop / Piano)');
});

try {
    require('./apps/chat')(io, redis);
    console.log('✅ [Module] Chat Loaded');
    
    require('./apps/drop')(io, redis);
    console.log('✅ [Module] Drop Loaded');

    require('./apps/piano')(io, redis);    
    console.log('✅ [Module] Piano Loaded');
    
} catch (error) {
    console.error('❌ Module Loading Error:', error);
    console.error(error.stack);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 NY SysBackend running on port ${PORT}`);
});