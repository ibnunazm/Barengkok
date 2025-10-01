import express from 'express';
import tankMonitoringController from '../controllers/tank_monitoring.controller.js';
import basicAuth from '../middlewares/basicAuth.js';

const router = express.Router();

router.get('/tank-monitoring', basicAuth, tankMonitoringController.getAllMonitoring);
router.post('/tank-monitoring', basicAuth, tankMonitoringController.updateStatus);
router.post('/tank', basicAuth, tankMonitoringController.createTank);
router.put('/tank', basicAuth, tankMonitoringController.updateTankLocation);
router.get('/tank', basicAuth, tankMonitoringController.getAllTank);

export default router;
