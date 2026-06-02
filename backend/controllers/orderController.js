const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const Patient = require('../models/patientModel');

async function getPatientId(req) {
    const userId = req.user.user_id;
    let patient = await Patient.findByUserId(userId);
    if (!patient && req.user.email) {
        patient = await Patient.findByEmail(req.user.email);
    }
    return patient ? patient.patient_id : null;
}

exports.getMyOrders = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const orders = await prisma.orders.findMany({
            where: { patient_id },
            include: {
                order_items: {
                    include: {
                        medicine: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        ResponseHandler.success(res, orders, 'Orders retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient_id = await getPatientId(req);

        const order = await prisma.orders.findUnique({
            where: { id: parseInt(id) },
            include: {
                order_items: {
                    include: {
                        medicine: true
                    }
                }
            }
        });

        if (!order || order.patient_id !== patient_id) {
            return ResponseHandler.notFound(res, 'Order not found');
        }

        ResponseHandler.success(res, order, 'Order details retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createOrder = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const { order_type, items, total_amount, delivery_address } = req.body;

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.orders.create({
                data: {
                    patient_id,
                    order_type: order_type || 'medicine',
                    total_amount: parseFloat(total_amount) || 0,
                    delivery_address,
                    status: 'pending'
                }
            });

            if (items && items.length > 0) {
                await tx.order_items.createMany({
                    data: items.map(item => ({
                        order_id: newOrder.id,
                        medicine_id: item.medicine_id,
                        quantity: item.quantity,
                        price_at_order: item.price
                    }))
                });
            }

            // Optionally clear cart if this was a cart order
            if (order_type === 'medicine' || !order_type) {
                await tx.cart_items.deleteMany({
                    where: { patient_id }
                });
            }

            return newOrder;
        });

        ResponseHandler.created(res, order, 'Order placed successfully');
    } catch (error) {
        next(error);
    }
};

exports.cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient_id = await getPatientId(req);

        const order = await prisma.orders.findUnique({ where: { id: parseInt(id) } });
        if (!order) return ResponseHandler.notFound(res, 'Order not found');
        if (order.patient_id !== patient_id) return ResponseHandler.forbidden(res, 'Access denied');

        if (order.status !== 'pending') {
            return ResponseHandler.badRequest(res, 'Only pending orders can be cancelled');
        }

        const updated = await prisma.orders.update({
            where: { id: parseInt(id) },
            data: { status: 'cancelled' }
        });

        ResponseHandler.updated(res, updated, 'Order cancelled');
    } catch (error) {
        next(error);
    }
};
