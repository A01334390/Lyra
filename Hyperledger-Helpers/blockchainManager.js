'use strict';

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
var figlet = require('figlet');
var md5 = require('md5')
var now = require('performance-now');
const ora = require('ora');
var config = require('config').get("hyperledger-connection");
// ------- Basic Libraries for this persistance modules -------
const mongo = require('../mongoManager');
// ------- Basic Libraries for this Hyperledger Fabric -------
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');
// ------ Basic Elements for Chaincode functioning //
const chaincodeId = config.get('chaincodeId');
const chainId = config.get('chainId');
const peerAddress = config.get('peer');
const ordererAddress = config.get('orderer');
const channelName = config.get('channel');

class BlockchainManager {
    /**We need the mapping of the business Network to the URLs */
    constructor() {
        this.fabric_client = new Fabric_Client();
    }

    /**@name init
     * @author Aabo Technologies © 2017 - Server's team
     * @description Initializes the peers and channels 
     * @returns {Nothing} 
     */

    init() {
        //Setup the fabric network
        this.channel = this.fabric_client.newChannel(channelName);
        this.peer = this.fabric_client.newPeer(peerAddress);
        this.channel.addPeer(this.peer);
        this.order = this.fabric_client.newOrderer(ordererAddress);
        this.channel.addOrderer(this.order);
        //Get the keystore
        this.store_path = path.join(__dirname, 'hfc-key-store');
    }

    /**
     * @name envSetter
     * @author Aabo Technologies © 2017 - Server's team
     * @description This gets an user identity to sign transactions
     * @returns {User} user, the signing user 
     */

    envSetter() {
        const METHOD = 'createKeyValueStore'
        return Fabric_Client.newDefaultKeyValueStore({
                path: this.store_path
            }).then((state_store) => {
                // assign the store to the fabric client
                this.fabric_client.setStateStore(state_store);
                this.crypto_suite = Fabric_Client.newCryptoSuite();
                // use the same location for the state store (where the users' certificate are kept)
                // and the crypto store (where the users' keys are kept)
                this.crypto_store = Fabric_Client.newCryptoKeyStore({
                    path: this.store_path
                });
                this.crypto_suite.setCryptoKeyStore(this.crypto_store);
                this.fabric_client.setCryptoSuite(this.crypto_suite);

                // get the enrolled user from persistence, this user will sign all requests
                return this.fabric_client.getUserContext(config.get('user'), true);
            })
            .then((user_from_store) => {
                if (user_from_store && user_from_store.isEnrolled()) {
                    console.log('Successfully loaded', config.get('user'), 'from persistence');
                    return user_from_store;
                } else {
                    throw new Error('Failed to get user1.... run registerUser.js');
                }
            })
            .catch(function (err) {
                console.log(chalk.red.bold("Error happened: " + err))
            });
    }

    /**
     * @name transferFunds
     * @author Aabo Technologies © 2017 - Server's team
     * @description This method transfers funds between wallets on the Blockchain
     * @param {String} from, the md5 hash of the wallet that sends funds
     * @param {String} to, the md5 hash of the wallet that receives funds
     * @param {Number} funds, the amount of money that is being transfered
     * @param {Object} user, the signing user for each transaction
     * @returns {Boolean} bool, if the transaction was made successfully
     */

    transferFunds(from, to, funds, user) {
        const METHOD = 'transferFunds';
        var member_user = user;
        // get a transaction id object based on the current user assigned to fabric client
        // get a transaction id object based on the current user assigned to fabric client
        var tx_id = this.fabric_client.newTransactionID();

        // createCar chaincode function - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
        // changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', 'Barry'],
        // must send the proposal to endorsing peers
        var request = {
            chaincodeId: chaincodeId,
            fcn: 'transferFunds',
            args: [from, to, funds],
            chainId: chainId,
            txId: tx_id
        };

        // send the transaction proposal to the peers
        return this.channel.sendTransactionProposal(request)
            .then((results) => {
                var proposalResponses = results[0];
                var proposal = results[1];
                let isProposalGood = false;
                if (proposalResponses && proposalResponses[0].response &&
                    proposalResponses[0].response.status === 200) {
                    isProposalGood = true;
                } else {}
                if (isProposalGood) {
                    // build up the request for the orderer to have the transaction committed
                    var request = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };

                    // set the transaction listener and set a timeout of 30 sec
                    // if the transaction did not get committed within the timeout period,
                    // report a TIMEOUT status
                    var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
                    var promises = [];
                    var sendPromise = this.channel.sendTransaction(request);
                    promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

                    // get an eventhub once the fabric client has a user assigned. The user
                    // is required bacause the event registration must be signed
                    let event_hub = this.fabric_client.newEventHub();
                    event_hub.setPeerAddr('grpc://localhost:7053');

                    // using resolve the promise so that result status may be processed
                    // under the then clause rather than having the catch clause process
                    // the status
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            event_hub.disconnect();
                            resolve({
                                event_status: 'TIMEOUT'
                            }); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                        }, 3000);
                        event_hub.connect();
                        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                            // this is the callback for transaction event status
                            // first some clean up of event listener
                            clearTimeout(handle);
                            event_hub.unregisterTxEvent(transaction_id_string);
                            event_hub.disconnect();

                            // now let the application know what happened
                            var return_status = {
                                event_status: code,
                                tx_id: transaction_id_string
                            };
                            if (code !== 'VALID') {
                                resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                            } else {
                                resolve(return_status);
                            }
                        }, (err) => {
                            //this is the callback if something goes wrong with the event registration or processing
                            reject(new Error('There was a problem with the eventhub ::' + err));
                        });
                    });
                    promises.push(txPromise);
                    return Promise.all(promises);
                } else {
                    throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                }
            }).then((results) => {
                if (results && results[0] && results[0].status !== 'SUCCESS') {
                    console.error('Failed to order the transaction. Error code: ' + response.status);
                }
                if (results && results[1] && results[1].event_status !== 'VALID') {
                    console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
                }
                return true;
            }).catch((err) => {
                console.error('Failed to invoke successfully :: ' + err);
                return false;
            });
    }

    /**
     * @name createWallet
     * @author Aabo Technologies © 2017 - Server's team
     * @description This method creates a wallet instance on the Blockchain
     * @param {String} id, the md5 hash of the wallet that's going to be created
     * @param {Number} balance, the initial balance of the wallet
     * @param {Object} user, the signing user for each transaction
     * @returns {Nothing}
     */

    createWallet(id, funds, user) {
        const METHOD = 'createWallet';
        var member_user = user;
        // get a transaction id object based on the current user assigned to fabric client
        // get a transaction id object based on the current user assigned to fabric client
        var tx_id = this.fabric_client.newTransactionID();

        // createCar chaincode function - requires 5 args, ex: args: ['CAR12', 'Honda', 'Accord', 'Black', 'Tom'],
        // changeCarOwner chaincode function - requires 2 args , ex: args: ['CAR10', 'Barry'],
        // must send the proposal to endorsing peers
        var request = {
            chaincodeId: chaincodeId,
            fcn: 'initWallet',
            args: [id, funds],
            chainId: chainId,
            txId: tx_id
        };

        // send the transaction proposal to the peers
        return this.channel.sendTransactionProposal(request)
            .then((results) => {
                var proposalResponses = results[0];
                var proposal = results[1];
                let isProposalGood = false;
                if (proposalResponses && proposalResponses[0].response &&
                    proposalResponses[0].response.status === 200) {
                    isProposalGood = true;
                } else {}
                if (isProposalGood) {
                    // build up the request for the orderer to have the transaction committed
                    var request = {
                        proposalResponses: proposalResponses,
                        proposal: proposal
                    };

                    // set the transaction listener and set a timeout of 30 sec
                    // if the transaction did not get committed within the timeout period,
                    // report a TIMEOUT status
                    var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
                    var promises = [];
                    var sendPromise = this.channel.sendTransaction(request);
                    promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

                    // get an eventhub once the fabric client has a user assigned. The user
                    // is required bacause the event registration must be signed
                    let event_hub = this.fabric_client.newEventHub();
                    event_hub.setPeerAddr('grpc://localhost:7053');

                    // using resolve the promise so that result status may be processed
                    // under the then clause rather than having the catch clause process
                    // the status
                    let txPromise = new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            event_hub.disconnect();
                            resolve({
                                event_status: 'TIMEOUT'
                            }); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
                        }, 3000);
                        event_hub.connect();
                        event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
                            // this is the callback for transaction event status
                            // first some clean up of event listener
                            clearTimeout(handle);
                            event_hub.unregisterTxEvent(transaction_id_string);
                            event_hub.disconnect();

                            // now let the application know what happened
                            var return_status = {
                                event_status: code,
                                tx_id: transaction_id_string
                            };
                            if (code !== 'VALID') {
                                resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
                            } else {
                                resolve(return_status);
                            }
                        }, (err) => {
                            //this is the callback if something goes wrong with the event registration or processing
                            reject(new Error('There was a problem with the eventhub ::' + err));
                        });
                    });
                    promises.push(txPromise);
                    return Promise.all(promises);
                } else {
                    throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
                }
            }).then((results) => {
                if (results && results[0] && results[0].status !== 'SUCCESS') {
                    console.error('Failed to order the transaction. Error code: ' + response.status);
                }
                if (results && results[1] && results[1].event_status !== 'VALID') {
                    console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
                }
                return true;
            }).catch((err) => {
                console.error('Failed to invoke successfully :: ' + err);
                return false;
            });
    }

    /**
     * @name readWallet 
     * @author Aabo Technologies © 2017 - Server's team
     * @description This method creates a wallet instance on the Blockchain
     * @param {String} id, the md5 hash of the wallet that's going to be read
     * @param {Object} user, the signing user for each transaction
     */

    readWallet(id, user) {
        var tx_id = this.fabric_client.newTransactionID();
        const request = {
            chaincodeId: chaincodeId,
            txId: tx_id,
            fcn: 'readWallet',
            args: [id]
        };
        return this.channel.queryByChaincode(request)
            .then((query_responses) => {
                console.log("returned from query");
                if (!query_responses.length) {
                    console.log("No payloads were returned from query");
                } else {
                    console.log("Query result count = ", query_responses.length)
                }
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                }
                return JSON.parse(query_responses[0]);
            })
            .catch(function (err) {
                console.error("Caught Error", err);
            });
    }

    /**
     * @name getWalletsByRange
     * @author Aabo Technologies © 2017 - Server's team
     * @description This method gets the information of several wallets depending on a range
     * @param {String} start, the leftmost or smallest key for search
     * @param {String} finish, the rightmost or biggest key for search
     * @param {Object} user, the signing user for each transaction
     */

    getWalletsByRange(start, finish, user) {
        var tx_id = this.fabric_client.newTransactionID();
        const request = {
            chaincodeId: chaincodeId,
            txId: tx_id,
            fcn: 'getWalletsByRange',
            args: [start, finish]
        };
        return this.channel.queryByChaincode(request)
            .then((query_responses) => {
                console.log("returned from query");
                if (!query_responses.length) {
                    console.log("No payloads were returned from query");
                } else {
                    console.log("Query result count = ", query_responses.length)
                }
                if (query_responses[0] instanceof Error) {
                    console.error("error from query = ", query_responses[0]);
                }
                return JSON.parse(query_responses[0]);
            })
            .catch(function (err) {
                console.error("Caught Error", err);
            });
    }

    /**@name profilingTime
     * @author Aabo Technologies © 2017 - Server's team
     * @description Profiles the time that a process took and shows some statistics
     * @param {Number} timeStart when the process started
     * @param {Number} timeEnd when the process ended
     * @param {Number} simTrax is the amount of transactions that were executed
     * @param {String} whereFrom where the method is called from
     * @returns {Number} executedTime is the overall execution time
     * @returns {Number} opTime is the time it took for every operation to run
     * @returns {Number} opsPerDay is the amount of operations that could be done in one day
     */

    profilingTime(timeStart, timeEnd, simTrax, whereFrom) {
        const METHOD = 'profilingTime';

        let executedTime = (timeEnd - timeStart).toFixed(0);
        let opTime = (executedTime / simTrax).toFixed(0);
        let opsPerDay = (86400000 / opTime).toFixed(0);
        let exp = (opsPerDay.toString().length) - 1;
        console.log(chalk.bold.yellow('EXECUTION TIME:'), chalk.white(executedTime), 'ms');
        console.log(chalk.bold.yellow('OPERATION TIME:'), chalk.white(opTime), 'ms');
        console.log(chalk.bold.yellow('OPS PER DAY:'), chalk.white(opsPerDay), 'or:', chalk.bold.yellow('1E' + exp));
        if (whereFrom === 'tx') {
            if (exp < 9) {
                console.log(
                    chalk.yellow(
                        figlet.textSync('Not yet...', {
                            horizontalLayout: 'full',
                            verticalLayout: 'default'
                        })
                    )
                );
            } else {
                console.log(
                    chalk.green(
                        figlet.textSync('DONE~!', {
                            horizontalLayout: 'full',
                            verticalLayout: 'default'
                        })
                    )
                );
            }
        }
    }

    /**
     * @name transactionCannon
     * @author Aabo Technologies © 2017 - Server's team
     * @description Launches the 'transferFunds' method multiple times using promises
     * @param {Number} transactions, number of Transactions
     * @param {Number} top, this is the top wallet that could be chosen for transactions
     * @returns {Boolean} done, if the process has ended it'll return TRUE
     */

    static transactionCannon(transactions, top) {
        //TODO
    }

    /**
     * @name createSchedule
     * @author Aabo Technologies © 2017 - Server's team
     * @description Creates a schedule for the transaction cannon
     * @param {Number} top, this is the top wallet to be chosen for transactiions
     * @returns {JSON} schedule, a json list of transactions to be made 
     */

    static createSchedule(top) {
        //TODO
    }

    /**
     * @name createWallets
     * @author Aabo Technologies © 2017 - Server's team
     * @description Launches the 'createWallet' method multiple times using promises
     * @param {Number} amount, number of wallets to create
     * @return {Boolean} done, if the process has ended it'll return TRUE
     */

    static createWallets(amount) {
        //Get the BlockchainManager object created
        let bm = new BlockchainManager();
        //Initialize the peers and channels
        bm.init();
        //Start the fun!
        return bm.envSetter()
            .then((user) => {
                let all_promise = [];
                for (let i = 0; i < amount; i++) {
                    all_promise.push(bm.createWallet(i.toString(), i.toString()));
                }
                return Promise.all(all_promise);
            })
            .then(() => {
                return true;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })

    }

    /**
     * @name getWallet
     * @author Aabo Technologies © 2017 - Server's team
     * @description Reads a wallet from the ledger
     * @param {String} id, the md5 hash that identifies a wallet
     * @returns {JSON} wallet, the wallet's information
     */

    static getWallet(id) {
        //Get a BlockchainManager object created
        let bm = new BlockchainManager();
        //Initialize the peers and channels
        bm.init();
        //Start the fun!
        return bm.envSetter()
            .then((user) => {
                return bm.readWallet(id, user);
            })
            .then((result) => {
                let table = new Table({
                    head: ['ID', 'Balance']
                });
                let tableLine = [];
                tableLine.push(result.address);
                tableLine.push(result.balance);
                table.push(tableLine);

                return table.toString();
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })
    }

    /**
     * @name getWalletByRange
     * @author Aabo Technologies © 2017 - Server's team
     * @description Gets the information from several wallets on the ledger
     * @param {String} start, the leftmost or smallest wallet on the ledger
     * @param {String} end, the rightmost or biggest wallet on the ledger
     * @returns {JSON} wallets, the wallets' information
     */

    static getWalletByRange(start, end) {
        // Get a BlockchainManager object created
        let bm = new BlockchainManager();
        // Initialize the peers and channels
        bm.init();
        // Start the fun!
        return bm.envSetter()
            .then((user) => {
                return bm.getWalletsByRange(start, end, user);
            })
            .then((result) => {
                let table = new Table({
                    head: ['ID', 'Balance']
                });
                let arrayLength = result.length;
                for (let i = 0; i < arrayLength; i++) {
                    let tableLine = [];
                    tableLine.push(result[i].Record.address);
                    tableLine.push(result[i].Record.balance);
                    table.push(tableLine);
                }

                return table.toString();
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
}

module.exports = BlockchainManager;