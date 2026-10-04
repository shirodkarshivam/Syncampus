import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
export const createApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // API Routes
    app.use('/api', routes);
    // 404 Handler
    app.use((_req, res) => {
        res.status(404).json({ error: 'Endpoint not found' });
    });
    // Global Error Handler
    app.use((err, _req, res, _next) => {
        console.error('Unhandled Server Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    });
    return app;
};
export default createApp();
