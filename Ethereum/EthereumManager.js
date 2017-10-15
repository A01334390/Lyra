//System Specific Libraries
const mongoman = require('../MongoDB/Replicator');
const account = require('../Model/Account');
//Ethereum Libraries
const wallet = require('ethereumjs-wallet');
const tx = require('ethereumjs-tx');
const utils = require('ethereumjs-util');
const ethum = require('ethereumjs-connect');
const ledger = require('ethereumjs-ledger');


//Creates a transaction on the ethereum ledger
var createTransaction = (from, to, amount) => {
    return console.log('Not supported yet..');
};

//Starts up the blockchain
var genesisBlock = (totalSupply) => {
    return console.log('Not supported yet..');
};

//This method manages the connection between Ethereum and Raiden
var manageNodeConnection = () => {
    return console.log('Not supported yet..');
};

//This method creates a new address for an Ethereum Account
//This wallet is NOT suitable for ICAP Direct Mode
var generateAddress = () => {
    return wallet.generate(false);
};

//Checks if the ledger is synced
var ledgerSynced = () => {
    return console.log('Not supported yet..');
};

//Checks which and how many nodes are available
var nodesUp = () => {
    return console.log('Not supported yet..');
};

module.exports = {
    createTransaction,
    genesisBlock,
    manageNodeConnection,
    generateAddress,
    ledgerSynced,
    nodesUp
};