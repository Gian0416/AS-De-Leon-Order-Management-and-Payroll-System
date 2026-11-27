// ==========================================
// ATTENDANCE SCAN SERVICE
// WBS 2.1.1 — QR Scan Time In and Time Out
// WBS 2.1.2 — Attendance Scan Rules and Validation
// ==========================================
import * as attendanceModel from '../models/Attendance.js';
import * as userModel from '../models/User.js';
import pool from '../db.js';

// Creates a typed error with an HTTP status code attached
const fail = (status, message) => Object.assign(new Error(message), { status });

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatDateTime = (d) =>
    `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// WBS 2.1.2 — reads work_start from the settings table; defaults to 08:00:00 if not set
const getWorkStart = async () => {
    const [rows] = await pool.query(
        `SELECT setting_value FROM settings WHERE setting_key = 'work_start' LIMIT 1`
    );
    return rows.length > 0 ? rows[0].setting_value : '08:00:00';
};

// WBS 2.1.2 — marks a time in as late if it is after work_start; returns status and late_minutes
const computeLate = (timeIn, work_start) => {
    const [hours, minutes, seconds] = work_start.split(':').map(Number);
    const workStartDate = new Date(timeIn);
    workStartDate.setHours(hours, minutes, seconds || 0, 0);

    const diffMs = timeIn - workStartDate;
    if (diffMs <= 0) return { status: 'on_time', late_minutes: 0 };
    return { status: 'late', late_minutes: Math.ceil(diffMs / 60000) };
};

// WBS 2.1.1 — computes hours worked between time in and time out, rounded to one decimal
const hoursBetween = (timeIn, timeOut) =>
    Math.round((new Date(timeOut) - new Date(timeIn)) / 360000) / 10;

// Returns today's attendance record for an employee, or null if none exists
const findToday = async (user_id, work_date) => {
    const found = await attendanceModel.findByUserAndDate(user_id, work_date);
    if (found.length === 0) return null;
    const rows = await attendanceModel.findById(found[0].id);
    return rows[0] ?? null;
};

// ==========================================
// RECORD A SCAN (TIME IN OR TIME OUT)
// WBS 2.1.1 — finds the employee by scanned QR code and saves time in or time out;
//             returns the employee's details with the recorded time and, on time out, hours worked
// WBS 2.1.2 — Auto mode: first scan of the day is time in, next is time out;
//             marks time in as late if after work_start (default 8:00 AM);
//             rejects unrecognized code, second time in, time out with no time in, second time out
// mode: 'auto' | 'in' | 'out'
// ==========================================
export const recordScan = async ({ code, mode = 'auto' }) => {
    const text = String(code ?? '').trim();
    if (!text) throw fail(400, 'Enter the employee ID.');
    if (!['auto', 'in', 'out'].includes(mode)) throw fail(400, 'Invalid scan mode.');

    // WBS 2.1.2 — reject unrecognized QR code or non-employee account
    const found = await userModel.findByEmployeeCode(text);
    const employee = found[0];
    if (!employee || employee.role !== 'employee') {
        throw fail(404, 'QR code not recognized. Nothing was recorded.');
    }
    if (employee.status && employee.status !== 'active') {
        throw fail(403, `${employee.full_name}'s account is not active.`);
    }

    const now       = new Date();
    const work_date = formatDate(now);
    const record    = await findToday(employee.id, work_date);

    // WBS 2.1.2 — Auto mode: first scan → time in, second scan → time out
    let type = mode;
    if (mode === 'auto') type = record && record.time_in ? 'out' : 'in';

    const info = {
        id:            employee.id,
        full_name:     employee.full_name,
        position:      employee.position,
        employee_code: employee.employee_code
    };

    if (type === 'in') {
        // WBS 2.1.2 — reject a second time in on the same day
        if (record && record.time_in) throw fail(409, `${employee.full_name} already timed in today.`);

        // WBS 2.1.2 — mark as late if time in is after work_start
        const { status, late_minutes } = computeLate(now, await getWorkStart());
        await attendanceModel.insert({
            user_id:   employee.id,
            work_date,
            time_in:   formatDateTime(now),
            time_out:  null,
            status,
            late_minutes
        });

        return { type: 'in', employee: info, work_date, time: now.toISOString(), status, late_minutes };
    }

    // WBS 2.1.2 — reject a time out with no time in, or a second time out on the same day
    if (!record || !record.time_in) throw fail(409, `${employee.full_name} has no time in today.`);
    if (record.time_out)            throw fail(409, `${employee.full_name} already timed out today.`);

    await attendanceModel.update({
        id:           record.id,
        time_in:      record.time_in,
        time_out:     formatDateTime(now),
        status:       record.status,
        late_minutes: record.late_minutes
    });

    // WBS 2.1.1 — return hours worked on time out
    return {
        type: 'out',
        employee: info,
        work_date,
        time: now.toISOString(),
        status: record.status,
        late_minutes: record.late_minutes,
        hours: hoursBetween(record.time_in, now)
    };
};

// ==========================================
// UNDO THE LAST SCAN OF AN EMPLOYEE TODAY
// WBS 2.1.3 — deletes today's record if the last scan was a time in,
//             or clears the time out if the last scan was a time out
// type: 'in' | 'out'
// ==========================================
export const undoScan = async ({ user_id, type }) => {
    if (!user_id || !['in', 'out'].includes(type)) {
        throw fail(400, 'user_id and type (in or out) are required.');
    }

    const record = await findToday(Number(user_id), formatDate(new Date()));
    if (!record) throw fail(404, 'There is nothing to undo.');

    if (type === 'in') {
        await attendanceModel.remove(record.id);
    } else {
        await attendanceModel.update({
            id:           record.id,
            time_in:      record.time_in,
            time_out:     null,
            status:       record.status,
            late_minutes: record.late_minutes
        });
    }
};
