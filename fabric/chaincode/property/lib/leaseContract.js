// Emplacement: fabric/chaincode/property/lib/leaseContract.js
'use strict';
const { Contract } = require('fabric-contract-api');

class LeaseContract extends Contract {
    async createLease(ctx, leaseId, propertyId, landlordId, tenantId, rentAmountCfa, frequency, startIso, endIso) {
        console.info('============= START : Create Lease ===========');

        const leaseKey = `lease:${leaseId}`;
        const exists = await ctx.stub.getState(leaseKey);

        if (exists && exists.length > 0) {
            throw new Error(`Lease ${leaseId} already exists`);
        }

        const lease = {
            id: leaseId,
            propertyId,
            landlordId,
            tenantId,
            rentAmountCfa: Number(rentAmountCfa),
            frequency, // 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
            startIso,
            endIso,
            payments: [],
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            createdBy: ctx.clientIdentity.getID(),
            updatedAt: new Date().toISOString()
        };

        await ctx.stub.putState(leaseKey, Buffer.from(JSON.stringify(lease)));

        // Emit event
        ctx.stub.setEvent('LeaseCreated', Buffer.from(JSON.stringify({
            leaseId,
            propertyId,
            landlordId,
            tenantId,
            rentAmountCfa: Number(rentAmountCfa),
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Create Lease ===========');
        return lease;
    }

    async payRent(ctx, leaseId, paymentId, amountCfa, paidAtIso) {
        console.info('============= START : Pay Rent ===========');

        const leaseKey = `lease:${leaseId}`;
        const bytes = await ctx.stub.getState(leaseKey);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Lease ${leaseId} not found`);
        }

        const lease = JSON.parse(bytes.toString());

        if (lease.status !== 'ACTIVE') {
            throw new Error(`Cannot pay rent for lease with status: ${lease.status}`);
        }

        const payment = {
            paymentId,
            amountCfa: Number(amountCfa),
            paidAtIso,
            paidBy: ctx.clientIdentity.getID(),
            status: 'PAID',
            recordedAt: new Date().toISOString()
        };

        lease.payments.push(payment);
        lease.updatedAt = new Date().toISOString();

        await ctx.stub.putState(leaseKey, Buffer.from(JSON.stringify(lease)));

        // Emit event
        ctx.stub.setEvent('RentPaid', Buffer.from(JSON.stringify({
            leaseId,
            paymentId,
            amountCfa: Number(amountCfa),
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Pay Rent ===========');
        return payment;
    }

    async leaseStatus(ctx, leaseId) {
        console.info('============= START : Get Lease Status ===========');

        const leaseKey = `lease:${leaseId}`;
        const bytes = await ctx.stub.getState(leaseKey);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Lease ${leaseId} not found`);
        }

        const lease = JSON.parse(bytes.toString());
        const totalPaid = lease.payments.reduce((sum, payment) => sum + payment.amountCfa, 0);

        // Calculate expected payments based on frequency
        const startDate = new Date(lease.startIso);
        const currentDate = new Date();
        const endDate = new Date(lease.endIso);

        let expectedPayments = 0;
        if (currentDate < endDate) {
            const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                (currentDate.getMonth() - startDate.getMonth());

            if (lease.frequency === 'MONTHLY') {
                expectedPayments = monthsDiff;
            } else if (lease.frequency === 'QUARTERLY') {
                expectedPayments = Math.floor(monthsDiff / 3);
            } else if (lease.frequency === 'YEARLY') {
                expectedPayments = Math.floor(monthsDiff / 12);
            }
        }

        const expectedAmount = expectedPayments * lease.rentAmountCfa;
        const balance = totalPaid - expectedAmount;

        console.info('============= END : Get Lease Status ===========');
        return {
            leaseId,
            status: lease.status,
            totalPaid,
            expectedAmount,
            balance,
            isUpToDate: balance >= 0,
            rentAmountCfa: lease.rentAmountCfa,
            paymentsCount: lease.payments.length,
            payments: lease.payments
        };
    }

    async closeLease(ctx, leaseId) {
        console.info('============= START : Close Lease ===========');

        const leaseKey = `lease:${leaseId}`;
        const bytes = await ctx.stub.getState(leaseKey);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Lease ${leaseId} not found`);
        }

        const lease = JSON.parse(bytes.toString());
        lease.status = 'CLOSED';
        lease.closedAt = new Date().toISOString();
        lease.closedBy = ctx.clientIdentity.getID();
        lease.updatedAt = new Date().toISOString();

        await ctx.stub.putState(leaseKey, Buffer.from(JSON.stringify(lease)));

        // Emit event
        ctx.stub.setEvent('LeaseClosed', Buffer.from(JSON.stringify({
            leaseId,
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Close Lease ===========');
        return lease;
    }

    async getLease(ctx, leaseId) {
        const leaseKey = `lease:${leaseId}`;
        const bytes = await ctx.stub.getState(leaseKey);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Lease ${leaseId} not found`);
        }

        return JSON.parse(bytes.toString());
    }

    async queryLeasesByProperty(ctx, propertyId) {
        const queryString = {
            selector: {
                propertyId: propertyId
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const leases = [];

        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                leases.push(JSON.parse(result.value.value.toString('utf8')));
            }
            result = await iterator.next();
        }
        await iterator.close();
        return leases;
    }

    async queryLeasesByTenant(ctx, tenantId) {
        const queryString = {
            selector: {
                tenantId: tenantId
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const leases = [];

        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                leases.push(JSON.parse(result.value.value.toString('utf8')));
            }
            result = await iterator.next();
        }
        await iterator.close();
        return leases;
    }
}

module.exports = LeaseContract;
