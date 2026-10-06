import dotenv from 'dotenv';
import http from 'http';
import { createApp } from './app.js';
import { initSocketServer } from './realtime/socketServer.js';
import { verifyDatabaseConnection, isDbConfigured } from './config/database.js';
dotenv.config();
async function startServer() {
    if (isDbConfigured) {
        try {
            await verifyDatabaseConnection();
            console.log('[SyncCampus Backend] PostgreSQL connected successfully.');
        }
        catch (err) {
            console.error('[SyncCampus Backend] FATAL: Database connection failed:', err.message);
            process.exit(1);
        }
    }
    const app = createApp();
    const PORT = Number(process.env.PORT) || 5000;
    const HOST = '0.0.0.0';
    const httpServer = http.createServer(app);
    // Initialize Real-time Socket.IO Gateway
    initSocketServer(httpServer);
    httpServer.listen(PORT, HOST, () => {
        console.log(`[SyncCampus Backend] Server running on http://${HOST}:${PORT}`);
        console.log(`[SyncCampus Backend] Health check: http://${HOST}:${PORT}/api/health`);
        console.log(`[SyncCampus Backend] Socket.IO real-time gateway initialized`);
    });
    return httpServer;
}
const serverPromise = startServer();
export default serverPromise;
