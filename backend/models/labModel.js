const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const labModel = {
    createLabOrder: async (orderData) => {
        // Only include fields that exist in the lab_orders table schema
        const validData = {
            patient_id: orderData.patient_id,
            doctor_id: orderData.doctor_id,
            clinic_id: orderData.clinic_id,
            test_type_id: orderData.test_type_id,
            priority: orderData.priority || 'Normal',
            price: orderData.price,
            notes: orderData.notes,
            status: orderData.status || 'Pending',
            order_date: orderData.order_date ? new Date(orderData.order_date) : new Date()
        };

        return await prisma.lab_orders.create({
            data: {
                lab_order_id: `LAB-${Date.now()}`,
                ...validData
            },
            include: {
                patient: {
                    select: {
                        full_name: true,
                        users: {
                            include: {
                                emails: { where: { is_primary: true } }
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        full_name: true
                    }
                }
            }
        });
    },

    getAllLabOrders: async (filters = {}) => {
        const where = {};
        if (filters.clinic_id) where.clinic_id = parseInt(filters.clinic_id);
        if (filters.patient_id) where.patient_id = filters.patient_id;
        if (filters.doctor_id) where.doctor_id = parseInt(filters.doctor_id);
        if (filters.status) where.status = filters.status;

        return await prisma.lab_orders.findMany({
            where,
            include: {
                patient: {
                    select: {
                        full_name: true,
                        users: {
                            include: {
                                emails: { where: { is_primary: true } }
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        full_name: true
                    }
                },
                lab_test_types: true,
                clinic: {
                    select: {
                        clinic_name: true
                    }
                },
                lab_test_results: true,
                lab_samples: true
            },
            orderBy: {
                order_date: 'desc'
            }
        });
    },

    getLabOrderById: async (id) => {
        return await prisma.lab_orders.findUnique({
            where: { lab_order_id: id },
            include: {
                patient: {
                    select: {
                        full_name: true,
                        age: true,
                        gender: true,
                        users: {
                            include: {
                                emails: { where: { is_primary: true } },
                                contact_numbers: { where: { is_primary: true } }
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        full_name: true
                    }
                },
                lab_test_types: true,
                clinic: {
                    select: {
                        clinic_name: true
                    }
                },
                lab_test_results: true,
                lab_samples: true
            }
        });
    },

    updateLabOrderStatus: async (id, status, notes) => {
        return await prisma.lab_orders.update({
            where: { lab_order_id: id },
            data: {
                status,
                ...(notes && { notes })
            }
        });
    },

    deleteLabOrder: async (id) => {
        return await prisma.lab_orders.delete({
            where: { lab_order_id: id }
        });
    },

    getLabByUserId: async (userId) => {
        return await prisma.labs.findUnique({
            where: { user_id: parseInt(userId) },
            include: { address: true }
        });
    },

    getLabDashboardStats: async (labId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalTestsToday,
            totalBookings,
            pendingReports,
            completedReports,
            revenue,
            totalTestsInCatalog,
            techniciansCount,
            totalLabsInSystem,
            totalReportsCount
        ] = await Promise.all([
            prisma.lab_orders.count({
                where: {
                    lab_id: labId,
                    order_date: { gte: today }
                }
            }),
            prisma.lab_orders.count({
                where: { lab_id: labId }
            }),
            prisma.lab_orders.count({
                where: { lab_id: labId, status: { not: 'Completed' } }
            }),
            prisma.lab_orders.count({
                where: { lab_id: labId, status: 'Completed' }
            }),
            prisma.lab_order_items.aggregate({
                where: { lab_orders: { lab_id: labId, status: 'Completed' } },
                _sum: { price: true }
            }),
            prisma.lab_tests.count({
                where: { lab_id: labId }
            }),
            prisma.lab_staff.count({
                where: { lab_id: labId, role: 'technician' }
            }),
            prisma.labs.count(),
            prisma.lab_orders.count({
                where: { lab_id: labId, report_url: { not: null } }
            })
        ]);

        const recentActivity = await prisma.lab_orders.findMany({
            where: { lab_id: labId },
            include: {
                patient: { select: { full_name: true } }
            },
            orderBy: { order_date: 'desc' },
            take: 5
        });

        return {
            totalTestsToday,
            totalBookings,
            pendingReports,
            completedReports,
            revenueSummary: revenue._sum.price || 0,
            totalTests: totalTestsInCatalog,
            orders: totalBookings,
            revenue: revenue._sum.price || 0,
            technicians: techniciansCount,
            labs: totalLabsInSystem,
            reports: totalReportsCount,
            recentActivity
        };
    },

    getLabBookings: async (labId, filters = {}) => {
        const { status, fromDate, toDate, search, page = 1, limit = 10, all = false } = filters;
        const where = { lab_id: labId };
        
        if (status && status !== 'All') {
            where.status = status;
        }
        
        if (fromDate || toDate) {
            where.order_date = {};
            if (fromDate) {
                where.order_date.gte = new Date(fromDate);
            }
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                where.order_date.lte = end;
            }
        }
        
        if (search) {
            where.OR = [
                { lab_order_id: { contains: search, mode: 'insensitive' } },
                { patient: { full_name: { contains: search, mode: 'insensitive' } } }
            ];
        }
        
        // For export, return all records without pagination
        if (all === 'true' || all === true) {
            const bookings = await prisma.lab_orders.findMany({
                where,
                include: {
                    patient: { select: { full_name: true, gender: true, date_of_birth: true, age: true } },
                    doctor: { select: { full_name: true } },
                    clinic: { select: { clinic_name: true } },
                    technician: { select: { id: true, full_name: true, phone: true } },
                    lab_order_items: { include: { lab_test_types: true } }
                },
                orderBy: { order_date: 'desc' }
            });
            return { bookings, total: bookings.length };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        
        const [bookings, total] = await Promise.all([
            prisma.lab_orders.findMany({
                where,
                include: {
                    patient: { select: { full_name: true, gender: true, date_of_birth: true, age: true } },
                    doctor: { select: { full_name: true } },
                    clinic: { select: { clinic_name: true } },
                    technician: { select: { id: true, full_name: true, phone: true } },
                    lab_order_items: { include: { lab_test_types: true } }
                },
                orderBy: { order_date: 'desc' },
                skip,
                take
            }),
            prisma.lab_orders.count({ where })
        ]);
        
        return {
            bookings,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        };
    },

    bulkAssignTechnician: async (labId, orderIds, technicianId) => {
        const tech = await prisma.lab_staff.findFirst({
            where: { id: parseInt(technicianId), lab_id: labId }
        });
        if (!tech) throw new Error('Technician not found or not authorized for this lab');

        // Assign technician and update status to 'Processing'
        return await prisma.$transaction(
            orderIds.map(orderId => 
                prisma.lab_orders.update({
                    where: { lab_order_id: orderId },
                    data: {
                        technician_id: parseInt(technicianId),
                        status: 'Processing',
                        collection_type: 'Home' // Mark collection type as Home if assigning tech
                    }
                })
            )
        );
    },

    getLabTransactions: async (labId, filters = {}) => {
        const orders = await prisma.lab_orders.findMany({
            where: { lab_id: labId },
            include: {
                patient: { select: { full_name: true } },
                lab_order_items: { include: { lab_test_types: true } }
            },
            orderBy: { order_date: 'desc' }
        });

        // Flatten data for billing UI
        return orders.map(order => {
            const totalPrice = order.lab_order_items.reduce((sum, item) => sum + Number(item.price || 0), 0);
            return {
                order_id: order.lab_order_id,
                patient_name: order.patient?.full_name || 'Walking Customer',
                test_name: order.lab_order_items.map(i => i.lab_test_types.test_name).join(', ') || 'Diagnostic Service',
                created_at: order.order_date,
                price: totalPrice,
                payment_status: order.status === 'Completed' ? 'Paid' : 'Pending'
            };
        });
    },

    getLabTests: async (labId) => {
        return await prisma.lab_tests.findMany({
            where: { lab_id: labId },
            orderBy: { test_name: 'asc' }
        });
    },

    addLabTest: async (data) => {
        return await prisma.lab_tests.create({ data });
    },

    updateLabTest: async (testId, data) => {
        return await prisma.lab_tests.update({
            where: { test_id: parseInt(testId) },
            data
        });
    },

    deleteLabTest: async (testId) => {
        return await prisma.lab_tests.delete({
            where: { test_id: parseInt(testId) }
        });
    },

    getLabStaff: async (labId, filters = {}) => {
        const { status, role, sortBy } = filters;
        const where = { lab_id: labId };
        
        if (status) where.is_active = status === 'active';
        if (role) where.role = role;
        
        let orderBy = { full_name: 'asc' };
        if (sortBy === 'status') orderBy = { is_active: 'desc' };
        if (sortBy === 'role') orderBy = { role: 'asc' };
        if (sortBy === 'clearance') orderBy = { security_level: 'desc' };

        return await prisma.lab_staff.findMany({ 
            where, 
            orderBy 
        });
    },

    addLabStaff: async (data) => {
        return await prisma.lab_staff.create({ data });
    },

    updateLabStaff: async (staffId, data) => {
        return await prisma.lab_staff.update({
            where: { id: parseInt(staffId) },
            data
        });
    },

    getClinicConnections: async (labId) => {
        return await prisma.clinic_lab_mapping.findMany({
            where: { lab_id: labId },
            include: {
                clinics: {
                    select: {
                        clinic_name: true,
                        medical_council_reg_no: true,
                        address: true
                    }
                }
            }
        });
    },

    getPotentialPartnerClinics: async (labId) => {
        // Find clinics NOT already mapped to this lab
        const existingMappings = await prisma.clinic_lab_mapping.findMany({
            where: { lab_id: labId },
            select: { clinic_id: true }
        });
        const existingClinicIds = existingMappings.map(m => m.clinic_id);

        return await prisma.clinics.findMany({
            where: {
                id: { notIn: existingClinicIds }
            },
            select: {
                id: true,
                clinic_name: true,
                medical_council_reg_no: true,
                address: {
                    select: {
                        address: true,
                        city: true
                    }
                }
            }
        });
    },

    getClinicMappingReports: async (labId) => {
        // Aggregate statistics of orders from each connected clinic
        const report = await prisma.lab_orders.groupBy({
            by: ['clinic_id'],
            where: { lab_id: labId },
            _count: { lab_order_id: true },
            _sum: { price: true }
        });

        // Enrich with clinic names
        return await Promise.all(report.map(async (item) => {
            if (!item.clinic_id) return null;
            const clinic = await prisma.clinics.findUnique({
                where: { id: item.clinic_id },
                select: { clinic_name: true }
            });
            return {
                clinic_id: item.clinic_id,
                clinic_name: clinic?.clinic_name || 'Direct Order',
                order_count: item._count.lab_order_id,
                total_revenue: item._sum.price || 0
            };
        })).then(results => results.filter(r => r !== null));
    },

    getAllTestTypes: async () => {
        return await prisma.lab_test_types.findMany({
            orderBy: { test_name: 'asc' }
        });
    },

    getLabShifts: async (labId) => {
        return await prisma.lab_shifts.findMany({
            where: { lab_id: labId },
            include: { staff: { select: { full_name: true, role: true } } },
            orderBy: { shift_date: 'desc' }
        });
    },

    createLabShift: async (data) => {
        return await prisma.lab_shifts.create({ data });
    },

    getSchedulingData: async (labId) => {
        const [workingHours, bookingSlots, holidays] = await Promise.all([
            prisma.lab_facility_hours.findMany({ where: { lab_id: labId } }),
            prisma.lab_booking_slots.findMany({ where: { lab_id: labId }, orderBy: { slot_time: 'asc' } }),
            prisma.lab_holidays.findMany({ where: { lab_id: labId }, orderBy: { holiday_date: 'asc' } })
        ]);
        return { workingHours, bookingSlots, holidays };
    },

    updateSchedulingData: async (labId, { workingHours, holidays, slots }) => {
        // Run all updates in a transaction
        return await prisma.$transaction(async (tx) => {
            // Update facility hours
            if (workingHours && workingHours.length > 0) {
                for (const wh of workingHours) {
                    await tx.lab_facility_hours.upsert({
                        where: { lab_id_day_of_week: { lab_id: labId, day_of_week: wh.day } },
                        update: { is_open: wh.isOpen, open_time: wh.openTime || null, close_time: wh.closeTime || null },
                        create: { lab_id: labId, day_of_week: wh.day, is_open: wh.isOpen, open_time: wh.openTime || null, close_time: wh.closeTime || null }
                    });
                }
            }

            // Update booking slots
            if (slots) {
                await tx.lab_booking_slots.deleteMany({ where: { lab_id: labId } });
                if (slots.length > 0) {
                    await tx.lab_booking_slots.createMany({
                        data: slots.map(time => ({ lab_id: labId, slot_time: time, is_active: true }))
                    });
                }
            }

            // Update holidays
            if (holidays) {
                await tx.lab_holidays.deleteMany({ where: { lab_id: labId } });
                if (holidays.length > 0) {
                    await tx.lab_holidays.createMany({
                        data: holidays.map(h => ({
                            lab_id: labId,
                            holiday_date: new Date(h.date),
                            holiday_name: h.name,
                            holiday_type: h.type || 'Public Holiday'
                        }))
                    });
                }
            }

            return true;
        });
    },

    updateLabProfile: async (labId, profileData) => {
        const lab = await prisma.labs.findUnique({
            where: { lab_id: labId },
            include: { address: true }
        });
        if (!lab) throw new Error('Lab not found');

        const { name, owner_name, lab_type, registration_number, establishment_year, contact_number, email, license_number, gst_number, certification, address } = profileData;

        let addressId = lab.address_id;
        if (address) {
            if (addressId) {
                await prisma.addresses.update({
                    where: { address_id: addressId },
                    data: {
                        address: address.address,
                        city: address.city,
                        state: address.state,
                        pin_code: address.pin_code
                    }
                });
            } else {
                const newAddress = await prisma.addresses.create({
                    data: {
                        address: address.address,
                        city: address.city,
                        state: address.state,
                        pin_code: address.pin_code
                    }
                });
                addressId = newAddress.address_id;
            }
        }

        return await prisma.labs.update({
            where: { lab_id: labId },
            data: {
                name,
                owner_name,
                lab_type,
                registration_number,
                establishment_year: establishment_year ? parseInt(establishment_year) : undefined,
                contact_number,
                email,
                license_number,
                gst_number,
                certification,
                address_id: addressId
            },
            include: { address: true }
        });
    },

    createManualInvoice: async (labId, invoiceData) => {
        const { patient_name, gst_number, items, discount = 0, invoice_date = new Date() } = invoiceData;

        let calculatedSubtotal = 0;
        const itemsToCreate = [];
        for (const item of items) {
            const rate = parseFloat(item.rate || item.price || 0);
            const quantity = parseInt(item.quantity || item.qty || 1);
            const amount = rate * quantity;
            calculatedSubtotal += amount;

            itemsToCreate.push({
                service_name: item.service_name || item.description,
                quantity,
                rate,
                amount
            });
        }

        const discountVal = parseFloat(discount);
        const tax = (calculatedSubtotal - discountVal) * 0.18; // 18% GST
        const total_amount = calculatedSubtotal - discountVal + tax;

        return await prisma.invoices.create({
            data: {
                invoice_id: `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                lab_id: labId,
                patient_name,
                gst_number,
                invoice_date: new Date(invoice_date),
                discount: discountVal,
                subtotal: calculatedSubtotal,
                tax,
                total_amount,
                status: 'Paid',
                invoice_items: {
                    create: itemsToCreate
                }
            },
            include: {
                invoice_items: true
            }
        });
    },

    getManualInvoices: async (labId) => {
        return await prisma.invoices.findMany({
            where: {
                lab_id: labId
            },
            include: {
                invoice_items: true
            },
            orderBy: {
                invoice_date: 'desc'
            }
        });
    },

    getSettlementReport: async (labId, fromDate, toDate) => {
        const where = {
            lab_id: labId
        };

        if (fromDate || toDate) {
            where.order_date = {};
            if (fromDate) {
                where.order_date.gte = new Date(fromDate);
            }
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                where.order_date.lte = end;
            }
        }

        const bookings = await prisma.lab_orders.findMany({
            where,
            include: {
                patient: { select: { full_name: true } },
                lab_order_items: true
            },
            orderBy: { order_date: 'desc' }
        });

        let totalBookings = bookings.length;
        let totalRevenue = 0;
        let completedRevenue = 0;
        let pendingRevenue = 0;

        const bookingsList = bookings.map(booking => {
            const bookingPrice = booking.lab_order_items.reduce((sum, item) => sum + Number(item.price || 0), 0);
            
            if (booking.status === 'Completed') {
                completedRevenue += bookingPrice;
            } else if (booking.status !== 'Cancelled') {
                pendingRevenue += bookingPrice;
            }

            totalRevenue += bookingPrice;

            return {
                bookingId: booking.lab_order_id,
                patientName: booking.patient?.full_name || 'Walking Customer',
                date: booking.order_date,
                status: booking.status,
                amount: bookingPrice
            };
        });

        const tax = completedRevenue * 0.18;
        const labEarnings = completedRevenue - tax;

        return {
            fromDate,
            toDate,
            totalBookings,
            totalRevenue,
            completedRevenue,
            pendingRevenue,
            tax,
            labEarnings,
            bookings: bookingsList
        };
    }
};

module.exports = labModel;
