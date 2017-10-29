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
var chalk = require('chalk');
var md5 = require('md5')

// ------- Basic Libraries for this package -------
const mongo = require('./mongoManager');

// ------- Hyperledger libraries for this package -------
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var config = require('config').get('lyra-cli');\
// these are the credentials to use to connect to the Hyperledger Fabric
let participantId = config.get('participantId');
let participantPwd = config.get('participantPwd');


class BlockchainManager {
    /**We need the mapping of the business Network to the URLs */
    constructor() {
        this.businessNetworkConnection = new BusinessNetworkConnection();
        this.connectionProfile = config.get('connectionProfile');
        this.businessNetworkIdentifier = config.get('businessNetworkIdentifier');
    }

    /**@name init
     * @author Fernando Martin Garcia Del Angel - A01334390
     * @description Initializes the chaincode by making a connection to the composer runtime
     * @returns {Promise} A promise whose fullfillment means the initialization has completed
     */

    init() {
        return this.businessNetworkConnection.connect(this.connectionProfile, this.businessNetworkIdentifier, participantId, participantPwd)
            .then((result) => {
                this.businessNetworkDefinition = result;
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@name CheckRegisteredAssets
     * @author Fernando Martin Garcia Del Angel - A01334390
     * @description Lists all registered assets in the Blockchain
     * @returns {Promise} 
     */

    checkRegisteredAssets() {
        const METHOD = 'checkRegisteredModels';

        return this.businessNetworkConnection.getAllAssetRegistries()
            .then((result) => {
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

                return table;
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@name CheckRegisteredParticipants
     * @author Fernando Martin Garcia Del Angel - A01334390
     * @description Lists all registered participants on the Blockchain 
     * @returns {Promise} A promise whose fullfillment means the participants have been registered
     */

    checkRegisteredParticipants() {
        const METHOD = 'checkRegisteredParticipants';
        return this.businessNetworkConnection.getAllParticipantRegistries()
            .then((result) => {
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
                return table;
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@name InitializatorDaemon
     * @author Fernando Martin Garcia Del Angel - A01334390
     * @description Initializes the Participants and Wallets on the network
     * @param {Number} clientSeed is the seed for the client
     * @param {Number} walletSeed is the seed for the wallet
     * @param {Number} bottom is the least amount of money a wallet can have
     * @param {Number} top is the most amount of money a wallet can have
     * @returns {Promise} A promise whose fullfillment means the initialization of assets has completed
     */

    initializatorDaemon(clientSeed, walletSeed, bottom, top) {
        const METHOD = 'initializatorDaemon';

        let client;
        let ownerRelation;
        let wallet;

        return this.businessNetworkConnection.getAllAssetRegistries('org.aabo.Wallet')
            .then((result) => {
                this.walletRegistry = result;
            })
            .then(() => {
                let factory = this.businessNetworkDefinition.getFactory();
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
            })
            .then(() => {
                return this.businessNetworkConnection.getParticipantRegistry('org.aabo.Client');
            })
            .then((clientRegistry) => {
                return clientRegistry.add(client);
            })
            .catch(function (err) {
                throw (err);
            });
    }

    /**@name ShowCurrentAssets
     * @author Fernando Martin Garcia Del Angel - A01334390
     * @description Lists all current wallets on the Ledger
     * @returns {Promise} A promise whose fullfillment means all wallets have succesfully been listed 
     */

    showCurrentAssets() {
        const METHOD = 'showCurrentAssets';
        let walletRegistry;
        let clientRegistry;
        return this.businessNetworkConnection.getAllAssetRegistry('org.aabo.Wallet')
            .then((registry) => {
                walletRegistry = registry;
                return this.businessNetworkConnection.getParticipantRegistry('org.aabo.Client');
            })
            .then((registry) => {
                clientRegistry = registry;
                return walletRegistry.resolveAll();
            })
            .then((aResources) => {
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

                return table;
            })
            .catch(function (error) {
                throw (error);
            });
    }

    /**@name ShowCurrentParticipants
     * @author Fernando Martin Garcia Del Angel - A01334390
     * @description Lists all current Participants on the ledger
     * @returns {Promise} A promise whose fullfillment means all participants have succesfully been listed 
     */

    showCurrentParticipants() {
        const METHOD = 'showCurrentParticipants';

        let walletRegistry;
        let clientRegistry;

        return this.businessNetworkConnection.getAllAssetRegistry('org.aabo.Wallet')
            .then((registry) => {
                walletRegistry = registry;
                return this.businessNetworkConnection.getParticipantRegistry('org.aabo.Client');
            })
            .then((registry) => {
                clientRegistry = registry;
                return clientRegistry.resolveAll();
            })
            .then((aResources) => {
                let table = new Table({
                    head: ['ID']
                });
                let arrayLength = aResources.length;
                for (let i = 0; i < arrayLength; i++) {
                    let tableLine = [];
                    tableLine.push(aResources[i].id);
                    table.push(tableLine);
                }
                return table;
            })
            .catch(function (error) {
                throw (error);
            });
    }

    /**@name MakeTransactionMethod
     * @author Fernando Martin Garcia Del Angel - A01334390
     * @description This method makes a single transaction over the ledger
     * @param {String} fromID is the md5 related to a Client's wallet on the ledger who's sending money
     * @param {String} toID is the md5 related to a Client's wallet on the ledger who's receiving money
     * @param {Number} funds is an amount of money to be sent from one wallet to the other
     * @returns {Promise} whose fullfiment means a transaction was made succesfully 
     */

    makeTransaction(fromID, toID, funds) {
        const METHOD = 'makeTransaction';
        let walletRegistry;
        let from;
        let to;

        return this.businessNetworkConnection.getAllAssetRegistry('org.aabo.Wallet')
            .then((registry) => {
                walletRegistry = registry;
                return walletRegistry.get(fromID);
            })
            .then((fromm) => {
                from = fromm;
                return walletRegistry.get(toID);
            })
            .then((too) => {
                to = too;
            })
            .then(() => {
                let serializer = this.businessNetworkDefinition.getSerializer();
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

                return this.businessNetworkConnection.submitTransaction(resource);
            })
            .catch(function (error) {
                throw (error);
            })
    }

    /** @description Runs the Check Registered Assets command
     *  @returns {Promise} resolved when the action is completed
     */

    static registeredAssets() {
        let bm = new BlockchainManager();
        return bm.init()
            .then(() => {
                return bm.checkRegisteredAssets();
            })
            .then((assets) => {
                console.log(assets);
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@description Runs the Check Registered Participants command
     * @returns {Promise} resolved when the action is completed
     */

    static registeredParticipants() {
        let bm = new BlockchainManager();
        return bm.init()
            .then(() => {
                return bm.checkRegisteredParticipants();
            })
            .then((participants) => {
                console.log(participants);
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@description Runs the Initializator Daemon
     * @param {Number} clientSeed is the seed for the client
     * @param {Number} walletSeed is the seed for the wallet
     * @param {Number} bottom is the least amount of money a wallet can have
     * @param {Number} top is the most amount of money a wallet can have
     * @returns {Promise} A promise whose fullfillment means the initialization of assets has completed
     */

    static initializeLedger(clientSeed, walletSeed, bottom, top) {
        let bm = new BlockchainManager();
        return bm.init()
            .then(() => {
                return bm.initializatorDaemon(clientSeed, walletSeed, bottom, top);
            })
            .then(() => {
                console.log('Accounts created successfully!');
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@description Runs the Show Current Assets method
     * @returns {Promise} A promise whose fullfillment means all wallets have succesfully been listed 
     */

    static assetsOnLedger() {
        let bm = new BlockchainManager();
        return bm.init()
            .then(() => {
                return bm.showCurrentAssets();
            })
            .then((assets) => {
                console.log(assets);
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@description Runs the Show Current Participants method
     * @returns {Promise} A promise whose fullfillment means all participants have succesfully been listed 
     */

    static participantsOnLedger() {
        let bm = new BlockchainManager();
        return bm.init()
            .then(() => {
                return bm.showCurrentParticipants();
            })
            .then((participants) => {
                console.log(participants);
            })
            .catch(function (error) {
                throw error;
            });
    }

    /**@description Runs the make transaction method
     * @param {String} fromID is the md5 related to a Client's wallet on the ledger who's sending money
     * @param {String} toID is the md5 related to a Client's wallet on the ledger who's receiving money
     * @param {Number} funds is an amount of money to be sent from one wallet to the other
     * @returns {Promise} whose fullfiment means a transaction was made succesfully 
     */

    static transfer(fromID, toID, funds){
        let bm = new BlockchainManager();
        return bm.init()
        .then(()=>{
            return bm.makeTransaction(fromID, toID, funds);
        })
        .then(()=>{
            console.log('Success!');
        })
        .catch(function(error){
            throw error;
        });
    }
}

module.exports = BlockchainManager;

// /*
// / ======== Super Transaction Engine =========
// / This method supports the fast transaction engine 
// / @param amount of transactions to send in this node
// / Bugs:: Not Tested  >> Further Tests:: Make it faster, make it stronger, make it better.
// / ======== ======== ======== ========
// */

// async function superTransactionEngine(simAmmount) {
//     /** Get all Wallet ID's on the system */
//     mongo.getAllAssetsID().then((data) => {
//         /**Create Transaction Plan */
//         let transactionPlan = [];
//         /**Create a from/to pair to make the transaction next */
//         for (let i = 0; i < simAmmount; i++) {
//             var fromRandomUser = (Math.floor(Math.random() * (data.length - 1)));
//             var toRandomUser = (Math.floor(Math.random() * (data.length - 1)));
//             var fundsRandom = (Math.random() * 1000) + 100;
//             transactionPlan.push({
//                 from: data[fromRandomUser].id,
//                 to: data[toRandomUser].id,
//                 funds: fundsRandom
//             });
//         }
//         /** Send it to the Transfer Fund Processor */
//         for (let x = 0; x < transactionPlan.length; x++) {
//             makeTransaction(transactionPlan[x].from, transactionPlan[x].to, transactionPlan[x].funds);
//         }
//     }).catch((err) => {
//         console.log(err);
//     });
// }