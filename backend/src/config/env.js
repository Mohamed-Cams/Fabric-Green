// Emplacement: backend/src/config/env.js
require('dotenv').config();

module.exports = {
    // Server
    PORT: process.env.PORT || 4000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Security
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

    // Database
    DB_URL: process.env.DB_URL || 'postgres://postgres:postgres@localhost:5432/greenland',

    // Hyperledger Fabric
    FABRIC_WALLET: process.env.FABRIC_WALLET || '../fabric/network/wallets',
    FABRIC_CONNECTIONS_DIR: process.env.FABRIC_CONNECTIONS_DIR || '../fabric/network/connection-profiles',

    // MinIO (S3-compatible storage)
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
    MINIO_PORT: parseInt(process.env.MINIO_PORT || '9000'),
    MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minio',
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minio123',
    MINIO_BUCKET: process.env.MINIO_BUCKET || 'greenland-docs',

    // Payment providers
    STRIPE_KEY: process.env.STRIPE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

    WAVE_API_KEY: process.env.WAVE_API_KEY,
    WAVE_API_URL: process.env.WAVE_API_URL || 'https://api.wave.sn',

    OM_API_KEY: process.env.OM_API_KEY,
    OM_API_URL: process.env.OM_API_URL || 'https://api.orange.sn/om',

    // Green T SARL accounts (commission 3%)
    GREEN_T_WAVE_ACCOUNT: process.env.GREEN_T_WAVE_ACCOUNT,
    GREEN_T_OM_ACCOUNT: process.env.GREEN_T_OM_ACCOUNT,
    GREEN_T_BANK_IBAN: process.env.GREEN_T_BANK_IBAN,
    COMMISSION_RATE: parseFloat(process.env.COMMISSION_RATE || '0.03'), // 3%

    // SMTP (for notifications)
    SMTP_HOST: process.env.SMTP_HOST || 'localhost',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM || 'no-reply@greenland.sn',

    // Twilio (SMS)
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_TOKEN: process.env.TWILIO_TOKEN,
    TWILIO_PHONE: process.env.TWILIO_PHONE,

    // AI Services
    VOSK_MODEL_PATH: process.env.VOSK_MODEL_PATH || './models/vosk-model-fr',

    // Observability
    JAEGER_ENDPOINT: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
    METRICS_PORT: parseInt(process.env.METRICS_PORT || '9464'),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
};
