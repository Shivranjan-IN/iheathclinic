const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

/**
 * Get all notifications for the logged-in user
 */
exports.getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const notifications = await prisma.notifications_unified.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        ResponseHandler.success(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        const notification = await prisma.notifications_unified.updateMany({
            where: {
                notification_id: id,
                user_id: userId
            },
            data: {
                status: 'READ'
            }
        });

        if (notification.count === 0) {
            return ResponseHandler.error(res, 'Notification not found or access denied', 404);
        }

        ResponseHandler.success(res, null, 'Notification marked as read');
    } catch (error) {
        next(error);
    }
};

/**
 * Mark all notifications as read for the user
 */
exports.markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        await prisma.notifications_unified.updateMany({
            where: {
                user_id: userId,
                status: 'UNREAD'
            },
            data: {
                status: 'READ'
            }
        });

        ResponseHandler.success(res, null, 'All notifications marked as read');
    } catch (error) {
        next(error);
    }
};
