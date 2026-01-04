// Emplacement: backend/src/services/notification.service.js
const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = require('../config/env');
const logger = require('../utils/logger');
const { recordNotification } = require('../utils/metrics');

// Configure email transporter
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: SMTP_USER ? {
        user: SMTP_USER,
        pass: SMTP_PASS
    } : undefined
});

/**
 * Send email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @param {string} html - Email body (HTML)
 */
async function sendEmail(to, subject, text, html = null) {
    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM,
            to,
            subject,
            text,
            html: html || text
        });

        logger.info(`Email sent to ${to}: ${info.messageId}`);
        recordNotification('email', 'general');
        return info;
    } catch (error) {
        logger.error(`Email send error: ${error.message}`);
        throw error;
    }
}

/**
 * Send SMS notification (placeholder - integrate with Twilio or local SMS gateway)
 * @param {string} to - Recipient phone number
 * @param {string} text - SMS text
 */
async function sendSMS(to, text) {
    try {
        // Placeholder implementation
        // In production, integrate with Twilio or local SMS gateway
        logger.info(`SMS would be sent to ${to}: ${text}`);
        recordNotification('sms', 'general');

        return { status: 'SENT', to, text };
    } catch (error) {
        logger.error(`SMS send error: ${error.message}`);
        throw error;
    }
}

/**
 * Send late payment notification
 */
async function sendLatePaymentNotification(customer, leaseId, amountDue) {
    const subject = 'Alerte: Retard de paiement de loyer';
    const text = `Bonjour,\n\nVotre paiement pour le bail ${leaseId} est en retard.\nMontant dû: ${amountDue} CFA\n\nMerci de régulariser votre situation.\n\nCordialement,\nGreenLand Fabric`;

    if (customer.email) {
        await sendEmail(customer.email, subject, text);
    }

    if (customer.phone) {
        await sendSMS(customer.phone, `Retard de paiement bail ${leaseId}. Montant: ${amountDue} CFA. Merci de régulariser.`);
    }

    recordNotification('multi', 'late_payment');
}

module.exports = {
    sendEmail,
    sendSMS,
    sendLatePaymentNotification
};
