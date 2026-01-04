// Emplacement: backend/src/utils/otel.js
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { JAEGER_ENDPOINT } = require('../config/env');
const logger = require('./logger');

/**
 * Initialize OpenTelemetry tracing
 */
function initTracing() {
    try {
        const provider = new NodeTracerProvider();

        const jaegerExporter = new JaegerExporter({
            endpoint: JAEGER_ENDPOINT,
        });

        provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
        provider.register();

        registerInstrumentations({
            instrumentations: [
                new HttpInstrumentation(),
                new ExpressInstrumentation(),
            ],
        });

        logger.info('OpenTelemetry tracing initialized');
    } catch (error) {
        logger.warn(`Failed to initialize OpenTelemetry: ${error.message}`);
    }
}

module.exports = { initTracing };
