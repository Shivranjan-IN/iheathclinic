const prisma = require('../config/database');

/**
 * Common utility to create a notification in the notifications_unified table
 * @param {Object} params
 * @param {number} params.userId - The ID of the user to notify
 * @param {string} params.type - Categorization (e.g., 'PRESCRIPTION', 'APPOINTMENT', 'MEDICINE')
 * @param {string} params.title - Short title of the alert
 * @param {string} params.message - Detailed body of the notification
 * @param {string} [params.channel='IN_APP'] - Delivery channel
 * @returns {Promise<Object>} The created notification record
 */
async function createNotification({ userId, type, title, message, channel = 'IN_APP' }) {
    try {
        if (!userId) {
            console.error('UserId is required for creating notification');
            return null;
        }

        const notification = await prisma.notifications_unified.create({
            data: {
                user_id: userId,
                notification_type: type,
                title: title,
                message: message,
                status: 'UNREAD',
                channel: channel
            }
        });

        return notification;
    } catch (error) {
        console.error('Error in createNotification helper:', error);
        return null; // Don't crash the main process if notification fails
    }
}

module.exports = { createNotification };
