const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');

// Requirement 8: Prescription & Medical Records
exports.getPrescriptions = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const prescriptions = await prisma.prescriptions.findMany({
            where: { clinic_id: clinicId },
            include: { doctor: true, patient: true, medicines: true, lab_tests: true }
        });

        ResponseHandler.success(res, prescriptions, 'Medical records decrypted and retrieved');
    } catch (error) {
        next(error);
    }
};

// Requirement 9: Lab & Diagnostics
exports.getLabs = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const labs = await prisma.lab_test_types.findMany({
            where: {
                OR: [
                    { clinic_id: clinicId },
                    { clinic_id: null }
                ]
            }
        });
        ResponseHandler.success(res, labs, 'Diagnostic protocols retrieved');
    } catch (error) {
        next(error);
    }
};

exports.addLab = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { test_name, price, tat_hours } = req.body;

        const newLab = await prisma.lab_test_types.create({
            data: {
                clinic_id: clinicId,
                test_name,
                price: parseFloat(price),
                tat_hours: parseInt(tat_hours)
            }
        });

        ResponseHandler.created(res, newLab, 'Diagnostic node established');
    } catch (error) {
        next(error);
    }
};

exports.getLabOrders = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const orders = await prisma.lab_orders.findMany({
            where: { clinic_id: clinicId },
            include: {
                patient: true,
                doctor: true,
                lab_test_results: true,
                labs: true,
                lab_order_items: {
                    include: {
                        lab_test_types: true
                    }
                }
            },
            orderBy: { order_date: 'desc' }
        });

        // Flatten to make it backward compatible with the frontend
        const mappedOrders = orders.map(order => {
            const firstItem = order.lab_order_items?.[0];
            return {
                ...order,
                test_type_id: firstItem ? firstItem.test_type_id : null,
                price: firstItem ? (firstItem.price ? parseFloat(firstItem.price.toString()) : 0) : 0,
                lab_test_types: firstItem ? firstItem.lab_test_types : null
            };
        });

        ResponseHandler.success(res, mappedOrders, 'Lab orders synchronized');
    } catch (error) {
        next(error);
    }
};

exports.createLabOrder = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { patient_id, doctor_id, test_type_id, priority, notes, lab_id } = req.body;

        const labOrderId = `LAB-${Date.now()}`;

        // Fetch test type for price
        const testType = await prisma.lab_test_types.findUnique({
            where: { test_type_id: parseInt(test_type_id) }
        });

        const newOrder = await prisma.lab_orders.create({
            data: {
                lab_order_id: labOrderId,
                patient_id,
                doctor_id: parseInt(doctor_id),
                priority: priority || 'Normal',
                notes,
                clinic_id: clinicId,
                status: 'pending',
                lab_id: lab_id ? parseInt(lab_id) : null,
                lab_order_items: {
                    create: {
                        test_type_id: parseInt(test_type_id),
                        price: testType?.price || 0
                    }
                }
            },
            include: {
                patient: true,
                doctor: true,
                lab_order_items: {
                    include: {
                        lab_test_types: true
                    }
                }
            }
        });

        const flattenedOrder = {
            ...newOrder,
            test_type_id: parseInt(test_type_id),
            price: testType ? (testType.price ? parseFloat(testType.price.toString()) : 0) : 0,
            lab_test_types: testType
        };

        ResponseHandler.created(res, flattenedOrder, 'Lab order protocol initiated');
    } catch (error) {
        next(error);
    }
};

// Connected Labs Endpoints
exports.getConnectedLabs = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const mappings = await prisma.clinic_lab_mapping.findMany({
            where: { clinic_id: clinicId },
            include: { labs: true }
        });
        ResponseHandler.success(res, mappings, 'Connected labs retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getSystemLabs = async (req, res, next) => {
    try {
        const labs = await prisma.labs.findMany({
            include: { address: true }
        });
        ResponseHandler.success(res, labs, 'System-provided labs retrieved');
    } catch (error) {
        next(error);
    }
};

exports.connectSystemLab = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { lab_id } = req.body;

        if (!lab_id) {
            return ResponseHandler.badRequest(res, 'Lab ID is required');
        }

        // Check if already mapped
        const existing = await prisma.clinic_lab_mapping.findFirst({
            where: { clinic_id: clinicId, lab_id: parseInt(lab_id) }
        });

        if (existing) {
            return ResponseHandler.badRequest(res, 'This lab is already connected to your clinic');
        }

        const mapping = await prisma.clinic_lab_mapping.create({
            data: {
                clinic_id: clinicId,
                lab_id: parseInt(lab_id),
                mapping_type: 'system'
            },
            include: { labs: true }
        });

        ResponseHandler.created(res, mapping, 'System lab connection established');
    } catch (error) {
        next(error);
    }
};

exports.connectManualLab = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { name, contact, address, tests } = req.body;

        if (!name) {
            return ResponseHandler.badRequest(res, 'Lab name is required');
        }

        const mapping = await prisma.clinic_lab_mapping.create({
            data: {
                clinic_id: clinicId,
                manual_name: name,
                manual_contact: contact,
                manual_address: address,
                manual_tests: tests,
                mapping_type: 'manual'
            }
        });

        ResponseHandler.created(res, mapping, 'Manual lab connection established');
    } catch (error) {
        next(error);
    }
};

exports.disconnectLab = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { id } = req.params;

        const mapping = await prisma.clinic_lab_mapping.findFirst({
            where: { id: parseInt(id), clinic_id: clinicId }
        });

        if (!mapping) {
            return ResponseHandler.notFound(res, 'Connection mapping not found');
        }

        await prisma.clinic_lab_mapping.delete({
            where: { id: parseInt(id) }
        });

        ResponseHandler.success(res, null, 'Lab connection terminated');
    } catch (error) {
        next(error);
    }
};


// Requirement 10: Billing & Payments
exports.getBilling = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const invoices = await prisma.invoices.findMany({
            where: { clinic_id: clinicId },
            include: {
                patient: true,
                appointments: { include: { doctor: true } },
                invoice_items: true,
                invoice_payments: true
            },
            orderBy: { invoice_date: 'desc' }
        });
        ResponseHandler.success(res, invoices, 'Financial ledger synchronized');
    } catch (error) {
        next(error);
    }
};

exports.searchBillingPatients = async (req, res, next) => {
    try {
        const { query } = req.query;
        const clinicId = req.user.clinic_id;

        if (!query) {
            return ResponseHandler.badRequest(res, 'Search query is required');
        }

        // Search for patients by email or phone
        const emailMatches = await prisma.emails.findMany({
            where: { email: { contains: query } },
            select: { user_id: true }
        });

        const phoneMatches = await prisma.contact_numbers.findMany({
            where: { phone_number: { contains: query } },
            select: { user_id: true }
        });

        const userIds = new Set([
            ...emailMatches.map(e => e.user_id),
            ...phoneMatches.map(p => p.user_id)
        ].filter(Boolean));

        const patients = await prisma.patients.findMany({
            where: {
                OR: [
                    { user_id: { in: Array.from(userIds) } },
                    { full_name: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                users: {
                    include: {
                        emails: true,
                        contact_numbers: true
                    }
                }
            }
        });

        // For each patient, get their latest prescription from THIS clinic
        const results = await Promise.all(patients.map(async (p) => {
            const latestPrescription = await prisma.prescriptions.findFirst({
                where: {
                    patient_id: p.patient_id,
                    clinic_id: clinicId
                },
                orderBy: { created_at: 'desc' },
                include: {
                    doctor: true,
                    medicines: { include: { medicines: true } },
                    lab_tests: { include: { lab_test_types: true } }
                }
            });

            return {
                patient_id: p.patient_id,
                full_name: p.full_name,
                email: p.users?.emails?.[0]?.email,
                phone: p.users?.contact_numbers?.[0]?.phone_number,
                latest_prescription: latestPrescription
            };
        }));

        ResponseHandler.success(res, results, 'Billing patients retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createInvoice = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { patient_id, appointment_id, services, discount, payment_mode, paid_amount } = req.body;

        const invoiceId = `INV-${Date.now()}`;
        const totalAmount = services.reduce((sum, s) => sum + (parseFloat(s.rate) * parseInt(s.quantity)), 0);

        const newInvoice = await prisma.invoices.create({
            data: {
                invoice_id: invoiceId,
                patient_id,
                appointment_id,
                clinic_id: clinicId,
                total_amount: totalAmount,
                discount: parseFloat(discount) || 0,
                status: (parseFloat(paid_amount) >= (totalAmount - (parseFloat(discount) || 0))) ? 'paid' : (parseFloat(paid_amount) > 0 ? 'partial' : 'pending'),
                invoice_items: {
                    create: services.map(s => ({
                        service_name: s.name,
                        quantity: parseInt(s.quantity),
                        rate: parseFloat(s.rate),
                        amount: parseFloat(s.rate) * parseInt(s.quantity)
                    }))
                }
            }
        });

        if (parseFloat(paid_amount) > 0) {
            await prisma.invoice_payments.create({
                data: {
                    invoice_id: invoiceId,
                    payment_mode: payment_mode || 'cash',
                    paid_amount: parseFloat(paid_amount)
                }
            });
        }

        ResponseHandler.created(res, newInvoice, 'Invoice generated and recorded');
    } catch (error) {
        next(error);
    }
};

exports.updateInvoiceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, payment_mode, paid_amount } = req.body;

        if (paid_amount > 0) {
            await prisma.invoice_payments.create({
                data: {
                    invoice_id: id,
                    payment_mode: payment_mode || 'cash',
                    paid_amount: parseFloat(paid_amount)
                }
            });
        }

        const updated = await prisma.invoices.update({
            where: { invoice_id: id },
            data: { status }
        });

        ResponseHandler.success(res, updated, 'Payment records updated');
    } catch (error) {
        next(error);
    }
};

// Requirement 11: Pharmacy & Inventory
exports.getMedicines = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const medicines = await prisma.medicines.findMany({
            where: { clinic_id: clinicId }
        });
        ResponseHandler.success(res, medicines, 'Inventory scanning complete');
    } catch (error) {
        next(error);
    }
};

exports.addMedicine = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const {
            medicine_id,
            medicine_name,
            category,
            manufacturer,
            batch_number,
            expiry_date,
            stock_quantity,
            min_stock,
            purchase_price,
            mrp,
            storage_location
        } = req.body;

        const newMedicine = await prisma.medicines.create({
            data: {
                medicine_id: medicine_id || `MED-${Date.now()}`,
                medicine_name,
                category,
                manufacturer: manufacturer || null,
                batch_number: batch_number || null,
                expiry_date: expiry_date ? new Date(expiry_date) : null,
                stock_quantity: parseInt(stock_quantity) || 0,
                min_stock: min_stock ? parseInt(min_stock) : null,
                purchase_price: purchase_price ? parseFloat(purchase_price) : null,
                mrp: mrp ? parseFloat(mrp) : null,
                storage_location: storage_location || null,
                clinic_id: clinicId
            }
        });

        ResponseHandler.created(res, newMedicine, 'Medicine added to inventory');
    } catch (error) {
        next(error);
    }
};
exports.getNotifications = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;

        // Requirement 13: Notifications
        // Fetch notifications for this clinic. Since notifications table doesn't have clinic_id,
        // we might check notifications linked to this clinic's user_id or specific categories.
        // For now, let's fetch system-wide notifications that might be relevant or 
        // filter by a custom logic if we had a mapping.

        // BETTER: Fetch notifications where the recipient contact matches clinic email/mobile
        const clinic = await prisma.clinics.findUnique({ where: { id: clinicId } });

        const notifications = await prisma.notifications.findMany({
            where: {
                recipients: {
                    some: {
                        OR: [
                            { recipient_contact: clinic.email },
                            { recipient_contact: clinic.mobile }
                        ]
                    }
                }
            },
            include: { recipients: true },
            orderBy: { created_at: 'desc' }
        });

        ResponseHandler.success(res, notifications, 'Neural notification stream synchronized');
    } catch (error) {
        next(error);
    }
};

exports.sendNotification = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { channel, category, recipient, title, message } = req.body;

        // In a real system, we'd trigger SMS/Email gateways here.
        // For now, we record it in the unified notifications table.
        
        const newNotification = await prisma.notifications_unified.create({
            data: {
                channel: channel.toLowerCase(),
                notification_type: category.toUpperCase(),
                title: title,
                message: message,
                status: 'sent', // Assume success for demo
                created_at: new Date()
            }
        });

        ResponseHandler.success(res, newNotification, 'Communication broadcast initiated successfully.');
    } catch (error) {
        next(error);
    }
};
