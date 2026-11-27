// ==========================================
// ATTENDANCE SCAN ROUTES
// WBS 2.1.1 - QR Scan Time In and Time Out
// WBS 2.1.2 - Attendance Scan Rules and Validation
// WBS 2.1.3 - Manual ID Entry and Undo Scan
// ==========================================
import express from 'express';
import { scanAttendance, undoScan } from '../controllers/attendanceScanController.js';

const router = express.Router();

// POST /api/attendance-scan       - record a QR or manual ID scan (WBS 2.1.1, 2.1.2, 2.1.3)
router.post('/', scanAttendance);

// POST /api/attendance-scan/undo  - undo the last time in or time out (WBS 2.1.3)
router.post('/undo', undoScan);

export default router;
