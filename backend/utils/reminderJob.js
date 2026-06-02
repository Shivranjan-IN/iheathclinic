const prisma = require('../config/database');
const { createNotification } = require('./notificationHelper');

/**
 * Background job to check for upcoming appointments and send a 2-hour reminder alert.
 */
async function checkUpcomingAppointments() {
    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() + 2.25 * 60 * 60 * 1000); // Check within a 15-minute window

        console.log(`[ReminderJob] Checking for appointments between ${twoHoursFromNow.toISOString()} and ${windowEnd.toISOString()}`);

        const appointments = await prisma.appointments.findMany({
            where: {
                status: 'scheduled',
                appointment_date: {
                    gte: now,
                    lte: windowEnd
                }
            },
            include: {
                patient: {
                    select: {
                        user_id: true,
                        full_name: true
                    }
                },
                doctor: {
                    select: {
                        full_name: true
                    }
                }
            }
        });

        for (const appt of appointments) {
            if (!appt.patient?.user_id || !appt.appointment_time) continue;

            // Extract time from appointment_time (Time) and combine with appointment_date (Date)
            const apptTime = new Date(appt.appointment_time);
            const apptDateTime = new Date(appt.appointment_date);
            apptDateTime.setUTCHours(apptTime.getUTCHours(), apptTime.getUTCMinutes(), apptTime.getUTCSeconds());

            const diffMs = apptDateTime.getTime() - now.getTime();
            const diffMins = diffMs / (1000 * 60);

            // If within 110-130 minutes window
            if (diffMins >= 110 && diffMins <= 135) {
                const title = 'Upcoming Consultation Reminder';
                const message = `Your appointment with Dr. ${appt.doctor?.full_name || 'Expert'} is in 2 hours (${apptDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`;

                // Check for existing notification to avoid spamming
                const existing = await prisma.notifications_unified.findFirst({
                    where: {
                        user_id: appt.patient.user_id,
                        title: title,
                        message: {
                            contains: appt.appointment_id
                        }
                    }
                });

                if (!existing) {
                    await createNotification({
                        userId: appt.patient.user_id,
                        type: 'APPOINTMENT_REMINDER',
                        title: title,
                        message: `${message} [Ref: ${appt.appointment_id}]`
                    });
                    console.log(`[ReminderJob] Sent 2-hour reminder for Appt ID: ${appt.appointment_id} to User ID: ${appt.patient.user_id}`);
                }
            }
        }
    } catch (error) {
        console.error('[ReminderJob] Error in background task:', error);
    }
}

// Export the function to be called from server.js
module.exports = { checkUpcomingAppointments };
