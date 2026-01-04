// Emplacement: fabric/chaincode/property/lib/utils.js
'use strict';

class Utils {
    static validatePropertyId(propertyId) {
        if (!propertyId || typeof propertyId !== 'string') {
            throw new Error('Property ID must be a non-empty string');
        }
        return true;
    }

    static validateAmount(amount) {
        const num = Number(amount);
        if (isNaN(num) || num <= 0) {
            throw new Error('Amount must be a positive number');
        }
        return true;
    }

    static validateDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        return true;
    }

    static calculateCommission(amount, rate = 0.03) {
        return Math.round(Number(amount) * rate);
    }

    static generateId(prefix) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        return `${prefix}-${timestamp}-${random}`;
    }
}

module.exports = Utils;
