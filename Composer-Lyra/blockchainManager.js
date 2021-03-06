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
// ------- Basic Libraries for this package -------
const mongo = require('./mongoManager');

// ------- Hyperledger libraries for this package -------
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var config = require('config').get('lyra-cli');
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
     * @author Aabo Technologies © 2017 - Server's team
     * @description Initializes the chaincode by making a connection to the composer runtime
     * @returns {Promise} A promise whose fullfillment means the initialization has completed
     */

    init() {
        return this.businessNetworkConnection.connect(this.connectionProfile, this.businessNetworkIdentifier, participantId, participantPwd)
            .then((result) => {
                this.businessNetworkDefinition = result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@name CheckRegisteredAssets
     * @author Aabo Technologies © 2017 - Server's team
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

                return table.toString();
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@name CheckRegisteredParticipants
     * @author Aabo Technologies © 2017 - Server's team
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
                return table.toString();
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@name InitializatorDaemon
     * @author Aabo Technologies © 2017 - Server's team
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
        return this.businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
            .then((result) => {
                this.walletRegistry = result;
            })
            .then(() => {
                let factory = this.businessNetworkDefinition.getFactory();
                /** Create a new Participant within the network */
                client = factory.newResource('org.aabo', 'Client', md5(clientSeed));
                client.id = md5(clientSeed);
                /**Save to MDB */
                mongo.savePnt(client);
                /** Create a new relationship for the owner */
                ownerRelation = factory.newRelationship('org.aabo', 'Client', md5(clientSeed));
                /** Create a new wallet for the owner */
                wallet = factory.newResource('org.aabo', 'Wallet', md5(walletSeed));
                wallet.id = md5(walletSeed);
                wallet.balance = (Math.random() * top) + bottom;
                wallet.owner = ownerRelation;
                /**Save to MDB */
                mongo.saveAst(wallet);
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
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**@name ShowCurrentAssets
     * @author Aabo Technologies © 2017 - Server's team
     * @description Lists all current wallets on the Ledger
     * @returns {Promise} A promise whose fullfillment means all wallets have succesfully been listed 
     */

    showCurrentAssets() {
        const METHOD = 'showCurrentAssets';

        let walletRegistry;
        let clientRegistry;

        return this.businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
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
                return table.toString();
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@name rawAssetsOnLedger
     * @author Aabo Technologies © 2017 - Server's team
     * @description Returns all assets on the ledger in raw form
     * @returns {Promise} A promise whose fullfillment means all wallets have succesfully been returned
     */

    rawAssetsOnLedger() {
        const METHOD = 'rawAssetsOnLedger';
        let walletRegistry;

        return this.businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
            .then((registry) => {
                return registry.resolveAll();
            })
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@name ShowCurrentParticipants
     * @author Aabo Technologies © 2017 - Server's team
     * @description Lists all current Participants on the ledger
     * @returns {Promise} A promise whose fullfillment means all participants have succesfully been listed 
     */

    showCurrentParticipants() {
        const METHOD = 'showCurrentParticipants';

        let walletRegistry;
        let clientRegistry;

        return this.businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
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
                return table.toString();
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@name MakeTransactionMethod
     * @author Aabo Technologies © 2017 - Server's team
     * @description This method makes a single transaction over the ledger
     * @param {String} fromID is the md5 related to a Client's wallet on the ledger who's sending money
     * @param {String} toID is the md5 related to a Client's wallet on the ledger who's receiving money
     * @param {Number} funds is an amount of money to be sent from one wallet to the other
     * @returns {Promise} whose fullfiment means a transaction was made succesfully 
     */

    makeTransaction(fromID, toID, funds) {
        const METHOD = 'makeTransaction';
        let from;
        let walletRegistry;
        let to;

        return this.businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
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
                return this.businessNetworkConnection.submitTransaction(resource);;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @name makeReplicatedTransaction
     * @author Aabo Technologies © 2017 - Server's team
     * @description This method makes a single transaction over the ledger
     * @param {String} fromID is the md5 related to a Client's wallet on the ledger who's sending money
     * @param {String} toID is the md5 related to a Client's wallet on the ledger who's receiving money
     * @param {Number} funds is an amount of money to be sent from one wallet to the other
     * @returns {Promise} whose fullfiment means a transaction was made succesfully 
     */

    makeReplicatedTransaction(fromID,toID,funds){
        const METHOD = 'makeReplicatedTransaction';
        let from;
        let walletRegistry;
        let to;
        let resource;

        return this.businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
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
                resource = serializer.fromJSON({
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
                return this.businessNetworkConnection.submitTransaction(resource);;
            })
            .then(() => {
                return mongo.saveTx(resource);
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@name TransactionSchedule
     * @author Aabo Technologies © 2017 - Server's team
     * @description Creates a transaction plan for the testing phase
     * @param {Number} amount of transactions to simulate
     * @returns {JSON} document that includes the schedule
     */

    transactionSchedule(simTrax) {
        const METHOD = 'transactionSchedule';
        return this.businessNetworkConnection.getAssetRegistry('org.aabo.Wallet')
            .then((registry) => {
                return registry.resolveAll();
            })
            .then((aResources) => {
                let schedule = [];
                for (let i = 1; i <= simTrax; i++) {
                    var fromRandomUser = (2 * i) - 1;
                    var toRandomUser = (2 * i);
                    var fundsRandom = (Math.random() * 1000) + 100;
                    schedule.push({
                        from: aResources[fromRandomUser].id,
                        to: aResources[toRandomUser].id,
                        funds: fundsRandom
                    });
                }
                return schedule;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
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


    /**@name registeredAssets
     * @author Aabo Technologies © 2017 - Server's team
     * @description Runs the Check Registered Assets command
     * @returns {Promise} resolved when the action is completed
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
                console.log('An error occured: ', error);
                process.exit(1);
            });
    }

    /**@name registeredParticipants
     * @author Aabo Technologies © 2017 - Server's team
     * @description Runs the Check Registered Participants command
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
                console.log('An error occured: ', error);
                process.exit(1);
            });
    }

    /**@name initializeLedger
     * @author Aabo Technologies © 2017 - Server's team
     * @description Runs the Initializator Daemon
     * @param {Number} clientSeed is the seed for the client
     * @param {Number} walletSeed is the seed for the wallet
     * @param {Number} bottom is the least amount of money a wallet can have
     * @param {Number} top is the most amount of money a wallet can have
     * @returns {Promise} A promise whose fullfillment means the initialization of assets has completed
     */

    static initializeLedger(clientSeed, walletSeed, bottom, top) {
        /**Start the spinner */
        const spinner = new ora({
            text: 'Connecting to Hyperledger...',
            spinner: process.argv[2],
            color: 'blue'
        });
        let bm = new BlockchainManager();
        spinner.start();
        return bm.init()
            .then(() => {
                spinner.text = 'Creating wallets and accounts...';
                spinner.color = 'magenta';
                return bm.initializatorDaemon(clientSeed, walletSeed, bottom, top);
            })
            .then(() => {
                spinner.succeed('Accounts created successfully!');
            })
            .catch(function (error) {
                spinner.fail('An error occured: ', error);
                process.exit(1);
            });
    }

    /**@name assetsOnLedger
     * @author Aabo Technologies © 2017 - Server's team
     * @description Runs the Show Current Assets method
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
                console.log('An error occured: ', error);
                process.exit(1);
            });
    }

    /**@name participantsOnLedger
     * @author Aabo Technologies © 2017 - Server's team
     * @description Runs the Show Current Participants method
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
                console.log('An error occured: ', error);
                process.exit(1);
            });
    }

    /**@name transfer
     * @author Aabo Technologies © 2017 - Server's team
     * @description Executes the make transaction method
     * @param {String} fromID is the md5 related to a Client's wallet on the ledger who's sending money
     * @param {String} toID is the md5 related to a Client's wallet on the ledger who's receiving money
     * @param {Number} funds is an amount of money to be sent from one wallet to the other
     * @returns {Promise} whose fullfilment means a transaction was made succesfully 
     */

    static transfer(fromID, toID, funds) {
        /**Start the spinner */
        const spinner = new ora({
            text: 'Connecting to Hyperledger...',
            spinner: process.argv[2],
            color: 'blue'
        });
        let bm = new BlockchainManager();
        spinner.start();
        return bm.init()
            .then(() => {
                spinner.text = 'Making transaction...';
                spinner.color = 'magenta';
                return bm.makeTransaction(fromID, toID, funds);
            })
            .then(() => {
                spinner.succeed('Transaction made successfully!');
            })
            .catch(function (error) {
                spinner.fail('An error occured: ', error);
                process.exit(1);
            });
    }

    /**@name batchAccount
     * @author Aabo Technologies © 2017 - Server's team
     * @description Create batch accounts and wallets
     * @param {Number} clientSeed is the seed for the client
     * @param {Number} walletSeed is the seed for the wallet
     * @param {Number} bottom is the least amount of money a wallet can have
     * @param {Number} top is the most amount of money a wallet can have
     * @returns {Promise} whose fullfilment means all accounts and wallets have been made
     */

    static batchAccount(amount, bottom, top) {
        /**Start the spinner */
        const spinner = new ora({
            text: 'Connecting to Hyperledger...',
            spinner: process.argv[2],
            color: 'blue'
        });
        let bm = new BlockchainManager();
        //**Set up the time start */
        let timeStart;
        let timeEnd;
        //**Set up the time end */
        spinner.start();
        return bm.init()
            .then(() => {
                spinner.text = 'Creating accounts...';
                spinner.color = 'magenta';
                /**Spinner business */
                let all_promise = [];
                for (let i = 0; i < amount; i++) {
                    all_promise.push(bm.initializatorDaemon(i, (i + amount), bottom, top));
                }
                timeStart = now().toFixed(0);
                return Promise.all(all_promise);
            })
            .then((arr) => {
                timeEnd = now().toFixed(0);
                bm.profilingTime(timeStart, timeEnd, amount, 'acc');
                spinner.succeed('Accounts created successfully!');
            })
            .catch(function (error) {
                spinner.fail('An error occured:', error);
                process.exit(1);
            })
    }

    /**@name getTransactionSchedule
     * @author Aabo Technologies © 2017 - Server's team
     * @description Executes the Transaction Schedule Command
     * @param {Number} amount of transactions to simulate
     * @returns {JSON} document that includes the schedule
     */

    static getTransactionSchedule(simTrax) {
        /**Start the spinner */
        const spinner = new ora({
            text: 'Connecting to Hyperledger...',
            spinner: process.argv[2],
            color: 'blue'
        });
        /**Get the Blockchain Manager */
        let bm = new BlockchainManager();
        /**Start the Spinner */
        spinner.start();
        return bm.init()
            .then(() => {
                spinner.text = 'Getting the schedule...';
                spinner.color = 'green';
                return bm.transactionSchedule(simTrax);
            })
            .then((result) => {
                spinner.succeed('Schedule created successfully!');
                return result;
            })
            .catch(function (error) {
                spinner.fail('An error occured: ', error);
                process.exit(1);
            });
    }
    /**@name TransactionCannon
     * @author Aabo Technologies © 2017 - Server's team
     * @description This is it. This launches as many transactions as possible, it doesn't care about your feelings
     * @param {Number} amount of transactions to make
     * @param {String} replica if the transaction information will be replicated
     * @returns {Promise} that it will try it's best, don't sweat it
     */

    static transactionCannon(simTrax,replica) {
        /**Start the spinner */
        const spinner = new ora({
            text: 'Connecting to Hyperledger...',
            spinner: process.argv[2],
            color: 'blue'
        });
        let bm = new BlockchainManager();
        //**Set up the time start */
        let timeStart;
        let timeEnd;
        let schedule;
        //**Set up the time end */
        spinner.start();
        return bm.init()
            .then(() => {
                spinner.text = 'Getting the cannon balls...';
                spinner.color = 'magenta';
                return bm.transactionSchedule(simTrax);
            })
            .then((result) => {
                let cannonBalls = [];
                schedule = result;
                if(replica.toLowerCase() == 'n'){
                    for (let i = 0; i < result.length; i++) {
                        spinner.text = 'Breaking into the chain...';
                        spinner.color = 'green';
                        cannonBalls.push(bm.makeTransaction(result[i].from, result[i].to, result[i].funds));
                    } 
                }else{
                    for (let i = 0; i < result.length; i++) {
                        spinner.text = 'Merely tapping into the chain...';
                        spinner.color = 'red';
                        cannonBalls.push(bm.makeReplicatedTransaction(result[i].from, result[i].to, result[i].funds));
                    }
                }
                timeStart = now().toFixed(0);
                return Promise.all(cannonBalls);
            })
            .then(() => {
                timeEnd = now().toFixed(0);
                bm.profilingTime(timeStart, timeEnd, simTrax, 'tx');
                console.log('\n');
                spinner.succeed('Transaction Cannon Finished!');
            })
            .then(() => {
                return schedule;
            })
            .catch(function (error) {
                spinner.fail('An error occured: ', error);
                process.exit(1);
            });
    }

    /**@name isLedgerStateCorrect
     * @author Aabo Technologies © 2017 - Server's team
     * @description Checks if transactions within the ledger were indeed executed correctly or not
     * @param {Array} Schedule which includes the list of transactions made on the ledger
     * @returns {Boolean} if the ledger is indeed synced or not
     */

    static isLedgerStateCorrect(schedule) {
        /**Start the spinner */
        const spinner = new ora({
            text: 'Connecting to Hyperledger...',
            spinner: process.argv[2],
            color: 'blue'
        });
        let bm = new BlockchainManager();
        let modState;
        /** Get the state of the database */
        spinner.start();
        return mongo.getAllAst()
            .then((result) => {
                spinner.text = 'Replicating transactions on memory...';
                spinner.color = 'magenta';
                modState = result;
                for (let i = 0; i < schedule.length; i++) {
                    for (let x = 0; x < modState.length; x++) {
                        if (modState[x].id == schedule[i].from) {
                            modState[x].balance = modState[x].balance - schedule[i].funds;
                        }
                        if (modState[x].id == schedule[i].to) {
                            modState[x].balance = modState[x].balance + schedule[i].funds;
                        }
                    }
                }
                return bm.init();
            })
            .then(() => {
                spinner.text = 'Retrieving assets from Hyperledger...';
                spinner.color = 'yellow';
                return bm.rawAssetsOnLedger();
            })
            .then((rawLedger) => {
                spinner.text = 'Comparing in memory results with the ledger...';
                spinner.color = 'magenta';
                let state = true;
                let unsynced = [];
                for (let i = 0; i < rawLedger.length; i++) {
                    for (let x = 0; x < modState.length; x++) {
                        if (rawLedger[i].id == modState[x].id && rawLedger[i].balance != modState[x].balance) {
                            unsynced.push(rawLedger[i].id);
                            state = false;
                        }
                    }
                }
                if (!state) {
                    spinner.fail('Ledger is not synced');
                    console.log('\n');
                    console.log('=============== UNSYNCED ===============');
                    for (let i = 0; i < unsynced.length; i++) {
                        console.log(unsynced[i]);
                    }
                    console.log('=============== UNSYNCED ===============');
                } else {
                    spinner.succeed('Ledger is synced!');
                }
                return state;
            })
            .catch(function (error) {
                spinner.fail('An error occured: ', error);
                process.exit(1);
            });
    }
}

module.exports = BlockchainManager;