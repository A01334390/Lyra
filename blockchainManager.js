'use strict';
/*
/ ======== Blockchain Manager =========
/ This file does all the Blockchain related actions for Lyra
/ As of now, it works with the latest version of Hyperledger
/ Made by Aabo Technologies © 2017 - Servers Division
/ Last revised > October 23rd, 2017 @ 12:00 p.m. by A01334390
/ ======== ======== ======== ========
*/

// ______  __      ______  ______  __  __  ______  __  __  ______  __  __   __    
// /\  == \/\ \    /\  __ \/\  ___\/\ \/ / /\  ___\/\ \_\ \/\  __ \/\ \/\ "-.\ \   
// \ \  __<\ \ \___\ \ \/\ \ \ \___\ \  _"-\ \ \___\ \  __ \ \  __ \ \ \ \ \-.  \  
//  \ \_____\ \_____\ \_____\ \_____\ \_\ \_\ \_____\ \_\ \_\ \_\ \_\ \_\ \_\\"\_\ 
//   \/_____/\/_____/\/_____/\/_____/\/_/\/_/\/_____/\/_/\/_/\/_/\/_/\/_/\/_/ \/_/                                                                              
// __    __  ______  __   __  ______  ______  ______  ______    
// /\ "-./  \/\  __ \/\ "-.\ \/\  __ \/\  ___\/\  ___\/\  == \   
// \ \ \-./\ \ \  __ \ \ \-.  \ \  __ \ \ \__ \ \  __\\ \  __<   
//  \ \_\ \ \_\ \_\ \_\ \_\\"\_\ \_\ \_\ \_____\ \_____\ \_\ \_\ 
//   \/_/  \/_/\/_/\/_/\/_/ \/_/\/_/\/_/\/_____/\/_____/\/_/ /_/ 

// ------- Basic Libraries for this package -------
const Table = require('cli-table');
const prettyoutput = require('prettyoutput');
const config = require('config').get('lyra-cli');
const chalk = require('chalk');
const md5 = require('md5');

/** Multithread Performance up here */
require('events').EventEmitter.prototype._maxListeners = 15000;
const numCPUs = require('os').cpus().length;

// ------- Basic Libraries for this package -------
const mongo = require('./mongoManager');

// ------- Hyperledger libraries for this package -------

// Require the client API
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

// these are the credentials to use to connect to the Hyperledger Fabric
let participantId = config.get('participantId');
let participantPwd = config.get('participantPwd');
// physical connection details (eg port numbers) are held in a profile
let connectionProfile = config.get('connectionProfile');

// the logical business newtork has an indentifier
let businessNetworkIdentifier = config.get('businessNetworkIdentifier');
// ... which allows us to get a connection to this business network
let businessNetworkConnection = new BusinessNetworkConnection();
// the network definition will be used later to create assets
let businessNetworkDefinition;

let assetRegistry;

/*
/ ========Check Registered Models Method =========
/ This method starts the connection with the chaincode and queries the registered models
/ It receives no parameters and returns no particular object
/ Useful to check if you're actually connected to the system
/ Bugs:: No >> Further Tests:: No particular behaviour for errors
/ ======== ======== ======== ========
*/
const checkRegisteredModels = () => {
    // create the connection
    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return businessNetworkConnection.getAllAssetRegistries();
        }).then((result) => {
        console.log('List of asset registries=');

        let table = new Table({
            head: ['Registry Type', 'ID', 'Name']
        });
        for (let i = 0; i < result.length; i++) {
            let tableLine = [];

            tableLine.push(result[i].registryType);
            tableLine.push(result[i].id);
            tableLine.push(result[i].name);
            table.push(tableLine);
        }

        console.log(chalk.white(table.toString()));
        return businessNetworkConnection.disconnect();
    }).
    then(() => {
        console.log(chalk.blue(' ------ All done! ------'));
        return getAllParticipantRegistries();
    }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });
};

/*
/ ======== Get All Participant Registries =========
/ This method retrieves all registered Participants on the network
/ Receives and returns no particular parameters
/ Bugs:: Tested  >> Further Tests:: No particular behaviour for errors
/ ======== ======== ======== ========
*/

const getAllParticipantRegistries = () => {
    // create the connection
    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return businessNetworkConnection.getAllParticipantRegistries();
        }).then((result) => {
        console.log('List of Participant registries=');

        let table = new Table({
            head: ['Registry Type', 'ID', 'Name']
        });
        for (let i = 0; i < result.length; i++) {
            let tableLine = [];

            tableLine.push(result[i].registryType);
            tableLine.push(result[i].id);
            tableLine.push(result[i].name);
            table.push(tableLine);
        }

        console.log(chalk.white(table.toString()));
        return businessNetworkConnection.disconnect();
    }).
    then(() => {
        console.log(chalk.blue(' ------ All done! ------'));
        console.log('\n');
    }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });
};

/*
/ ======== Initializator Daemon Method =========
/ This method creates a client and a wallet based on the received parameters
/ @param clientSeed is a Number that expects the seed for the client ID
/ @param walletSeed is a Number that expects the seed for the wallet ID
/ @param bottom is a Number that expects the lower bound for the wallet's random balance 
/ @param top is a Number that expects the top bound for the wallet's random balance 
/ Bugs:: Tested  >> Further Tests:: Will succesfully deploy multiple wallets 
/ ======== ======== ======== ========
*/

const initializatorDaemon = (clientSeed, walletSeed, bottom, top) => {
    let client;
    let ownerRelation;
    let wallet;
    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
        }).then((result) => {
        this.walletRegistry = result
    }).then(() => {
        let factory = businessNetworkDefinition.getFactory();
        /** Create a new Participant within the network */
        client = factory.newResource('org.aabo', 'Client', md5(clientSeed));
        client.id = md5(clientSeed);
        /** Save to MongoDB */
        mongo.saveParticipant(client);
        /** Create a new relationship for the owner */
        ownerRelation = factory.newRelationship('org.aabo', 'Client', md5(clientSeed));
        /** Create a new wallet for the owner */
        wallet = factory.newResource('org.aabo', 'Wallet', md5(walletSeed));
        wallet.id = md5(walletSeed);
        wallet.balance = (Math.random() * top) + bottom;
        wallet.owner = ownerRelation;
        /** Save to MongoDB */
        mongo.saveAsset(wallet, md5(clientSeed));
        /** Save the new state of this relationship to the Blockchain */
        return this.walletRegistry.add(wallet);
    }).then(() => {
        return businessNetworkConnection.getParticipantRegistry('org.aabo.Client');
    }).then((clientRegistry) => {
        return clientRegistry.add(client);
    }).catch(function (error) {
        console.log(error);
        throw (error);
    });
};

/*
/ ======== Show Current Assets =========
/ This method shows the current assets that exist within the Blockchain
/ Receives no particular parameter and returns nothing interesting
/ Bugs:: Tested  >> Further Tests:: Shows wallets, but wont print tables
/ ======== ======== ======== ========
*/

const showCurrentAssets = () => {
    let walletRegistry;
    let clientRegistry;

    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return businessNetworkConnection.getAssetRegistry('org.aabo.Wallet');
        }).then((registry) => {
        walletRegistry = registry;
        return businessNetworkConnection.getParticipantRegistry('org.aabo.Client');
    }).then((registry) => {
        clientRegistry = registry;
        return walletRegistry.resolveAll();
    }).then((aResources) => {
        let table = new Table({
            head: ['ID', 'Balance', 'Owner ID']
        });
        let arrayLength = aResources.length;
        for (let i = 0; i < arrayLength; i++) {
            let tableLine = [];
            tableLine.push(aResources[i].id);
            tableLine.push(aResources[i].balance);
            tableLine.push(aResources[i].owner);
            table.push(tableLine);
        }
        // Put to stdout - as this is really a command line app
        console.log(table.toString());
    }).then(() => {
        console.log(chalk.blue(' ------ All done! ------'));
        console.log('\n');
        businessNetworkConnection.disconnect();
    }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });
};

/*
/ ======== Show Current Participants Method =========
/ This method shows the participants that exist in the Blockchain
/ Receives and returns no particular assets
/ Bugs:: Tested  >> Further Tests:: Shows all participants
/ ======== ======== ======== ========
*/

const showCurrentParticipants = () => {
    let walletRegistry;
    let clientRegistry;

    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return businessNetworkConnection.getAssetRegistry('org.aabo.Wallet');
        }).then((registry) => {
        walletRegistry = registry;
        return businessNetworkConnection.getParticipantRegistry('org.aabo.Client');
    }).then((registry) => {
        clientRegistry = registry;
        return clientRegistry.resolveAll();
    }).then((aResources) => {
        let table = new Table({
            head: ['ID']
        });
        let arrayLength = aResources.length;
        for (let i = 0; i < arrayLength; i++) {
            let tableLine = [];
            tableLine.push(aResources[i].id);
            table.push(tableLine);
        }
        // Put to stdout - as this is really a command line app
        console.log(table.toString());
    }).then(() => {
        console.log(chalk.blue(' ------ All done! ------'));
        console.log('\n');
        businessNetworkConnection.disconnect();
    }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });
};

/*
/ ======== Make Transaction Method =========
/ This method makes a transaction over the network
/ @param fromPid is the md5 related to a Client on the Blockchain who's receiving money
/ @param toPid is the md5 related to a Client on the Blockchain who's receiving money
/ @param funds is a number that means the amount of money that is being sent
/ Bugs:: Tested  >> Further Tests:: Make it faster, make it stronger
/ ======== ======== ======== ========
*/

const makeTransaction = (fromID, toID, funds) => {
    let walletRegistry;
    let from;
    let to;

    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            return businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
                .then(function (vr) {
                    walletRegistry = vr;
                    return walletRegistry.get(fromID);
                })
                .then(function (v) {
                    from = v;
                    return walletRegistry.get(toID);
                })
                .then(function (v) {
                    to = v;
                })
                .then(function () {
                    let serializer = businessNetworkDefinition.getSerializer();
                    let resource = serializer.fromJSON({
                        "$class": "org.aabo.Transfer",
                        "amount": funds,
                        "from": {
                            "$class": "org.aabo.Wallet",
                            "id": from.getIdentifier(),
                            "balance": from.balance,
                            "owner": "resource:org.aabo.Client#" + from.owner.getIdentifier()
                        },
                        "to": {
                            "$class": "org.aabo.Wallet",
                            "id": to.getIdentifier(),
                            "balance": to.balance,
                            "owner": "resource:org.aabo.Client#" + to.owner.getIdentifier()
                        }
                    });
                    return businessNetworkConnection.submitTransaction(resource);
                });
        }).then(() => {
        console.log(chalk.blue(' ------ All done! ------'));
        console.log('\n');
        return businessNetworkConnection.disconnect();
    }).catch(function (error) {
        businessNetworkConnection.disconnect();
        throw error;
    });
};

/*
/ ======== Super Transaction Engine =========
/ This method supports the fast transaction engine 
/ @param amount of transactions to send in this node
/ Bugs:: Not Tested  >> Further Tests:: Make it faster, make it stronger, make it better.
/ ======== ======== ======== ========
*/

async function superTransactionEngine(simAmmount) {
    /** Get all Wallet ID's on the system */
    mongo.getAllAssetsID().then((data) => {
        /**Create Transaction Plan */
        let transactionPlan = [];
        /**Create a from/to pair to make the transaction next */
        for (let i = 0; i < simAmmount; i++) {
            const fromRandomUser = (Math.floor(Math.random() * (data.length - 1)));
            const toRandomUser = (Math.floor(Math.random() * (data.length - 1)));
            const fundsRandom = (Math.random() * 1000) + 100;
            transactionPlan.push({
                from: data[fromRandomUser].id,
                to: data[toRandomUser].id,
                funds: fundsRandom
            });
        }
        /** Send it to the Transfer Fund Processor */
        let x;
        for (x = 0; x < transactionPlan.length; x++) {
            makeTransaction(transactionPlan[x].from, transactionPlan[x].to, transactionPlan[x].funds);
        }
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = {
    checkRegisteredModels,
    initializatorDaemon,
    showCurrentAssets,
    showCurrentParticipants,
    makeTransaction,
    superTransactionEngine
};