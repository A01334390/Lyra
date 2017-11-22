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
     * @param {Array} peer, is an array of peers to execute the transaction
     * @param {String} chaincodeName, is the name of the chaincode to target
     * @param {String} channelName, is the name of the channel to target
     * @param {String} username, is the username to sign the transaction
     * @param {String} orgName, is the name of the organization
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

                var chain;
                return Promise.resolve([])
                    .then(all => cannonBalls[0].then(Array.prototype.concat.bind(all)))
            })
            .then(() => {
                end = now();
                this.profilingTime(start, end, amount, 'tx');
               // return this.getWalletByRange(peer, chaincodeName, channelName, start, end, username, orgName);
            })
            .then((ledger) => {
                //return this.syncChecker(ledger);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name syncLedger
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} ledger, an array of accounts taken from the ledger 
     */

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
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , an array of peers where to execute the transaction
     * @param {String} chaincodeName , the name of the chaincode to invoke
     * @param {String} channelName , the name of the channel to target
     * @param {Number} amount , the amount of transactions to schedule
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
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
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , an array of peers where to execute the transaction
     * @param {String} chaincodeName , the name of the chaincode to invoke
     * @param {String} channelName , the name of the channel to target
     * @param {Number} amount , amount of wallets to create on the ledger
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
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
        
        return Promise.resolve([])
         .then(all => all_promise[0].then(Array.prototype.concat.bind(all)))
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
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , an array of peers where to execute the transaction
     * @param {String} chaincodeName , the name of the chaincode to invoke
     * @param {String} channelName , the name of the channel to target
     * @param {String} id , the wallet address to target
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
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
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , an array of peers where to execute the transaction
     * @param {String} chaincodeName , the name of the chaincode to invoke
     * @param {String} channelName , the name of the channel to target
     * @param {String} start , the lower bound to get addresses from
     * @param {String} end , the upper bound to get addresses from
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
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
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , an array of peers where to execute the transaction
     * @param {String} chaincodeName , the name of the chaincode to invoke
     * @param {String} channelName , the name of the channel to target
     * @param {String} from , the address of the wallet that is sending money 
     * @param {String} to , the address of the wallet that is receiving money
     * @param {Number} balance , the amount of money that is being transfered
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
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

    /**
     * @name enrollUser
     * @author Aabo Technologies © 2017 - Server's division
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static enrollUser(username, orgName) {
        return helper.getRegisteredUsers(username, orgName, true)
            .then((response) => {
                return response;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name createChannel
     * @author Aabo Technologies © 2017 - Server's division
     * @param {String} channelName , the name of the channel to enroll
     * @param {String} channelConfigPath , the path of configuration
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static createChannel(channelName, channelConfigPath, username, orgName) {
        return channels.createChannel(channelName, channelConfigPath, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name joinChannel
     * @author Aabo Technologies © 2017 - Server's division
     * @param {String} channelName , name of the channel to join
     * @param {Array} peers , array of peers to join
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static joinChannel(channelName, peers, username, orgName) {
        return join.joinChannel(channelName, peers, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            })
    }

    /**
     * @name installChaincode
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peers , array of peers to install a Chaincode
     * @param {String} chaincodeName , name of the chaincode to install
     * @param {Path} chaincodePath , file path
     * @param {String} chaincodeVersion , version of the chaincode
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, username, orgName) {
        return install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @name instantiateChaincode
     * @author Aabo Technologies © 2017 - Server's division
     * @param {String} channelName , name of the channel 
     * @param {String} chaincodeName , name of the chaincode
     * @param {String} chaincodeVersion , chaincode version
     * @param {String} fcn , function to invoke
     * @param {Array} args , arguments to pass 
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static instantiateChaincode(channelName, chaincodeName, chaincodeVersion, fcn, args, username, orgName) {
        return instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, fcn, args, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name invokeTransactions
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peers , array of peers to invoke the transaction
     * @param {String} chaincodeName , name of the chaincode
     * @param {String} channelName , name of the channel
     * @param {String} fcn , function to invoke
     * @param {Array} args , arguments to pass 
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static invokeTransactions(peers, chaincodeName, channelName, fcn, args, username, orgName) {
        return invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name queryChaincode
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , array of peers to query
     * @param {String} chaincodeName , name of the chaincode
     * @param {String} channelName , name of the channel
     * @param {String} fcn , function to query
     * @param {Array} args , arguments
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static queryChaincode(peer, chaincodeName, channelName, fcn, args, username, orgName) {
        return query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name getBlockByBlockNumber
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , peers to query the block
     * @param {String} blockId , Block id
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static getBlockByBlockNumber(peer, blockId, username, orgName) {
        return query.getBlockByNumber(peer, blockId, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name getTransactionByTransactionID
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , array of peers to get the transaction
     * @param {String} txId , transaction ID
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target 
     */

    static getTransactionByTransactionID(peer, txId, username, orgName) {
        return query.getTransactionByID(peer, txId, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name getBlockByHash
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , array of peers to query
     * @param {String} hash , hash of the block 
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static getBlockByHash(peer, hash, username, orgName) {
        return query.getBlockByHash(peer, hash, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name getChannelInfo
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , array of peers to check
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static getChannelInfo(peer, username, orgName) {
        return query.getChainInfo(peer, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name getInstalledChaincodes
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , array of peers 
     * @param {String} installType , type of installation
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static getInstalledChaincodes(peer, installType, username, orgName) {
        return query.getInstalledChaincodes(peer, installType, username, orgName)
            .then((message) => {
                return message;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
    /**
     * @name getChannels
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer, peers to query 
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

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
     * @author Aabo Technologies © 2017 - Server's division
     * @param {*} peer , array of 
     * @param {*} chaincodeName 
     * @param {*} channelName 
     * @param {*} id 
     * @param {*} balance 
     *  @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
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
     * @author Aabo Technologies © 2017 - Server's division
     * @param {Array} peer , array of peers to query
     * @param {String} chaincodeName , name of the chaincode
     * @param {String} channelName , name of the channel
     * @param {String} id , the wallet's address
     * @param {String} username , the user that will sign transactions
     * @param {String} orgName , name of the organization to target
     */

    static getWalletHistory(peer, chaincodeName, channelName, id, username, orgName) {
        var args = [];
        args.push(id);
        return this.queryChaincode(peer, chaincodeName, channelName, 'getHistoryForWallet', id, username, orgName)
            .then((result) => {
                return result;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }
}

module.exports = BlockchainManager;