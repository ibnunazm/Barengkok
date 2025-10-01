import express from 'express';
import dotenv from 'dotenv';
import db from './models/index.js';
import lampMonitoringRoutes from './routes/lamp_monitoring.route.js';
import tankMonitoringRoutes from './routes/tank_monitoring.route.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'https://smartvillagebarengkok.com',
  credentials: true
}));

const PORT = process.env.PORT || 8000;

app.use(express.json());
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection successful!');
    return db.sequelize.sync();
  })
  .then(() => {
    console.log('✅ Models synchronized successfully.');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });

app.use(lampMonitoringRoutes);
app.use(tankMonitoringRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Tank & Lamp Monitoring API is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
