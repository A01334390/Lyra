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
		name: {
			description: 'Name of the channel to create',
			require: true,
			alias: 'c'
		},
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
	.command('install', 'Install the chaincode over the network', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
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
	.command('cannon', 'Launch the transaction cannon', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
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
	.command('transfer', 'Make a single fund transfer', {
		// peers,'halley','mychannel','E','D','50','luna','org1'
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
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
			description: 'Address of the wallet to query',
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
	.command('schedule', 'Create a POC Schedule to test the algorithm', {
		peers: {
			description: 'Addresses of the peers to join this channel',
			require: true,
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
	.help()
	.argv;

//https://itunes.apple.com/mx/album/stay/1207481534?i=1207481546&l=en

switch (yargs._[0]) {
	case 'author':
		author();
		process.exit(0);
		break;
		console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
	case 'user':
		break;

	case 'channel':
		break;

	case 'join':
		break;

	case 'install':
		break;

	case 'instantiate':
		break;

	case 'block':
		break;

	case 'transaction':
		break;

	case 'hash':
		break;

	case 'chinfo':
		break;

	case 'instacodes':
		break;

	case 'channels':
		break;

	case 'ballet':
		break;

	case 'wallet':
		break;

	case 'gwallet':
		break;

	case 'rwallet':
		break;

	case 'history':
		break;

	case 'cannon':
		break;

	case 'transfer':
		break;

	case 'schedule':
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

//Enroll user

// hyper.enrollUser('luna', 'org1')
// 	.then((message) => {
// 		console.log(message);
// 		process.exit(0);
// 	})
// 	.catch(function (err) {
// 		console.log(err);
// 		process.exit(1);
// 	});

//CreateChannel

// hyper.createChannel('mychannel','../artifacts/channel/mychannel.tx','luna','org1')
// 	.then((message) => {
// 		console.log(message);
// 		process.exit(0);
// 	})
// 	.catch(function (err) {
// 		console.log(err);
// 		process.exit(1);
// 	});

//Join Channel Request

// var peers = [];
// peers.push('peer1');
// peers.push('peer2');
// hyper.joinChannel('mychannel',peers,'luna','org1')
// 	.then((message) => {
// 		console.log(message);
// 		process.exit(0);
// 	})
// 	.catch(function (err) {
// 		console.log(err);
// 		process.exit(1);
// 	});

//Install chaincode

var peers = [];
peers.push('peer1');
peers.push('peer2');

// hyper.installChaincode(peers,'halley','github.com/halley/','v1','luna','org1')
// 	.then((message) => {
// 		console.log(message);
// 		process.exit(0);
// 	})
// 	.catch(function (err) {
// 		console.log(err);
// 		process.exit(1);
// 	});

// Instantiate chaincode

// hyper.instantiateChaincode('mychannel','halley','v1','Invoke',"\"args\":[\"\"]",'luna','org1')
// 	.then((message) => {
// 		console.log(message);
// 		process.exit(0);
// 	})
// 	.catch(function (err) {
// 		console.log(err);
// 		process.exit(1);
// 	});

//Invoke request
var req = [];
req.push('D');
req.push('E');
req.push('50');
// hyper.invokeTransactions(peers,'halley','mychannel','transferFunds',req,'luna','org1')
// 	.then((message) => {
// 		console.log(message);
// 		process.exit(0);
// 	})
// 	.catch(function (err) {
// 		console.log(err);
// 		process.exit(1);
// 	});

//Query request
// hyper.queryChaincode(peers,'halley','mychannel','getHistoryForWallet',"E",'luna','org1')
// .then((message) => {
// 			console.log(message);
// 			process.exit(0);
// 		})
// 		.catch(function (err) {
// 			console.log(err);
// 			process.exit(1);
// 		});

//Make Transfer
// hyper.transfer(peers,'halley','mychannel','E','D','50','luna','org1')
// .then((message) => {
// 			console.log(message);
// 			process.exit(0);
// 		})
// 		.catch(function (err) {
// 			console.log(err);
// 			process.exit(1);
// 		});

//Get Wallets
// hyper.getWalletByRange(peers,'halley','mychannel','','','luna','org1')
// .then((message) => {
// 			console.log(message);
// 			process.exit(0);
// 		})
// 		.catch(function (err) {
// 			console.log(err);
// 			process.exit(1);
// 		});

// hyper.getWallet(peers,'halley','mychannel','D','luna','org1')
// .then((message) => {
// 			console.log(message);
// 			process.exit(0);
// 		})
// 		.catch(function (err) {
// 			console.log(err);
// 			process.exit(1);
// 		});

//Make lots of wallets
// hyper.createWallets(peers,'halley','mychannel',100,'luna','org1')
// .then((message) => {
// 			console.log(message);
// 			process.exit(0);
// 		})
// 		.catch(function (err) {
// 			console.log(err);
// 			process.exit(1);
// 		});

// hyper.createSchedule(peers,'halley','mychannel',5,'luna','org1')
// .then((message) => {
// 			console.log(message);
// 			process.exit(0);
// 		})
// 		.catch(function (err) {
// 			console.log(err);
// 			process.exit(1);
// 		});