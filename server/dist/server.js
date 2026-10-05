import dotenv from 'dotenv';
import http from 'http';
import { createApp } from './app.js';
import { initSocketServer } from './realtime/socketServer.js';
dotenv.config();
const app = createApp();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
// Initialize Real-time Socket.IO Gateway
initSocketServer(httpServer);
httpServer.listen(PORT, () => {
    console.log(`[SyncCampus Backend] Server running on http://localhost:${PORT}`);
    console.log(`[SyncCampus Backend] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[SyncCampus Backend] Socket.IO real-time gateway initialized`);
});
export default httpServer;
