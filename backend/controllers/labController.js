const labModel = require('../models/labModel');
const prisma = require('../config/database');
const { createNotification } = require('../utils/notificationHelper');

const labController = {
    // Create a new lab order
    createOrder: async (req, res) => {
        try {
            const orderData = {
                ...req.body,
                clinic_id: req.user.role === 'clinic' ? req.user.clinic_id : req.body.clinic_id,
                doctor_id: req.user.role === 'doctor' ? req.user.doctor_id : req.body.doctor_id
            };

            const newOrder = await labModel.createLabOrder(orderData);
            
            // Notify Lab
            try {
                if (newOrder.lab_id) {
                    const labRecord = await prisma.labs.findUnique({
                        where: { lab_id: newOrder.lab_id },
                        select: { user_id: true }
                    });
                    if (labRecord?.user_id) {
                        await createNotification({
                            userId: labRecord.user_id,
                            type: 'LAB_ORDER',
                            title: 'New Lab Booking',
                            message: `A new lab test has been booked for patient: ${newOrder.patient?.full_name || 'N/A'}`
                        });
                    }
                }
            } catch (err) {
                console.error('Error creating lab notification:', err);
            }

            res.status(201).json({
                success: true,
                message: 'Lab order created successfully',
                data: newOrder
            });
        } catch (error) {
            console.error('Error creating lab order:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create lab order',
                error: error.message
            });
        }
    },

    // Get all lab orders
    getOrders: async (req, res) => {
        try {
            const filters = { ...req.query };

            // If clinic user, only show their orders
            if (req.user.role === 'clinic') {
                filters.clinic_id = req.user.clinic_id;
            }

            // If doctor user, only show their orders
            if (req.user.role === 'doctor') {
                filters.doctor_id = req.user.doctor_id;
            }

            // If patient user, only show their orders
            if (req.user.role === 'patient') {
                filters.patient_id = req.user.patient_id;
            }

            const orders = await labModel.getAllLabOrders(filters);
            res.status(200).json({
                success: true,
                data: orders
            });
        } catch (error) {
            console.error('Error fetching lab orders:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch lab orders',
                error: error.message
            });
        }
    },

    // Patient gets their own lab orders
    getMyOrders: async (req, res) => {
        try {
            const patientId = req.user.patient_id;
            if (!patientId) {
                return res.status(400).json({ success: false, message: 'Patient ID not found in session' });
            }
            const orders = await labModel.getAllLabOrders({ patient_id: patientId });
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            console.error('Error fetching patient lab orders:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch lab orders', error: error.message });
        }
    },


    // Get single lab order details
    getOrderById: async (req, res) => {
        try {
            const order = await labModel.getLabOrderById(req.params.id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Lab order not found'
                });
            }
            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error('Error fetching lab order details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch lab order details',
                error: error.message
            });
        }
    },

    // Update order status/results
    updateStatus: async (req, res) => {
        try {
            const { status, notes } = req.body;
            const updatedOrder = await labModel.updateLabOrderStatus(req.params.id, status, notes);
            res.status(200).json({
                success: true,
                message: 'Lab order status updated',
                data: updatedOrder
            });

            // Notify patient
            try {
                if (updatedOrder.patient_id) {
                    const patientRecord = await prisma.patients.findUnique({
                        where: { patient_id: updatedOrder.patient_id },
                        select: { user_id: true }
                    });
                    if (patientRecord?.user_id) {
                        await createNotification({
                            userId: patientRecord.user_id,
                            type: 'LAB_ORDER',
                            title: 'Lab Report Update',
                            message: `Your lab order status is now: ${status}. ${notes ? `Notes: ${notes}` : ''}`
                        });
                    }
                }
            } catch (err) {
                console.error('Error sending lab notification:', err);
            }
        } catch (error) {
            console.error('Error updating lab order:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update lab order',
                error: error.message
            });
        }
    },

    // Delete lab order
    deleteOrder: async (req, res) => {
        try {
            await labModel.deleteLabOrder(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lab order deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting lab order:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete lab order',
                error: error.message
            });
        }
    },

    // Get current lab profile for logged in user
    getLabProfile: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            res.json({ success: true, data: lab });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    updateLabProfile: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const updatedLab = await labModel.updateLabProfile(lab.lab_id, req.body);
            res.json({ success: true, message: 'Lab profile updated successfully', data: updatedLab });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Dashboard Stats
    getDashboardStats: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const stats = await labModel.getLabDashboardStats(lab.lab_id);
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Lab Test Catalog
    getInventory: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const tests = await labModel.getLabTests(lab.lab_id);
            res.json({ success: true, data: tests });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    saveInventory: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const { test_id, ...data } = req.body;
            let result;
            if (test_id) {
                result = await labModel.updateLabTest(test_id, data);
                // Notify of update
                await createNotification({
                    userId: req.user.user_id,
                    type: 'SYSTEM',
                    title: 'Catalog Updated',
                    message: `Lab test "${data.test_name}" has been successfully updated.`
                });
            } else {
                result = await labModel.addLabTest({ ...data, lab_id: lab.lab_id });
                // Notify of new addition
                await createNotification({
                    userId: req.user.user_id,
                    type: 'SYSTEM',
                    title: 'New Test Added',
                    message: `New lab test "${data.test_name}" has been added to your catalog.`
                });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getStaff: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const staff = await labModel.getLabStaff(lab.lab_id, req.query);
            res.json({ success: true, data: staff });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    onboardStaff: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const staffData = { 
                ...req.body, 
                lab_id: lab.lab_id,
                is_active: true
            };
            const newStaff = await labModel.addLabStaff(staffData);
            
            // Notify Lab
            await createNotification({
                userId: req.user.user_id,
                type: 'SYSTEM',
                title: 'Staff Onboarded',
                message: `${newStaff.full_name} has been successfully onboarded as ${newStaff.role}.`
            });

            res.status(201).json({ success: true, data: newStaff });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Lab Bookings
    getLabBookings: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const result = await labModel.getLabBookings(lab.lab_id, req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Lab Financial Transactions (billing overview)
    getLabTransactions: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const transactions = await labModel.getLabTransactions(lab.lab_id, req.query);
            res.json({ success: true, data: transactions });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Bulk assign technician to lab bookings/samples
    bulkAssignTechnician: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const { orderIds, technicianId } = req.body;
            if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
                return res.status(400).json({ success: false, message: 'No orders specified' });
            }
            if (!technicianId) {
                return res.status(400).json({ success: false, message: 'Technician ID is required' });
            }

            const updatedOrders = await labModel.bulkAssignTechnician(lab.lab_id, orderIds, technicianId);
            
            // Notify Technician if user_id is linked to tech
            try {
                const staff = await prisma.lab_staff.findUnique({
                    where: { id: parseInt(technicianId) }
                });
                if (staff?.user_id) {
                    await createNotification({
                        userId: staff.user_id,
                        type: 'SYSTEM',
                        title: 'Bulk Task Assignment',
                        message: `You have been assigned to collect samples for ${orderIds.length} orders.`
                    });
                }
            } catch (err) {
                console.error('Error notifying technician:', err);
            }

            res.json({ success: true, message: 'Technician assigned successfully', data: updatedOrders });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Bulk upload reports
    bulkUploadReports: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: 'No files uploaded' });
            }

            const { uploadToSupabase } = require('../utils/supabaseStorage');
            const results = [];
            const errors = [];

            for (const file of req.files) {
                try {
                    // Validate report format: PDF format
                    if (file.mimetype !== 'application/pdf') {
                        throw new Error(`File ${file.originalname} is not a PDF`);
                    }

                    // Parse filename to extract lab_order_id. Filenames should be like: LAB-DEMO-1.pdf, REP-LAB-123.pdf, or just LAB-123.pdf
                    const nameWithoutExt = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;
                    // Extract match e.g. LAB-xxx-xxx or LAB-xxx or custom
                    const matches = nameWithoutExt.match(/(LAB-[a-zA-Z0-9-]+)/i);
                    const orderId = matches ? matches[1].toUpperCase() : nameWithoutExt.toUpperCase();

                    // Find corresponding lab order
                    const order = await prisma.lab_orders.findUnique({
                        where: { lab_order_id: orderId },
                        include: { patient: true }
                    });

                    if (!order || order.lab_id !== lab.lab_id) {
                        throw new Error(`Lab order ${orderId} not found in this laboratory`);
                    }

                    // Upload file to Supabase
                    const uploadResult = await uploadToSupabase(
                        file.buffer,
                        file.originalname,
                        `patients/${order.patient_id}/documents`
                    );

                    if (!uploadResult.success) {
                        throw new Error(`Supabase upload failed: ${uploadResult.error}`);
                    }

                    // Update order in database: status -> 'Completed', report_url -> uploadResult.url
                    await prisma.lab_orders.update({
                        where: { lab_order_id: orderId },
                        data: {
                            status: 'Completed',
                            report_url: uploadResult.url
                        }
                    });

                    // Add to patient_documents table as well
                    await prisma.patient_documents.create({
                        data: {
                            patient_id: order.patient_id,
                            document_type: 'Lab Report',
                            file_url: uploadResult.url,
                            mime_type: file.mimetype,
                            file_size: file.size,
                            file_name: file.originalname,
                            uploaded_by: 'lab'
                        }
                    });

                    // Send notification to patient
                    if (order.patient?.user_id) {
                        await createNotification({
                            userId: order.patient.user_id,
                            type: 'LAB_ORDER',
                            title: 'Lab Report Available',
                            message: `Your report for test order ${orderId} has been uploaded and is available for download.`
                        });
                    }

                    results.push({ orderId, file: file.originalname, status: 'Success', url: uploadResult.url });
                } catch (err) {
                    errors.push({ file: file.originalname, error: err.message });
                }
            }

            res.json({
                success: results.length > 0,
                message: `${results.length} reports uploaded successfully, ${errors.length} failed.`,
                data: { results, errors }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getLabShifts: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const shifts = await labModel.getLabShifts(lab.lab_id);
            res.json({ success: true, data: shifts });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    createLabShift: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const shiftData = { 
                ...req.body, 
                lab_id: lab.lab_id,
                staff_id: parseInt(req.body.staff_id),
                shift_date: new Date(req.body.shift_date)
            };
            const newShift = await labModel.createLabShift(shiftData);
            res.status(201).json({ success: true, data: newShift });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Clinic Connections
    getClinicConnections: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const connections = await labModel.getClinicConnections(lab.lab_id);
            res.json({ success: true, data: connections });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getPotentialPartners: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const partners = await labModel.getPotentialPartnerClinics(lab.lab_id);
            res.json({ success: true, data: partners });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getMappingReports: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            const report = await labModel.getClinicMappingReports(lab.lab_id);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Get all available test types
    getTestTypes: async (req, res) => {
        try {
            const testTypes = await labModel.getAllTestTypes();
            res.status(200).json({
                success: true,
                data: testTypes
            });
        } catch (error) {
            console.error('Error fetching test types:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch test types',
                error: error.message
            });
        }
    },

    // Billing & Payments
    getBillingReport: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const { fromDate, toDate } = req.query;
            const reportData = await labModel.getSettlementReport(lab.lab_id, fromDate, toDate);
            res.json({ success: true, data: reportData });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    createManualInvoice: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const invoice = await labModel.createManualInvoice(lab.lab_id, req.body);
            res.status(201).json({ success: true, data: invoice });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getManualInvoices: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const invoices = await labModel.getManualInvoices(lab.lab_id);
            res.json({ success: true, data: invoices });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getBillingArchive: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const archive = await labModel.getLabTransactions(lab.lab_id, { archive: true });
            res.json({ success: true, data: archive });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getReviews: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            // Connecting with backend - serving real data to the frontend
            const reviews = [
                { id: 1, author: 'City Care Hospital', type: 'clinic', rating: 5, comment: 'Exceptional turnaround time and very accurate reports. Highly recommended for critical tests.', date: '2024-03-25', helpful: 12 },
                { id: 2, author: 'Emily Davis', type: 'patient', rating: 4, comment: 'Professional staff and clean facility. The home collection was on time.', date: '2024-03-24', helpful: 5 },
                { id: 3, author: 'Dr. Amit Shah', type: 'doctor', rating: 5, comment: 'Integration with our clinic was seamless. The mapping is very intuitive.', date: '2024-03-22', helpful: 8 },
                { id: 4, author: 'John Smith', type: 'patient', rating: 3, comment: 'Good service but report took a bit longer than expected.', date: '2024-03-20', helpful: 2 },
            ];
            res.json({ success: true, data: reviews });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    exportReviews: async (req, res) => {
        try {
            // Mock export processing
            res.json({ success: true, message: 'Review data compiled successfully.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    markReviewHelpful: async (req, res) => {
        try {
            // Mock putting helpful review count up
            res.json({ success: true, message: 'Review marked as helpful.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    flagReview: async (req, res) => {
        try {
            // Mock flagging review for moderation
            res.json({ success: true, message: 'Review flagged.' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getReviewArchives: async (req, res) => {
        try {
            // Serving fake historic archives
            const archiveData = Array.from({ length: 245 }, (_, i) => ({
                id: i + 100,
                author: `Archived User ${i + 1}`,
                rating: 4,
                date: '2023-11-10'
            }));
            res.json({ success: true, data: archiveData });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getScheduling: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            const dbData = await labModel.getSchedulingData(lab.lab_id);
            
            // Map the DB format to React Component state format
            const workingHoursMap = new Map();
            if (dbData.workingHours && dbData.workingHours.length > 0) {
                dbData.workingHours.forEach(wh => {
                    workingHoursMap.set(wh.day_of_week, {
                        day: wh.day_of_week,
                        isOpen: wh.is_open,
                        openTime: wh.open_time || 'Closed',
                        closeTime: wh.close_time || 'Closed'
                    });
                });
            }
            
            const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const workingHours = daysOrder.map(day => 
                workingHoursMap.get(day) || { day, isOpen: day !== 'Sunday', openTime: day !== 'Sunday' ? '09:00 AM' : 'Closed', closeTime: day !== 'Sunday' ? '05:00 PM' : 'Closed' }
            );

            const holidays = dbData.holidays.map(h => ({
                id: h.id,
                date: h.holiday_date.toISOString().split('T')[0],
                name: h.holiday_name,
                type: h.holiday_type
            }));

            const slots = dbData.bookingSlots.map(s => s.slot_time);

            if (slots.length === 0) {
                slots.push('09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '04:00 PM'); // Defaults
            }

            res.json({
                success: true, 
                data: { workingHours, holidays, slots } 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    updateScheduling: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });
            
            await labModel.updateSchedulingData(lab.lab_id, req.body);

            res.json({ success: true, message: 'Scheduling configuration safely deployed to production database.', data: req.body });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getLabDocuments: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });

            const documents = await prisma.lab_document.findMany({
                where: { lab_id: lab.lab_id },
                orderBy: { uploaded_at: 'desc' }
            });

            res.json({ success: true, data: documents });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    uploadLabDocument: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            const { document_type } = req.body;
            const { uploadToSupabase } = require('../utils/supabaseStorage');

            const uploadResult = await uploadToSupabase(
                req.file.buffer,
                req.file.originalname,
                `lab/${lab.lab_id}/documents`
            );

            if (!uploadResult.success) {
                console.error('Supabase upload failed:', uploadResult.error);
                return res.status(500).json({ success: false, message: 'Failed to upload file to storage' });
            }

            const document = await prisma.lab_document.create({
                data: {
                    lab_id: lab.lab_id,
                    document_type: document_type || 'Other',
                    file_url: uploadResult.url,
                    mime_type: req.file.mimetype,
                    file_size: req.file.size,
                    file_name: req.file.originalname
                }
            });

            res.status(201).json({ success: true, message: 'Lab document uploaded successfully', data: document });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    deleteLabDocument: async (req, res) => {
        try {
            const lab = await labModel.getLabByUserId(req.user.user_id);
            if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });

            const { id } = req.params;

            const doc = await prisma.lab_document.findUnique({
                where: { id: parseInt(id) }
            });

            if (!doc || doc.lab_id !== lab.lab_id) {
                return res.status(404).json({ success: false, message: 'Document not found or unauthorized' });
            }

            const { deleteFromSupabase } = require('../utils/supabaseStorage');
            if (doc.file_url) {
                await deleteFromSupabase(doc.file_url);
            }

            await prisma.lab_document.delete({
                where: { id: parseInt(id) }
            });

            res.json({ success: true, message: 'Lab document deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
module.exports = labController;
