// Emplacement: fabric/chaincode/property/index.js
'use strict';

const PropertyContract = require('./lib/propertyContract');
const DocAccessContract = require('./lib/docAccessContract');
const TokenContract = require('./lib/tokenContract');
const LeaseContract = require('./lib/leaseContract');

module.exports.contracts = [PropertyContract, DocAccessContract, TokenContract, LeaseContract];
