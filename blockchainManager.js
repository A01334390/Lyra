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

    }

    /**@name CheckRegisteredAssets
     * @author Aabo Technologies © 2017 - Server's team
     * @description Lists all registered assets in the Blockchain
     * @returns {Promise} 
     */

    checkRegisteredAssets() {
       
    }

    /**@name CheckRegisteredParticipants
     * @author Aabo Technologies © 2017 - Server's team
     * @description Lists all registered participants on the Blockchain 
     * @returns {Promise} A promise whose fullfillment means the participants have been registered
     */

    checkRegisteredParticipants() {
        
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
        
    }

    /**@name ShowCurrentAssets
     * @author Aabo Technologies © 2017 - Server's team
     * @description Lists all current wallets on the Ledger
     * @returns {Promise} A promise whose fullfillment means all wallets have succesfully been listed 
     */

    showCurrentAssets() {
        
    }

    /**@name rawAssetsOnLedger
     * @author Aabo Technologies © 2017 - Server's team
     * @description Returns all assets on the ledger in raw form
     * @returns {Promise} A promise whose fullfillment means all wallets have succesfully been returned
     */

    rawAssetsOnLedger() {
        
    }

    /**@name ShowCurrentParticipants
     * @author Aabo Technologies © 2017 - Server's team
     * @description Lists all current Participants on the ledger
     * @returns {Promise} A promise whose fullfillment means all participants have succesfully been listed 
     */

    showCurrentParticipants() {
        
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
        
    }

    /**@name TransactionSchedule
     * @author Aabo Technologies © 2017 - Server's team
     * @description Creates a transaction plan for the testing phase
     * @param {Number} amount of transactions to simulate
     * @returns {JSON} document that includes the schedule
     */

    transactionSchedule(simTrax) {
        
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
}

module.exports = BlockchainManager;