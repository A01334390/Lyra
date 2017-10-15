//System Specific Libraries
const ethereum = require('../Ethereum/EthereumManager');
//Needed Libraries
const {
    mongoose
} = require('./mongoose');
const {
    Account
} = require('../Model/Account');

//This method checks if all Nodes are connected
var manageNodeConnection = () => {
    return console.log('Not supported yet..');
};

//This method creates an account record
var persistAccount = (address, balance) => {
    var wallet = ethereum.generateAddress();
    Account.create({
        privAddress: wallet.privAddress,
        pubAddress: wallet.pubAddress,
        balance: (Math.random() + 1) * 100
    }).then((error, account) => {
        if (error) {
            console.log('This account wasnt created properly');
        }

        return account;
    });
}

//This method updates an account record
var updateAccount = (pubAddress, balance) => {
    Account.findByIdAndUpdate({
        pubAddress: pubAddress
    }, {
        $set: {
            balance: balance
        }
    }).then((err, acc) => {
        if (err) {
            console.log('An error was thrown while saving data');
        }
    });
}

//this method receives an account object
var getAccount = (address) => {
    Account.findOne({
        pubAddress: address
    }).then((account) => {
        return account;
    });
}

module.exports = {
    manageNodeConnection,
    persistAccount,
    updateAccount,
    getAccount
}