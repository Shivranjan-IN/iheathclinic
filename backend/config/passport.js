const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Google OAuth callback triggered for:', profile.emails?.[0]?.value);
      
      try {
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName || 'Google User';
        
        if (!email) {
          console.error('No email in Google profile');
          return done(new Error('No email provided by Google'), null);
        }

        console.log('Processing Google user:', email);

        // First, try to find user by email via the emails table
        const emailRecord = await prisma.emails.findUnique({
          where: { email: email },
          include: { users: true }
        });
        let user = emailRecord ? emailRecord.users : null;

        console.log('Existing user found:', user ? `ID: ${user.user_id}` : 'No');

        if (!user) {
          console.log('Creating new user...');

          // Look up the 'patient' role to connect via FK
          const patientRole = await prisma.roles.findFirst({
            where: { role_name: 'patient' }
          });

          // Create new user with nested email record
          user = await prisma.users.create({
            data: {
              full_name: fullName,
              password_hash: await bcrypt.hash(Math.random().toString(36), 10),
              ...(patientRole ? { roles: { connect: { role_id: patientRole.role_id } } } : {}),
              emails: {
                create: {
                  email: email,
                  is_primary: true
                }
              }
            }
          });
          console.log('User created with ID:', user.user_id);

          // Generate patient_id
          const patientId = `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          console.log('Creating patient record with ID:', patientId);

          try {
            // Create patient record linked to the user (note: no email column in patients table)
            const patient = await prisma.patients.create({
              data: {
                patient_id: patientId,
                user_id: user.user_id,
                full_name: fullName
              }
            });
            console.log('Patient record created successfully:', patient.patient_id);
          } catch (patientError) {
            console.error('Error creating patient record:', patientError.message);
            // Continue anyway - user is created, patient can be created later
          }
        } else {
          console.log('User exists, checking for patient record...');
          // Check if patient record exists for this user
          const existingPatient = await prisma.patients.findFirst({
            where: { user_id: user.user_id }
          });

          console.log('Existing patient:', existingPatient ? existingPatient.patient_id : 'No');

          if (!existingPatient) {
            // Create patient record for existing user
            const patientId = `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            console.log('Creating patient record for existing user with ID:', patientId);
            
            const patient = await prisma.patients.create({
              data: {
                patient_id: patientId,
                user_id: user.user_id,
                full_name: user.full_name
              }
            });
            console.log('Patient record created for existing user:', patient.patient_id);
          } else {
            console.log('Patient record already exists:', existingPatient.patient_id);
          }
        }

        console.log('Google OAuth processing complete for:', email);
        user.email = email;
        return done(null, user);
      } catch (error) {
        console.error('Passport strategy error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: userId }
    });

    if (!user) throw new Error('User not found');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
