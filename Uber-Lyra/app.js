#!/usr/bin/env node

//System related
var fs = require('fs');
var path = require('path');

//Hyperledger related
require('./config.js');
var hfc = require('fabric-client');
const hyper = require('./blockchainManager');

//CLI Elements and Libraries
var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var inquirer = require('inquirer');
var Table = require('cli-table');

//Versioning System
var jsond = require('./package');

//                                 ___           ___     
//                     ___        /  /\         /  /\    
//                    /__/|      /  /::\       /  /::\   
//   ___     ___     |  |:|     /  /:/\:\     /  /:/\:\  
//  /__/\   /  /\    |  |:|    /  /:/~/:/    /  /:/~/::\ 
//  \  \:\ /  /:/  __|__|:|   /__/:/ /:/___ /__/:/ /:/\:\
//   \  \:\  /:/  /__/::::\   \  \:\/:::::/ \  \:\/:/__\/
//    \  \:\/:/      ~\~~\:\   \  \::/~~~~   \  \::/     
//     \  \::/         \  \:\   \  \:\        \  \:\     
//      \__\/           \__\/    \  \:\        \  \:\    
//                                \__\/         \__\/    

var yargs = require('yargs')
	.command('author', "Show the project's authors")
	.command('user', 'Enroll a new user into the network', {
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('channel', 'Create a new channel over the network', {
		name: {
			description: 'Name of the channel to create',
			require: true,
			alias: 'c'
		},
		path: {
			description: 'Path of the channel configuration file',
			require: true,
			alias: 'pa'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('join', 'Join a channel over the network', {
		channel: {
			description: 'Name of the channel to create',
			require: true,
			alias: 'ch'
		},
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('install', 'Install the chaincode over the network', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		path: {
			description: 'Path of the chaincode folder',
			require: true,
			alias: 'pa'
		},
		version: {
			description: 'Version of the chaincode to install',
			require: true,
			alias: 'v'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('instantiate', 'Instantiate the chaincode over the network', {
		// 'mychannel','halley','v1','Invoke',"\"args\":[\"\"]",'luna','org1'
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		chaincode: {
			description: 'Name of the chaincode to instantiate',
			require: true,
			alias: 'cc'
		},
		version: {
			description: 'Version of the chaincode to install',
			require: true,
			alias: 'v'
		},
		method: {
			description: "Method to execute over the network",
			require: true,
			default: 'Invoke',
			alias: 'm'
		},
		args: {
			description: "Arguments for the method",
			require: true,
			default: '',
			alias: 'a'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('block', 'Get a Block by its Block number', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		blockId: {
			description: 'The ID of the Block',
			require: true,
			alias: 'bi'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('transaction', 'Get a transaction by Transaction ID', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		txId: {
			description: 'The ID of the Transaction',
			require: true,
			alias: 'tx'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('hash', 'Get a Block by Hash', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		hash: {
			description: 'The Hash of the Block',
			require: true,
			alias: 'h'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('chinfo', 'Get information about a channel', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			alias: 'pe'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('instacodes', 'Get installed Chaincodes', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		installType: {
			description: 'The Type of the installation',
			require: true,
			alias: 'it'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('channels', 'Get instantiated channels', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('ballet', 'Create a bunch of wallets over the network', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		amount: {
			description: 'Amount of wallets to be created',
			require: true,
			alias: 'a'
		},

		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('wallet', 'Create a single wallet', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		id: {
			description: 'Address of the wallet within the network',
			require: true,
			alias: 'i'
		},
		balance: {
			description: 'Initial money balance of the wallet',
			require: true,
			alias: 'b'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('gwallet', 'Get the information of a wallet', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		id: {
			description: 'Address of the wallet within the network',
			require: true,
			alias: 'i'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('rwallet', 'Get the information of multiple wallets', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		start: {
			description: 'The lower bound of the search',
			require: true,
			alias: 's',
			default: ''
		},
		end: {
			description: 'The upper bound of the search',
			require: true,
			alias: 'e',
			default: ''
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('history', 'Get the historical information of a wallet', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		id: {
			description: 'Address of the wallet within the network',
			require: true,
			alias: 'i'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('cannon', 'Launch the transaction cannon', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		amount: {
			description: 'Amount of transactions to deploy to the network',
			require: true,
			alias: 'a'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('transfer', 'Make a single fund transfer', {
		// peers,'halley','mychannel','E','D','50','luna','org1'
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		from: {
			description: 'Address of the wallet to transfer funds',
			require: true,
			alias: 'f'
		},
		to: {
			description: 'Address of the wallet to receive funds',
			require: true,
			alias: 't'
		},
		funds: {
			description: 'Amount of money to send',
			require: true,
			alias: 'm'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.command('schedule', 'Create a POC Schedule to test the algorithm', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
			type: 'array',
			alias: 'pe'
		},
		chaincode: {
			description: 'Name of the chaincode to install',
			require: true,
			alias: 'cc'
		},
		channel: {
			description: 'Name of the channel to instantiate the chaincode',
			require: true,
			alias: 'ch'
		},
		amount: {
			description: 'Amount of transactions to simulate to the network',
			require: true,
			alias: 'a'
		},
		username: {
			description: 'Username of the user to sign transactions',
			require: true,
			alias: 'u'
		},
		organization: {
			description: 'Organization where the user belongs',
			require: true,
			alias: 'o'
		}
	})
	.help()
	.argv;

//https://itunes.apple.com/mx/album/stay/1207481534?i=1207481546&l=en

switch (yargs._[0]) {
	case 'author':
		author();
		process.exit(0);
		break;
	case 'user': //Done /  Try node app user -u luna -o org1
		console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.enrollUser(yargs.username, yargs.organization)
			.then((message) => {
				console.log('Success:',chalk.green.bold(message.success));
				console.log('Password:',chalk.yellow.bold(message.secret));
				console.log('Message:',chalk.blue.bold(message.message));
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'channel': //DONE
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.createChannel(yargs.name, yargs.path, yargs.username, yargs.organization)
			.then((message) => {
				console.log('Success:',chalk.green.bold(message.success));
				console.log('Message:',chalk.blue.bold(message.message));
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'join': //DONE
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.joinChannel(yargs.channel, yargs.peers, yargs.username, yargs.organization)
			.then((message) => {
				console.log('Success:',chalk.green.bold(message.success));
				console.log('Message:',chalk.blue.bold(message.message));
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'install': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.installChaincode(yargs.peers, yargs.chaincode, yargs.path, yargs.version, yargs.username, yargs.organization)
			.then((message) => {
				console.log(chalk.green.bold('Chaincode was installed successfully!'));
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});

		break;

	case 'instantiate': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.instantiateChaincode(yargs.channel, yargs.chaincode, yargs.version, yargs.method, yargs.args, yargs.username, yargs.organization)
			.then((message) => {
				console.log(chalk.green.bold('Chaincode was instantiated8 successfully!'));
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'block': 
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getBlockByBlockNumber(yargs.peer, yargs.blockId, yargs.username, yargs.organization)
			.then((message) => {
				console.log(message);
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'transaction':
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getTransactionByTransactionID(yargs.peers, yargs.txId, yargs.username, yargs.organization)
			.then((message) => {
				console.log(message);
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'hash':
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getBlockByHash(yargs.peers, yargs.hash, yargs.username, yargs.organization)
			.then((message) => {
				console.log(message);
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'chinfo': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getChannelInfo(yargs.peers, yargs.username, yargs.organization)
			.then((message) => {
				console.log(message);
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'instacodes':
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getInstalledChaincodes(yargs.peers, yargs.installType, yargs.username, yargs.organization)
			.then((message) => {
				console.log(message);
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'channels':  //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getChannels(yargs.peers, yargs.username, yargs.organization)
			.then((message) => {
				console.log(message);
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'ballet': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.createWallets(yargs.peers, yargs.chaincode, yargs.channel, yargs.amount, yargs.username, yargs.organization)
			.then(() => {
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'wallet': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.walletRegistration(yargs.peers, yargs.chaincode, yargs.channel, yargs.id, yargs.balance, yargs.username, yargs.organization)
			.then(() => {
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'gwallet': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getWallet(yargs.peers, yargs.chaincode, yargs.channel, yargs.id, yargs.username, yargs.organization)
			.then((result) => {
				let table = new Table({
                    head: ['Address', 'Balance']
                });
                    let tableLine = [];
                    tableLine.push(result.address);
                    tableLine.push(result.balance);
                    table.push(tableLine);
                console.log(table.toString());
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'rwallet': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getWalletByRange(yargs.peers, yargs.chaincode, yargs.channel, yargs.start, yargs.end, yargs.username, yargs.organization)
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
                console.log(table.toString());
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'history': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.getWalletHistory(yargs.peers, yargs.chaincode, yargs.channel, yargs.id, yargs.username, yargs.organization)
			.then((message) => {
				let table = new Table({
                    head: ['TxID', 'Address', 'Funds','Timestamp']
                });
                for (let i = 0; i < message.length ; i++) {
                    let tableLine = [];
                    tableLine.push(message[i].TxId);
                    tableLine.push(message[i].Value.address);
					tableLine.push(message[i].Value.balance);
					tableLine.push(message[i].Timestamp);
                    table.push(tableLine);
                }
                console.log(table.toString());
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'cannon': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.transactionCannon(yargs.peers, yargs.chaincode, yargs.channel, yargs.amount, yargs.username, yargs.organization)
			.then(() => {
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'transfer': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.transfer(yargs.peers, yargs.chaincode, yargs.channel, yargs.from, yargs.to, yargs.funds, yargs.username, yargs.organization)
			.then(() => {
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	case 'schedule': //Done
	console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		hyper.createSchedule(yargs.peers, yargs.chaincode, yargs.channel, yargs.amount, yargs.username, yargs.organization)
			.then((schedule) => {
				let table = new Table({
                    head: ['From', 'To', 'Funds']
                });
                let arrayLength = schedule.length;
                for (let i = 0; i < arrayLength; i++) {
                    let tableLine = [];
                    tableLine.push(schedule[i].from);
                    tableLine.push(schedule[i].to);
                    tableLine.push(schedule[i].funds);
                    table.push(tableLine);
                }
                console.log(table.toString());
				process.exit(0);
			})
			.catch(function (err) {
				console.log(err);
				process.exit(1);
			});
		break;

	default:
		console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
		process.exit(0);
		break;
}

function author() {
	clear();
	console.log(
		chalk.cyan(
			figlet.textSync('Lyra', {
				horizontalLayout: 'full',
				verticalLayout: 'default'
			})
		)
	);
	console.log(chalk.cyan.bold(jsond.version));
	console.log(chalk.bold.cyan('Aabo Technologies © 2017'));
	console.log(chalk.bold.blue("Server's division"));
	console.log("\n");
	console.log(chalk.bold.blue('Welcome to the transaction simulator'));
	console.log(chalk.bold.red('Made by:'));
	console.log(chalk.bold.green('--Andres Bustamante Diaz'));
	console.log(chalk.bold.yellow('--Enrique Navarro Torres-Arpi'));
	console.log(chalk.bold.magenta('--Fernando Martin Garcia Del Angel'));
	console.log(chalk.bold.bgBlack.white('--Hector Carlos Flores Reynoso'));
	console.log("\n");
}