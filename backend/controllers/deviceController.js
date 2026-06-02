const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

/**
 * GET /api/devices — List all devices for the logged-in doctor
 */
exports.getDevices = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;

        const devices = await prisma.devices.findMany({
            where: { doctor_id: doctorId },
            include: { patient: true },
            orderBy: { created_at: 'desc' }
        });

        ResponseHandler.success(res, devices, 'Devices retrieved');
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/devices — Add a new medical device
 */
exports.createDevice = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { device_name, device_type, connection_type, port_or_ip, patient_id } = req.body;

        if (!device_name || !device_type) {
            return ResponseHandler.badRequest(res, 'device_name and device_type are required');
        }

        const device = await prisma.devices.create({
            data: {
                device_name,
                device_type,
                connection_type: connection_type || null,
                port_or_ip: port_or_ip || null,
                patient_id: patient_id || null,
                doctor_id: doctorId,
                status: 'online',
                battery_level: 100
            },
            include: { patient: true }
        });

        ResponseHandler.created(res, device, 'Device added successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/devices/:id — Update device (status, battery, etc.)
 */
exports.updateDevice = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { id } = req.params;

        const existing = await prisma.devices.findFirst({
            where: { id: parseInt(id), doctor_id: doctorId }
        });
        if (!existing) return ResponseHandler.notFound(res, 'Device not found');

        const { device_name, device_type, connection_type, port_or_ip, patient_id, status, battery_level } = req.body;

        const updated = await prisma.devices.update({
            where: { id: parseInt(id) },
            data: {
                ...(device_name !== undefined && { device_name }),
                ...(device_type !== undefined && { device_type }),
                ...(connection_type !== undefined && { connection_type }),
                ...(port_or_ip !== undefined && { port_or_ip }),
                ...(patient_id !== undefined && { patient_id }),
                ...(status !== undefined && { status }),
                ...(battery_level !== undefined && { battery_level: parseInt(battery_level) })
            },
            include: { patient: true }
        });

        ResponseHandler.updated(res, updated, 'Device updated');
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/devices/:id — Remove a device
 */
exports.deleteDevice = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { id } = req.params;

        const existing = await prisma.devices.findFirst({
            where: { id: parseInt(id), doctor_id: doctorId }
        });
        if (!existing) return ResponseHandler.notFound(res, 'Device not found');

        await prisma.devices.delete({ where: { id: parseInt(id) } });

        ResponseHandler.deleted(res, 'Device removed');
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/device-readings — Store a new reading for a device
 */
exports.createReading = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { device_id, reading_type, reading_value } = req.body;

        if (!device_id || !reading_type || !reading_value) {
            return ResponseHandler.badRequest(res, 'device_id, reading_type and reading_value are required');
        }

        // Verify device belongs to this doctor
        const device = await prisma.devices.findFirst({
            where: { id: parseInt(device_id), doctor_id: doctorId }
        });
        if (!device) return ResponseHandler.notFound(res, 'Device not found or unauthorized');

        const reading = await prisma.device_readings.create({
            data: {
                device_id: parseInt(device_id),
                reading_type,
                reading_value
            }
        });

        ResponseHandler.created(res, reading, 'Reading stored');
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/device-readings/:deviceId — Get all readings for a device
 */
exports.getReadings = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { deviceId } = req.params;

        // Verify ownership
        const device = await prisma.devices.findFirst({
            where: { id: parseInt(deviceId), doctor_id: doctorId }
        });
        if (!device) return ResponseHandler.notFound(res, 'Device not found or unauthorized');

        const readings = await prisma.device_readings.findMany({
            where: { device_id: parseInt(deviceId) },
            orderBy: { recorded_at: 'desc' },
            take: 100
        });

        ResponseHandler.success(res, readings, 'Readings retrieved');
    } catch (error) {
        next(error);
    }
};
