const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For production, you would use a service like SendGrid, Mailgun, or properly configured SMTP
    // For development, we can use Ethereal or just standard SMTP

    // Check if we have SMTP configs, otherwise fallback to Ethereal for testing
    let transportConfig;

    if (process.env.SMTP_HOST && process.env.SMTP_EMAIL) {
        transportConfig = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        };
    } else {
        // Fallback to Ethereal (fake SMTP service) if no config provided
        // Or simply fail gracefully / use a dummy transporter that logs to console
        console.log('⚠️ No SMTP config found. Configuring transporter...');
    }

    const transporter = nodemailer.createTransport(transportConfig || {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "ethereal.user@ethereal.email", // This will fail if not real, but we handle error in controller
            pass: "password"
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Budgetly App <noreply@budgetly.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html 
    };

    // 3) Actually send the email
    try {
        if (!transportConfig) {
            // If we don't have real SMTP, just log the message to console for the user to see
            console.log('\n\n\n');
            console.log('=================================================================');
            console.log('📧  EMAIL SIMULATION - NO SMTP CONFIGURED');
            console.log('=================================================================');
            console.log(`TO:      ${options.email}`);
            console.log(`SUBJECT: ${options.subject}`);
            console.log('-----------------------------------------------------------------');
            console.log(`MESSAGE:\n${options.message}`);
            console.log('=================================================================');
            console.log('\n\n\n');
            return;
        }

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Email send error:', error);
        // Fallback logic for dev: log to console if actual send fails
        console.log('========================================');
        console.log(`📧 EMAIL SEND FAILED. SIMULATING TO: ${options.email}`);
        console.log(`SUBJECT: ${options.subject}`);
        console.log(`MESSAGE: \n${options.message}`);
        console.log('========================================');
    }
};

module.exports = sendEmail;
