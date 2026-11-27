// ==========================================
// ATTENDANCE SCAN CONTROLLER
// WBS 2.1.1 - QR Scan Time In and Time Out
// WBS 2.1.2 - Attendance Scan Rules and Validation
// WBS 2.1.3 - Manual ID Entry and Undo Scan
// ==========================================
import * as attendanceScanService from '../services/attendanceScanService.js';

// Sends a structured error response; uses the error's status code if set, otherwise 500
const sendError = (res, label, error, fallback) => {
    console.error(`${label}:`, error);
    if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: fallback });
};

// ==========================================
// RECORD A QR SCAN (TIME IN / TIME OUT)
// POST /api/attendance-scan   body: { code, mode }
// WBS 2.1.1 - finds the employee by QR code and saves time in or time out
// WBS 2.1.2 - applies Auto mode logic, late detection, and duplicate scan rejection
// WBS 2.1.3 - accepts a typed employee ID the same way as a QR scan
// ==========================================
export const scanAttendance = async (req, res) => {
    try {
        const result = await attendanceScanService.recordScan(req.body);
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        return sendError(res, 'Scan Attendance Error', error, 'Could not record the scan.');
    }
};

// ==========================================
// UNDO THE LAST SCAN
// POST /api/attendance-scan/undo   body: { user_id, type }
// WBS 2.1.3 - deletes today's record if last scan was time in,
//             or clears time out if last scan was time out
// ==========================================
export const undoScan = async (req, res) => {
    try {
        await attendanceScanService.undoScan(req.body);
        return res.status(200).json({ success: true, message: 'Last scan undone.' });
    } catch (error) {
        return sendError(res, 'Undo Scan Error', error, 'Could not undo the scan.');
    }
};
