// Emplacement: fabric/chaincode/property/lib/propertyContract.js
'use strict';
const { Contract } = require('fabric-contract-api');

class PropertyContract extends Contract {
  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    const properties = [];
    for (const prop of properties) {
      await ctx.stub.putState(prop.id, Buffer.from(JSON.stringify(prop)));
      console.info(`Property ${prop.id} initialized`);
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  async registerProperty(ctx, propertyId, ownerId, metadataJson) {
    console.info('============= START : Register Property ===========');
    
    const exists = await ctx.stub.getState(propertyId);
    if (exists && exists.length > 0) {
      throw new Error(`Property ${propertyId} already exists`);
    }

    const metadata = JSON.parse(metadataJson);
    const property = {
      id: propertyId,
      ownerId,
      status: 'REGISTERED',
      metadata: metadata,
      history: [{
        action: 'REGISTER',
        timestamp: new Date().toISOString(),
        actor: ctx.clientIdentity.getID()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ctx.stub.putState(propertyId, Buffer.from(JSON.stringify(property)));
    console.info('============= END : Register Property ===========');
    return property;
  }

  async transferProperty(ctx, propertyId, newOwnerId, transferDocHash) {
    console.info('============= START : Transfer Property ===========');
    
    const propertyBytes = await ctx.stub.getState(propertyId);
    if (!propertyBytes || propertyBytes.length === 0) {
      throw new Error(`Property ${propertyId} does not exist`);
    }

    const property = JSON.parse(propertyBytes.toString());
    
    // Update property
    const oldOwnerId = property.ownerId;
    property.ownerId = newOwnerId;
    property.status = 'TRANSFERRED';
    property.updatedAt = new Date().toISOString();
    
    property.history.push({
      action: 'TRANSFER',
      timestamp: new Date().toISOString(),
      actor: ctx.clientIdentity.getID(),
      from: oldOwnerId,
      to: newOwnerId,
      documentHash: transferDocHash
    });

    await ctx.stub.putState(propertyId, Buffer.from(JSON.stringify(property)));
    
    // Emit event
    ctx.stub.setEvent('PropertyTransferred', Buffer.from(JSON.stringify({
      propertyId,
      from: oldOwnerId,
      to: newOwnerId,
      timestamp: new Date().toISOString()
    })));

    console.info('============= END : Transfer Property ===========');
    return property;
  }

  async getProperty(ctx, propertyId) {
    const propertyBytes = await ctx.stub.getState(propertyId);
    if (!propertyBytes || propertyBytes.length === 0) {
      throw new Error(`Property ${propertyId} does not exist`);
    }
    return JSON.parse(propertyBytes.toString());
  }

  async getPropertyHistory(ctx, propertyId) {
    const iterator = await ctx.stub.getHistoryForKey(propertyId);
    const history = [];
    
    let result = await iterator.next();
    while (!result.done) {
      if (result.value) {
        const record = {
          txId: result.value.txId,
          timestamp: result.value.timestamp,
          isDelete: result.value.isDelete,
          value: result.value.value.toString('utf8')
        };
        history.push(record);
      }
      result = await iterator.next();
    }
    await iterator.close();
    return history;
  }

  async approveTransaction(ctx, txId, approverId) {
    console.info('============= START : Approve Transaction ===========');
    
    const txBytes = await ctx.stub.getState(`tx:${txId}`);
    if (!txBytes || txBytes.length === 0) {
      throw new Error(`Transaction ${txId} not found`);
    }

    const transaction = JSON.parse(txBytes.toString());
    transaction.status = 'APPROVED';
    transaction.approvedBy = approverId;
    transaction.approvedAt = new Date().toISOString();
    transaction.approverIdentity = ctx.clientIdentity.getID();

    await ctx.stub.putState(`tx:${txId}`, Buffer.from(JSON.stringify(transaction)));
    
    // Emit event
    ctx.stub.setEvent('TransactionApproved', Buffer.from(JSON.stringify({
      txId,
      approvedBy: approverId,
      timestamp: new Date().toISOString()
    })));

    console.info('============= END : Approve Transaction ===========');
    return transaction;
  }

  async queryPropertiesByOwner(ctx, ownerId) {
    const queryString = {
      selector: {
        ownerId: ownerId
      }
    };

    const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    const properties = [];
    
    let result = await iterator.next();
    while (!result.done) {
      if (result.value && result.value.value.toString()) {
        properties.push(JSON.parse(result.value.value.toString('utf8')));
      }
      result = await iterator.next();
    }
    await iterator.close();
    return properties;
  }
}

module.exports = PropertyContract;
