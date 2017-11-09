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
var now = require('performance-now');
const ora = require('ora');
var crypto = require('crypto');
var config = require('config').get("hyperledger-connection");
// ------- Basic Libraries for this persistance modules -------
const mongo = require('../mongoManager');
// ------- Basic Libraries for this Hyperledger Fabric -------
var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');
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

    registerUser(username) {
        let member_user;
        // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
        return Fabric_Client.newDefaultKeyValueStore({
            path: this.store_path
        }).then((state_store) => {
            // assign the store to the fabric client
            this.fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: this.store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            this.fabric_client.setCryptoSuite(crypto_suite);
            var tlsOptions = {
                trustedRoots: [],
                verify: false
            };
            // be sure to change the http to https when the CA is running TLS enabled
            this.fabric_ca_client = new Fabric_CA_Client('http://localhost:7054', null, '', crypto_suite);

            // first check to see if the admin is already enrolled
            return this.fabric_client.getUserContext('admin', true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded admin from persistence');
                this.admin_user = user_from_store;
            } else {
                throw new Error('Failed to get admin.... run enrollAdmin.js');
            }

            // at this point we should have the admin user
            // first need to register the user with the CA server
            return this.fabric_ca_client.register({
                enrollmentID: username,
                affiliation: 'org1.department1'
            }, this.admin_user);
        }).then((secret) => {
            // next we need to enroll the user with CA server
            console.log('Successfully registered', username, ' - secret:' + secret);

            return this.fabric_ca_client.enroll({
                enrollmentID: username,
                enrollmentSecret: secret
            });
        }).then((enrollment) => {
            console.log('Successfully enrolled member user', username);
            return this.fabric_client.createUser({
                username: username,
                mspid: 'Org1MSP',
                cryptoContent: {
                    privateKeyPEM: enrollment.key.toBytes(),
                    signedCertPEM: enrollment.certificate
                }
            });
        }).then((user) => {
            this.member_user = user;
            return this.fabric_client.setUserContext(this.member_user);
        }).then(() => {
            console.log(username, 'was successfully registered and enrolled and is ready to interact with the fabric network');

        }).catch((err) => {
            console.error('Failed to register: ' + err);
            if (err.toString().indexOf('Authorization') > -1) {
                console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
                    'Try again after deleting the contents of the store directory ' + this.store_path);
            }
        });

    }

    registerAdmin() {
        return Fabric_Client.newDefaultKeyValueStore({
            path: this.store_path
        }).then((state_store) => {
            // assign the store to the fabric client
            this.fabric_client.setStateStore(state_store);
            var crypto_suite = Fabric_Client.newCryptoSuite();
            // use the same location for the state store (where the users' certificate are kept)
            // and the crypto store (where the users' keys are kept)
            var crypto_store = Fabric_Client.newCryptoKeyStore({
                path: this.store_path
            });
            crypto_suite.setCryptoKeyStore(crypto_store);
            this.fabric_client.setCryptoSuite(crypto_suite);
            var tlsOptions = {
                trustedRoots: [],
                verify: false
            };
            // be sure to change the http to https when the CA is running TLS enabled
            this.fabric_ca_client = new Fabric_CA_Client('http://localhost:7054', tlsOptions, 'ca.example.com', crypto_suite);

            // first check to see if the admin is already enrolled
            return this.fabric_client.getUserContext('admin', true);
        }).then((user_from_store) => {
            if (user_from_store && user_from_store.isEnrolled()) {
                console.log('Successfully loaded admin from persistence');
                this.admin_user = user_from_store;
                return null;
            } else {
                // need to enroll it with CA server
                return this.fabric_ca_client.enroll({
                    enrollmentID: 'admin',
                    enrollmentSecret: 'adminpw'
                }).then((enrollment) => {
                    console.log('Successfully enrolled admin user "admin"');
                    return this.fabric_client.createUser({
                        username: 'admin',
                        mspid: 'Org1MSP',
                        cryptoContent: {
                            privateKeyPEM: enrollment.key.toBytes(),
                            signedCertPEM: enrollment.certificate
                        }
                    });
                }).then((user) => {
                    this.admin_user = user;
                    return this.fabric_client.setUserContext(this.admin_user);
                }).catch((err) => {
                    console.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
                    throw new Error('Failed to enroll admin');
                });
            }
        }).then(() => {
            console.log('Assigned the admin user to the fabric client ::' + this.admin_user.toString());
        }).catch((err) => {
            console.error('Failed to enroll admin: ' + err);
        });
    }

    /**
     * @name invokeFunction
     * @author Aabo Technologies © 2017 - Server's team
     * @description This function allows invocations to the chaincode, therefore, it's flexible
     * @argument {String} fun, The function to execute on the chaincode
     * @argument {Array} argum, The arguments that the chaincode needs
     * @argument {Object} user, The user that signs the transaction
     * @returns {Boolean} done, if the function was done executing
     */

    invokeFunction(fun, argums, user) {
        const METHOD = 'invokeFunction';
        var member_user = user;
        var tx_id = this.fabric_client.newTransactionID();

        var request = {
            chaincodeId: chaincodeId,
            fcn: fun,
            args: argums,
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
     * @name queryFunction 
     * @author Aabo Technologies © 2017 - Server's team
     * @description This method creates a wallet instance on the Blockchain
     * @argument {String} fun, The function to execute on the chaincode
     * @argument {Array} argums, The arguments that the chaincode needs
     * @param {Object} user, the signing user for each transaction
     * @returns {JSON} result, the result of the query to the ledger
     */

    queryFunction(fun, argums, user) {
        const METHOD = 'queryFunction';

        var tx_id = this.fabric_client.newTransactionID();
        const request = {
            chaincodeId: chaincodeId,
            txId: tx_id,
            fcn: fun,
            args: argums
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

    static transactionCannon(top) {
        let start;
        let end;
        let leng;
        let bm = new BlockchainManager();
        let uss;
        bm.init();
        return bm.envSetter()
            .then((user) => {
                uss = user;
                return this.createSchedule(top);
            }).then((schedule) => {
                let cannonBalls = [];
                leng = schedule.length;
                for (let i = 0; i < schedule.length; i++) {
                    let args = [];
                    args.push(schedule[i].from);
                    args.push(schedule[i].to);
                    args.push(schedule[i].funds.toString());
                    cannonBalls.push(bm.invokeFunction('transferFunds', args, uss));
                }
                start = now();
                return Promise.all(cannonBalls);
            })
            .then(() => {
                end = now();
                bm.profilingTime(start, end, leng, 'tx');
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })
    }

    /**
     * @name createSchedule
     * @author Aabo Technologies © 2017 - Server's team
     * @description Creates a schedule for the transaction cannon
     * @param {Number} top, this is the top wallet to be chosen for transactiions
     * @param {Number} amount, this is the amount of transactions to be made
     * @returns {JSON} schedule, a json list of transactions to be made 
     */

    static createSchedule(top) {
        //Get the BlockchainManager object created
        let bm = new BlockchainManager();
        //Initialize the peers and channels
        bm.init();
        //Start the fun!
        return bm.envSetter()
            .then((user) => {
                let fun = 'getWalletsByRange';
                let args = [];
                args.push('0');
                args.push(top.toString());
                return bm.queryFunction(fun, args, user);
            })
            .then((result) => {
                let schedule = [];
                for (let i = 0; i < (result.length / 2); i++) {
                    var tran = {
                        from: result[2 * i].Key,
                        to: result[(2 * i) + 1].Key,
                        funds: Math.floor(Math.random() * (1000 - 10) + 10)
                    };
                    schedule.push(tran);
                }
                return schedule;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name createWallets
     * @author Aabo Technologies © 2017 - Server's team
     * @description Launches the 'createWallet' method multiple times using promises
     * @param {Number} amount, number of wallets to create
     * @return {Boolean} done, if the process has ended it'll return TRUE
     */

    static createWallets(amount) {
        let start;
        let end;
        //Get the BlockchainManager object created
        let bm = new BlockchainManager();
        //Initialize the peers and channels
        bm.init();
        //Start the fun!
        return bm.envSetter()
            .then((user) => {
                let all_promise = [];
                let fun = 'initWallet';
                for (let i = 0; i < amount; i++) {
                    let args = [];
                    args.push(crypto.randomBytes(20).toString('hex'));
                    args.push((i * 1000).toString());
                    mongo.saveAst(args);
                    all_promise.push(bm.invokeFunction(fun, args, user));
                }
                start = now();
                return Promise.all(all_promise);
            })
            .then(() => {
                end = now();
                bm.profilingTime(start, end, amount, 'acc');
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
                let args = [];
                let fun = 'readWallet';
                args.push(id);
                return bm.queryFunction(fun, args, user);
            })
            .then((result) => {
                let table = new Table({
                    head: ['Address', 'Balance']
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
                let args = [];
                let fun = 'getWalletsByRange';
                args.push(start);
                args.push(end);
                return bm.queryFunction(fun, args, user);
            })
            .then((result) => {
                let table = new Table({
                    head: ['Address', 'Balance']
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

    /**
     * @name transfer
     * @author Aabo Technologies © 2017 - Server's team
     * @description Transfers funds from one account to the other
     * @param {String} from, the id of the wallet that's sending money
     * @param {String} to, the id of the wallet that's receiving money
     * @param {Number} funds, the amount of money to be sent
     * @returns {Boolean} done, if the process has ended it'll return TRUE
     */
    static transfer(from, to, funds) {
        let start;
        let end;
        //Get the BlockchainManager object created
        let bm = new BlockchainManager();
        //Initialize the peers and channels
        bm.init();
        //Start the fun!
        return bm.envSetter()
            .then((user) => {
                let all_promise = [];
                let fun = 'transferFunds';
                let args = [];
                args.push(from);
                args.push(to);
                args.push(funds.toString());
                mongo.saveTx(args);
                start = now();
                return bm.invokeFunction(fun, args, user);
            })
            .then(() => {
                end = now();
                bm.profilingTime(start, end, 1, 'tx');
                return true;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })
    }

    static enrollUser(user) {
        let bm = new BlockchainManager();
        bm.init();
        return bm.registerUser(user)
            .then(() => {
                //Nothing really
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static enrollAdmin() {
        let bm = new BlockchainManager();
        bm.init()
        return bm.registerAdmin()
            .then(() => {
                //Nothing really
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name walletRegistration
     * @author Aabo Technologies © 2017 - Server's team
     * @description Creates a single wallet
     * @param {String} id, the id of the wallet within the ledger
     * @param {Number} balance, the balance of the wallet
     * @returns {Boolean} done, if the process has ended it'll return TRUE
     */

    static walletRegistration(id, balance) {
        let start;
        let end;
        //Get the BlockchainManager object created
        let bm = new BlockchainManager();
        //Initialize the peers and channels
        bm.init();
        //Start the fun!
        return bm.envSetter()
            .then((user) => {
                let fun = 'initWallet';
                let args = [];
                args.push(id);
                args.push(balance.toString());
                mongo.saveAst(args);
                start = now();
                return bm.invokeFunction(fun, args, user);
            })
            .then(() => {
                end = now();
                bm.profilingTime(start, end, 1, 'acc');
                return true;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })
    }
}

module.exports = BlockchainManager;