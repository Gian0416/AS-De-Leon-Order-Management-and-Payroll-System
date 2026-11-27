// ==========================================
// ATTENDANCE SCAN ROUTES
// WBS 2.1.1 — QR Scan Time In and Time Out
// ==========================================
import express from 'express';
import { scanAttendance } from '../controllers/attendanceScanController.js';

const router = express.Router();

// POST /api/attendance-scan       — record a time in or time out from a QR scan (WBS 2.1.1)
router.post('/', scanAttendance);

export default router;
