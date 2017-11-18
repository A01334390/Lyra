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
// ------- Basic Libraries for this persistance modules -------
const mongo = require('./mongoManager');
// ------- Basic Libraries for this Hyperledger Fabric -------
var hfc = require('fabric-client');
require('./config.js');
var helper = require('./app/helper.js');
var channels = require('./app/create-channel.js');
var join = require('./app/join-channel.js');
var install = require('./app/install-chaincode.js');
var instantiate = require('./app/instantiate-chaincode.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');



class BlockchainManager {

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

    static profilingTime(timeStart, timeEnd, simTrax, whereFrom) {
        const METHOD = 'profilingTime';

        let executedTime = (timeEnd - timeStart);
        let opTime = (executedTime / simTrax);
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

    static transactionCannon(peer, chaincodeName, channelName, amount, username, orgName) {
        let start;
        let end;

        return this.createSchedule(peer, chaincodeName, channelName, amount, username, orgName)
            .then((schedule) => {
                let cannonBalls = [];
                for (let i = 0; i < schedule.length; i++) {
                    let args = [];
                    args.push(schedule[i].from);
                    args.push(schedule[i].to);
                    args.push(schedule[i].funds.toString());
                    cannonBalls.push(this.invokeTransactions(peer, chaincodeName, chaincodeName, 'transferFunds', args, username, orgName));
                }
                start = now();
                return Promise.all(cannonBalls);
            })
            .then(() => {
                end = now();
                this.profilingTime(start, end, amount, 'tx');
                return this.getWalletByRange(peer, chaincodeName, channelName, start, end, username, orgName);
            })
            .then((ledger) => {
                return this.syncChecker(ledger);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static syncChecker(ledger) {
        let wallet;
        return mongo.getAllAst()
            .then((result) => {
                wallet = result;
                return mongo.getAllTx();
            })
            .then((transactions) => {
                for (let i = 0; i < transactions.length; i++) {
                    for (let x = 0; x < wallet.length; x++) {
                        if (wallet[x].id == transactions[i].from) {
                            wallet[x].balance = +wallet[x].balance - +transactions[i].funds;
                        }

                        if (wallet[x].id == transactions[i].to) {
                            wallet[x].balance = +wallet[x].balance + +transactions[i].funds;
                        }
                    }
                }
            })
            .then(() => {
                let err = [];
                for (let i = 0; i < ledger.length; i++) {
                    for (let x = 0; x < wallet.length; x++) {
                        if (ledger[i].Key == wallet[x].id && ledger[i].Record.balance != wallet[x].balance) {
                            err.push(ledger[i].Record.address);
                        }
                    }
                }

                if (err.length != 0) {
                    console.log(chalk.red.bold('The ledger is not synced'));
                    console.log(chalk.yellow.bold('==== ADDRESSES NOT SYNCED ===='));
                    for (let i = 0; i < err.length; i++) {
                        console.log(err[i]);
                    }
                    console.log(chalk.yellow.bold('==== ADDRESSES NOT SYNCED ===='));
                } else {
                    console.log(chalk.green.bold('The ledger is synced'));
                }
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name createSchedule
     * @author Aabo Technologies © 2017 - Server's team
     * @description Creates a schedule for the transaction cannon
     * @param {Number} top, this is the top wallet to be chosen for transactiions
     * @param {Number} amount, this is the amount of transactions to be made
     * @returns {JSON} schedule, a json list of transactions to be made 
     */

    static createSchedule(peer, chaincodeName, channelName, amount, username, orgName) {

        return this.getWalletByRange(peer, chaincodeName, channelName, '', '', username, orgName)
            .then((result) => {
                let schedule = [];
                for (let i = 0; i < amount; i++) {
                    var tran = {
                        from: result[2 * (i % result.length / 2)].Key,
                        to: result[(2 * (i % result.length / 2)) + 1].Key,
                        funds: Math.floor(Math.random() * (1000 - 10) + 10)
                    };
                    mongo.saveTx(tran);
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

    static createWallets(peer, chaincodeName, channelName, amount, username, orgName) {
        let start;
        let end;
        let all_promise = [];
        //Create the wallets
        for (let i = 0; i < amount; i++) {
            let args = [];
            args.push(crypto.randomBytes(20).toString('hex'));
            args.push((i * 1000).toString());
            mongo.saveAst(args);
            all_promise.push(this.invokeTransactions(peer, chaincodeName, channelName, 'initWallet', args, username, orgName));
        }
        //Launch the accounts
        start = now();
        return Promise.all(all_promise)
            .then(() => {
                end = now();
                this.profilingTime(start, end, amount, 'acc');
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name getWallet
     * @author Aabo Technologies © 2017 - Server's team
     * @description Reads a wallet from the ledger
     * @param {String} id, the md5 hash that identifies a wallet
     * @returns {JSON} wallet, the wallet's information
     */

    static getWallet(peer, chaincodeName, channelName, id, username, orgName) {
        var args = [];
        args.push(id);
        return this.queryChaincode(peer, chaincodeName, channelName, 'readWallet', args, username, orgName)
            .then((result) => {
                return result;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name getWalletByRange
     * @author Aabo Technologies © 2017 - Server's team
     * @description Gets the information from several wallets on the ledger
     * @param {String} start, the leftmost or smallest wallet on the ledger
     * @param {String} end, the rightmost or biggest wallet on the ledger
     * @returns {JSON} wallets, the wallets' information
     */

    static getWalletByRange(peer, chaincodeName, channelName, start, end, username, orgName) {
        var args = [];
        args.push(start);
        args.push(end);
        return this.queryChaincode(peer, chaincodeName, channelName, 'getWalletsByRange', args, username, orgName)
            .then((result) => {
                return result;
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
    static transfer(peer, chaincodeName, channelName, from, to, balance, username, orgName) {
        let start;
        let end;
        var args = [];
        args.push(from);
        args.push(to);
        args.push(balance);
        var tran = {
            from: from,
            to: to,
            funds: balance
        };
        mongo.saveTx(tran);
        start = now();
        return this.invokeTransactions(peer, chaincodeName,
                channelName, 'transferFunds', args, username, orgName)
            .then((message) => {
                end = now();
                this.profilingTime(start, end, 1, 'tx');
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })
    }

    static enrollUser(username, orgName) {
        return helper.getRegisteredUsers(username, orgName, true)
            .then((response) => {
                return response;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static createChannel(channelName, channelConfigPath, username, orgName) {
        return channels.createChannel(channelName, channelConfigPath, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static joinChannel(channelName, peers, username, orgName) {
        return join.joinChannel(channelName, peers, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })
    }

    static installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, username, orgName) {
        return install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static instantiateChaincode(channelName, chaincodeName, chaincodeVersion, fcn, args, username, orgName) {
        return instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, fcn, args, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static invokeTransactions(peers, chaincodeName, channelName, fcn, args, username, orgName) {
        return invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static queryChaincode(peer, chaincodeName, channelName, fcn, args, username, orgName) {
        return query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static getBlockByBlockNumber(peer, blockId, username, orgName) {
        return query.getBlockByNumber(peer, blockId, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static getTransactionByTransactionID(peer, txId, username, orgName) {
        return query.getTransactionByID(peer, txId, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static getBlockByHash(peer, hash, username, orgName) {
        return query.getBlockByHash(peer, hash, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static getChannelInfo(peer, username, orgName) {
        return query.getChainInfo(peer, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static getInstalledChaincodes(peer, installType, username, orgName) {
        return query.getInstalledChaincodes(peer, installType, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    static getChannels(peer, username, orgName) {
        return query.getChannels(peer, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
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

    static walletRegistration(peer, chaincodeName, channelName, id, balance, username, orgName) {
        let start;
        let end;

        let args = [];
        args.push(id);
        args.push(balance.toString());
        mongo.saveAst(args);

        start = now();
        return this.invokeTransactions(peer, chaincodeName, channelName, 'initWallet', args, username, orgName)
            .then(() => {
                end = now();
                this.profilingTime(start, end, 1, 'acc');
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name getWalletHistory
     * @author Aabo Technologies © 2017 - Server's team
     * @description Checks the wallet's history
     * @param {String} id, the id of the wallet within the ledger
     * @returns {Object} JSON Document, a json containing the histoy of a Wallet
     */

    static getWalletHistory(peer, chaincodeName, channelName, id, username, orgName) {
        var args = [];
        args.push(id);
        return this.queryChaincode(peer, chaincodeName, channelName, 'getHistoryForWallet', id, username, orgName)
            .then((result) => {
                console.log(result);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
}

module.exports = BlockchainManager;