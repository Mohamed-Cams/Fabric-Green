// Emplacement: fabric/chaincode/property/lib/docAccessContract.js
'use strict';
const { Contract } = require('fabric-contract-api');

class DocAccessContract extends Contract {
    async grantAccess(ctx, docId, userId, expiresAtIso) {
        console.info('============= START : Grant Document Access ===========');

        const collection = 'privateDocs';
        const accessKey = `${docId}:${userId}`;

        const payload = {
            docId,
            userId,
            grantedAt: new Date().toISOString(),
            expiresAt: expiresAtIso,
            grantedBy: ctx.clientIdentity.getID(),
            status: 'ACTIVE'
        };

        await ctx.stub.putPrivateData(collection, accessKey, Buffer.from(JSON.stringify(payload)));

        // Create audit log
        const auditKey = `audit:${docId}:${userId}:${Date.now()}`;
        const auditPayload = {
            action: 'GRANT_ACCESS',
            docId,
            userId,
            timestamp: new Date().toISOString(),
            actor: ctx.clientIdentity.getID()
        };
        await ctx.stub.putPrivateData(collection, auditKey, Buffer.from(JSON.stringify(auditPayload)));

        // Emit event
        ctx.stub.setEvent('DocumentAccessGranted', Buffer.from(JSON.stringify({
            docId,
            userId,
            expiresAt: expiresAtIso,
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Grant Document Access ===========');
        return payload;
    }

    async revokeAccess(ctx, docId, userId) {
        console.info('============= START : Revoke Document Access ===========');

        const collection = 'privateDocs';
        const accessKey = `${docId}:${userId}`;

        // Create audit log before deletion
        const auditKey = `audit:${docId}:${userId}:${Date.now()}`;
        const auditPayload = {
            action: 'REVOKE_ACCESS',
            docId,
            userId,
            timestamp: new Date().toISOString(),
            actor: ctx.clientIdentity.getID()
        };
        await ctx.stub.putPrivateData(collection, auditKey, Buffer.from(JSON.stringify(auditPayload)));

        // Delete access
        await ctx.stub.deletePrivateData(collection, accessKey);

        // Emit event
        ctx.stub.setEvent('DocumentAccessRevoked', Buffer.from(JSON.stringify({
            docId,
            userId,
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Revoke Document Access ===========');
        return { revoked: true, docId, userId };
    }

    async auditAccess(ctx, docId, userId) {
        console.info('============= START : Audit Document Access ===========');

        const collection = 'privateDocs';
        const accessKey = `${docId}:${userId}`;

        const data = await ctx.stub.getPrivateData(collection, accessKey);
        if (!data || data.length === 0) {
            return null;
        }

        const access = JSON.parse(data.toString());

        // Check if access has expired
        if (access.expiresAt && new Date(access.expiresAt) < new Date()) {
            access.status = 'EXPIRED';
        }

        console.info('============= END : Audit Document Access ===========');
        return access;
    }

    async getDocumentAccessHistory(ctx, docId) {
        console.info('============= START : Get Document Access History ===========');

        const collection = 'privateDocs';
        const startKey = `audit:${docId}:`;
        const endKey = `audit:${docId}:~`;

        const iterator = await ctx.stub.getPrivateDataByRange(collection, startKey, endKey);
        const history = [];

        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value) {
                history.push(JSON.parse(result.value.value.toString('utf8')));
            }
            result = await iterator.next();
        }
        await iterator.close();

        console.info('============= END : Get Document Access History ===========');
        return history;
    }

    async uploadDocument(ctx, docId, docHash, metadata) {
        console.info('============= START : Upload Document ===========');

        const collection = 'privateDocs';
        const docKey = `doc:${docId}`;

        const document = {
            id: docId,
            hash: docHash,
            metadata: JSON.parse(metadata),
            uploadedBy: ctx.clientIdentity.getID(),
            uploadedAt: new Date().toISOString(),
            status: 'ACTIVE'
        };

        await ctx.stub.putPrivateData(collection, docKey, Buffer.from(JSON.stringify(document)));

        // Emit event
        ctx.stub.setEvent('DocumentUploaded', Buffer.from(JSON.stringify({
            docId,
            hash: docHash,
            timestamp: new Date().toISOString()
        })));

        console.info('============= END : Upload Document ===========');
        return document;
    }
}

module.exports = DocAccessContract;
