import express from 'express';
import lampMonitoringController from '../controllers/lamp_monitoring.controller.js';
import basicAuth from '../middlewares/basicAuth.js';

const router = express.Router();

router.get('/lamp-monitoring', basicAuth, lampMonitoringController.getAllMonitoring);
router.post('/lamp-monitoring', basicAuth, lampMonitoringController.updateStatus);
router.post('/lamp', basicAuth, lampMonitoringController.createLamp);
router.put('/lamp', basicAuth, lampMonitoringController.updateLampLocation);
router.get('/lamp', basicAuth, lampMonitoringController.getAllLamp);

export default router;
