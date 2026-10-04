import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[SyncCampus Backend] Server running on http://localhost:${PORT}`);
  console.log(`[SyncCampus Backend] Health check: http://localhost:${PORT}/api/health`);
});

export default server;
