const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const session = require('express-session');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Enforce critical environment variables in production
if (process.env.NODE_ENV === 'production') {
    const requiredEnv = ['JWT_SECRET', 'SESSION_SECRET', 'DATABASE_URL'];
    const missing = requiredEnv.filter(name => !process.env[name]);
    if (missing.length > 0) {
        console.error(`❌ Critical production environment variables are missing: ${missing.join(', ')}`);
        process.exit(-1);
    }
} else {
    // In development, warn if key secrets are using default/missing variables
    if (!process.env.JWT_SECRET) {
        console.warn('⚠️ Warning: JWT_SECRET is not set in development.');
    }
    if (!process.env.SESSION_SECRET) {
        console.warn('⚠️ Warning: SESSION_SECRET is not set in development.');
    }
}

const passport = require('./config/passport');

const errorHandler = require('./middleware/errorHandler');
const prisma = require('./config/database');

// Import routes (Will be created next)
const clinicRoutes = require('./routes/clinicRoutes');
const systemRoutes = require('./routes/systemRoutes');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const cartRoutes = require('./routes/cartRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const documentRoutes = require('./routes/documentRoutes');
const clinicDocumentRoutes = require('./routes/clinicDocumentRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const labRoutes = require('./routes/labRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const aiRoutes = require('./routes/aiRoutes').default;
const clinicAiRoutes = require('./routes/clinicAiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
require('./ai/flows/index');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(compression());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Anti-Gravity Healthcare API is operational in orbit' });
});

// API Routes
app.use('/api/clinics', clinicRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/clinic-documents', clinicDocumentRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/lab', labRoutes); // Also mount at /api/lab for frontend compatibility
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/clinic-ai', clinicAiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Coordinate not found in star chart' });
});

const PORT = process.env.PORT || 5000;

const { checkUpcomingAppointments } = require('./utils/reminderJob');
// Check for upcoming appointment alerts every 5 minutes
setInterval(checkUpcomingAppointments, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🚀 Anti-Gravity Healthcare Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, initiating landing sequence');
    prisma.$disconnect(() => {
        console.log('💾 Database connection closed');
        process.exit(0);
    });
});
