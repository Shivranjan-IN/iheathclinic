const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
  },
});

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"I Health Clini" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It will expire in 2 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center;">I Health Clini Password Reset</h2>
        <p style="font-size: 16px; color: #34495e;">Hello,</p>
        <p style="font-size: 16px; color: #34495e;">We received a request to reset your password. Use the following 6-digit OTP to proceed:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #3498db; margin: 0;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #7f8c8d; text-align: center;">This OTP is valid for <strong>120 seconds</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #95a5a6; text-align: center;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    // In dev mode, still log it
    if (process.env.NODE_ENV === 'development') {
      console.log('--- DEVELOPMENT OTP ---');
      console.log(`Email: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log('-----------------------');
      return true; // Still return true for dev flow
    }
    return false;
  }
};

exports.sendResetLink = async (email, link) => {
  const mailOptions = {
    from: `"I Health Clinic" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - I Health Clinic',
    text: `Click the following link to reset your password: ${link}. This link will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center;">I Health Clinic Password Reset</h2>
        <p style="font-size: 16px; color: #34495e;">Hello,</p>
        <p style="font-size: 16px; color: #34495e;">We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #7f8c8d; text-align: center;">This link is valid for <strong>15 minutes</strong>.</p>
        <p style="font-size: 12px; color: #95a5a6; text-align: center; word-break: break-all;">Or copy and paste this link into your browser: <br>${link}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #95a5a6; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending reset link email:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.log('--- DEVELOPMENT PASSWORD RESET LINK ---');
      console.log(`Email: ${email}`);
      console.log(`Link: ${link}`);
      console.log('---------------------------------------');
      return true; // Still return true for dev flow
    }
    return false;
  }
};
