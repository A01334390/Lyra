'use strict';

var fs = require('fs');
var path = require('path');

require('./config.js');
var hfc = require('fabric-client');

var helper = require('./app/helper.js');
var channels = require('./app/create-channel.js');
var join = require('./app/join-channel.js');
var install = require('./app/install-chaincode.js');
var instantiate = require('./app/instantiate-chaincode.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');

const hyper = require('./blockchainManager');

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
hyper.queryChaincode(peers,'halley','mychannel','getHistoryForWallet',"E",'luna','org1')
.then((message) => {
			console.log(message);
			process.exit(0);
		})
		.catch(function (err) {
			console.log(err);
			process.exit(1);
		});