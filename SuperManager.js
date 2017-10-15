//System Specific Libraries
const ethereum = require('./Ethereum/EthereumManager');
const mongoman = require('./MongoDB/Replicator');

//Shows an specific statistical view
var statisticsView = (desiredTransactions,transactionsMade,executionTime) => {
    return console.log('Not supported yet..');    
}

//Makes the connection to the Transaction Daemon
var createTransaction = (from,to,amount) =>{
    return console.log('Not supported yet..');
}

//Creates a specific Account
var createAccount = () => {
    return console.log('Not supported yet..');    
}

//Starts the gremlin test up
var gremlinTest = (mode) => {
    return console.log('Not supported yet..');    
}

module.exports = {
    statisticsView,
    createAccount,
    createTransaction,
    gremlinTest
};