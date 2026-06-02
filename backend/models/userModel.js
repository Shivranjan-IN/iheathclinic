const prisma = require('../config/database');

class User {
    static async create(userData) {
        const { full_name, email, mobile_number, role, password_hash } = userData;

        // Look up role record by name (roles table has role_id, role_name)
        const roleName = role || 'patient';
        const roleRecord = await prisma.roles.findFirst({ where: { role_name: roleName } });

        const user = await prisma.users.create({
            data: {
                full_name,
                password_hash,
                role: roleName,
                ...(roleRecord ? { roles: { connect: { role_id: roleRecord.role_id } } } : {}),
                emails: email ? {
                    create: {
                        email: email,
                        is_primary: true
                    }
                } : undefined,
                contact_numbers: mobile_number ? {
                    create: {
                        phone_number: mobile_number,
                        is_primary: true
                    }
                } : undefined
            },
            include: {
                emails: {
                    where: { is_primary: true }
                },
                roles: true
            }
        });
        if (user && user.emails && user.emails.length > 0) {
            user.email = user.emails[0].email;
        }
        // Expose role_name as .role for backward compatibility
        user.role = user.roles?.role_name || roleName;
        return user;
    }

    static async findByMobile(mobile) {
        const contactRecord = await prisma.contact_numbers.findFirst({
            where: { phone_number: mobile },
            include: {
                users: {
                    include: {
                        emails: {
                            where: { is_primary: true }
                        },
                        roles: true
                    }
                }
            }
        });
        if (contactRecord && contactRecord.users) {
            const user = contactRecord.users;
            if (user.emails && user.emails.length > 0) {
                user.email = user.emails[0].email;
            }
            user.role = user.role || user.roles?.role_name || null;
            return user;
        }
        return null;
    }

    static async findByEmail(email) {
        const emailRecord = await prisma.emails.findUnique({
            where: { email },
            include: {
                users: {
                    include: {
                        emails: {
                            where: { is_primary: true }
                        },
                        roles: true
                    }
                }
            }
        });
        if (emailRecord && emailRecord.users) {
            const user = emailRecord.users;
            if (user.emails && user.emails.length > 0) {
                user.email = user.emails[0].email;
            }
            user.role = user.role || user.roles?.role_name || null;
            return user;
        }
        return null;
    }

    static async findById(user_id) {
        const user = await prisma.users.findUnique({
            where: { user_id },
            include: {
                emails: {
                    where: { is_primary: true }
                },
                roles: true
            }
        });
        if (user && user.emails && user.emails.length > 0) {
            user.email = user.emails[0].email;
        }
        if (user) {
            user.role = user.role || user.roles?.role_name || null;
        }
        return user;
    }

    static async update(user_id, updates) {
        return await prisma.users.update({
            where: { user_id },
            data: updates
        });
    }
}

module.exports = User;
