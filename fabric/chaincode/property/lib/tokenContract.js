// Emplacement: fabric/chaincode/property/lib/tokenContract.js
'use strict';
const { Contract } = require('fabric-contract-api');

class TokenContract extends Contract {
    async mintFraction(ctx, propertyId, tokenId, totalShares) {
        console.info('============= START : Mint Fractional Token ===========');

        const key = `token:${propertyId}:${tokenId}`;

        // Check if token already exists
        const exists = await ctx.stub.getState(key);
        if (exists && exists.length > 0) {
            throw new Error(`Token ${tokenId} for property ${propertyId} already exists`);
        }

        const token = {
            propertyId,
            tokenId,
            totalShares: Number(totalShares),
            allocations: {},
            createdBy: ctx.clientIdentity.getID(),
            createdAt: new Date().toISOString(),
            status: 'ACTIVE'
        };

        await ctx.stub.putState(key, Buffer.from(JSON.stringify(token)));

        // Emit event
        ctx.stub.setEvent('TokenMinted', Buffer.from(JSON.stringify({
            propertyId,
            tokenId,
            totalShares: Number(totalShares),
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Mint Fractional Token ===========');
        return token;
    }

    async allocateShare(ctx, propertyId, tokenId, userId, shares) {
        console.info('============= START : Allocate Share ===========');

        const key = `token:${propertyId}:${tokenId}`;
        const bytes = await ctx.stub.getState(key);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Token ${tokenId} for property ${propertyId} not found`);
        }

        const token = JSON.parse(bytes.toString());
        const sharesToAllocate = Number(shares);

        // Calculate current allocated shares
        const currentAllocated = Object.values(token.allocations).reduce((sum, val) => sum + val, 0);
        const newTotal = currentAllocated + sharesToAllocate;

        if (newTotal > token.totalShares) {
            throw new Error(`Allocation exceeds total shares. Available: ${token.totalShares - currentAllocated}, Requested: ${sharesToAllocate}`);
        }

        // Allocate shares
        token.allocations[userId] = (token.allocations[userId] || 0) + sharesToAllocate;
        token.updatedAt = new Date().toISOString();

        await ctx.stub.putState(key, Buffer.from(JSON.stringify(token)));

        // Emit event
        ctx.stub.setEvent('ShareAllocated', Buffer.from(JSON.stringify({
            propertyId,
            tokenId,
            userId,
            shares: sharesToAllocate,
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Allocate Share ===========');
        return token;
    }

    async transferShare(ctx, propertyId, tokenId, fromUserId, toUserId, shares) {
        console.info('============= START : Transfer Share ===========');

        const key = `token:${propertyId}:${tokenId}`;
        const bytes = await ctx.stub.getState(key);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Token ${tokenId} for property ${propertyId} not found`);
        }

        const token = JSON.parse(bytes.toString());
        const sharesToTransfer = Number(shares);

        // Check if sender has enough shares
        const senderShares = token.allocations[fromUserId] || 0;
        if (senderShares < sharesToTransfer) {
            throw new Error(`Insufficient shares. Available: ${senderShares}, Requested: ${sharesToTransfer}`);
        }

        // Transfer shares
        token.allocations[fromUserId] -= sharesToTransfer;
        token.allocations[toUserId] = (token.allocations[toUserId] || 0) + sharesToTransfer;

        // Remove allocation if zero
        if (token.allocations[fromUserId] === 0) {
            delete token.allocations[fromUserId];
        }

        token.updatedAt = new Date().toISOString();

        await ctx.stub.putState(key, Buffer.from(JSON.stringify(token)));

        // Emit event
        ctx.stub.setEvent('ShareTransferred', Buffer.from(JSON.stringify({
            propertyId,
            tokenId,
            from: fromUserId,
            to: toUserId,
            shares: sharesToTransfer,
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Transfer Share ===========');
        return token;
    }

    async getToken(ctx, propertyId, tokenId) {
        const key = `token:${propertyId}:${tokenId}`;
        const bytes = await ctx.stub.getState(key);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Token ${tokenId} for property ${propertyId} not found`);
        }

        return JSON.parse(bytes.toString());
    }

    async getUserShares(ctx, propertyId, tokenId, userId) {
        const token = await this.getToken(ctx, propertyId, tokenId);
        return {
            userId,
            shares: token.allocations[userId] || 0,
            totalShares: token.totalShares,
            percentage: ((token.allocations[userId] || 0) / token.totalShares * 100).toFixed(2)
        };
    }

    async burnToken(ctx, propertyId, tokenId) {
        console.info('============= START : Burn Token ===========');

        const key = `token:${propertyId}:${tokenId}`;
        const bytes = await ctx.stub.getState(key);

        if (!bytes || bytes.length === 0) {
            throw new Error(`Token ${tokenId} for property ${propertyId} not found`);
        }

        const token = JSON.parse(bytes.toString());
        token.status = 'BURNED';
        token.burnedAt = new Date().toISOString();
        token.burnedBy = ctx.clientIdentity.getID();

        await ctx.stub.putState(key, Buffer.from(JSON.stringify(token)));

        // Emit event
        ctx.stub.setEvent('TokenBurned', Buffer.from(JSON.stringify({
            propertyId,
            tokenId,
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Burn Token ===========');
        return token;
    }
}

module.exports = TokenContract;
