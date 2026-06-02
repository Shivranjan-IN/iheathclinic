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

exports.getCart = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const cartItems = await prisma.cart_items.findMany({
            where: { patient_id },
            include: {
                medicine: true
            }
        });

        ResponseHandler.success(res, cartItems, 'Cart retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const { medicine_id, quantity } = req.body;

        // Check if item already in cart
        const existing = await prisma.cart_items.findFirst({
            where: { patient_id, medicine_id }
        });

        let cartItem;
        if (existing) {
            cartItem = await prisma.cart_items.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + (quantity || 1) }
            });
        } else {
            cartItem = await prisma.cart_items.create({
                data: {
                    patient_id,
                    medicine_id,
                    quantity: quantity || 1
                }
            });
        }

        ResponseHandler.success(res, cartItem, 'Item added to cart');
    } catch (error) {
        next(error);
    }
};

exports.updateCartItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const patient_id = await getPatientId(req);

        const item = await prisma.cart_items.findUnique({ where: { id: parseInt(id) } });
        if (!item || item.patient_id !== patient_id) {
            return ResponseHandler.notFound(res, 'Cart item not found');
        }

        const updated = await prisma.cart_items.update({
            where: { id: parseInt(id) },
            data: { quantity: parseInt(quantity) }
        });

        ResponseHandler.updated(res, updated, 'Cart item updated');
    } catch (error) {
        next(error);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient_id = await getPatientId(req);

        const item = await prisma.cart_items.findUnique({ where: { id: parseInt(id) } });
        if (!item || item.patient_id !== patient_id) {
            return ResponseHandler.notFound(res, 'Cart item not found');
        }

        await prisma.cart_items.delete({
            where: { id: parseInt(id) }
        });

        ResponseHandler.success(res, null, 'Item removed from cart');
    } catch (error) {
        next(error);
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        await prisma.cart_items.deleteMany({
            where: { patient_id }
        });

        ResponseHandler.success(res, null, 'Cart cleared');
    } catch (error) {
        next(error);
    }
};
