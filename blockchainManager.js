'use strict';
/*
/ ======== Blockchain Manager =========
/ This file does all the Blockchain related actions for Lyra
/ As of now, it works with the latest version of Hyperledger
/ Made by Aabo Technologies © 2017 - Servers Division
/ Last revised > October 21st, 2017 @ 7:20 p.m. by A01334390
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
var config = require('config').get('lyra-cli');
var chalk = require('chalk');
var md5 = require('md5')

// ------- Hyperledger libraries for this package -------

// Require the client API
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

// these are the credentials to use to connect to the Hyperledger Fabric
let participantId = config.get('participantId');
let participantPwd = config.get('participantPwd');
// physical connection details (eg port numbers) are held in a profile
let connectionProfile = config.get('connectionProfile');

// the logical business newtork has an indentifier
let businessNetworkIdentifier = config.get('businessNetworkIdentifier');
// ... which allows us to get a connection to this business network
let businessNetworkConnection = new BusinessNetworkConnection();
// the network definition will be used later to create assets
let businessNetworkDefinition;

let assetRegistry;

/*
/ ========Check Connection Method =========
/ This method starts the connection with the chaincode and queries the registered models
/ It receives no parameters and returns no particular object
/ Useful to check if you're actually connected to the system
/ Bugs:: No >> Further Tests:: No particular behaviour for errors
/ ======== ======== ======== ========
*/
const checkConnection = () => {
    // create the connection
    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return businessNetworkConnection.getAllAssetRegistries();
        }).then((result) => {
            console.log('List of asset registries=');

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

            console.log(chalk.white(table.toString()));
            return businessNetworkConnection.disconnect();
        }).
    then(() => {
            console.log(chalk.blue(' ------ All done! ------'));
            console.log('\n');
        }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });

}

/*
/ ======== Initializator Daemon Method =========
/ This method creates a client and a wallet based on the received parameters
/ @param clientSeed is a Number that expects the seed for the client ID
/ @param walletSeed is a Number that expects the seed for the wallet ID
/ @param bottom is a Number that expects the lower bound for the wallet's random balance 
/ @param top is a Number that expects the top bound for the wallet's random balance 
/ Bugs:: Not tested  >> Further Tests:: No particular behaviour for errors
/ ======== ======== ======== ========
*/

const initializatorDaemon = (clientSeed, walletSeed, bottom, top) => {
    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return BusinessNetworkConnection.getAssetRegistry('org.aabo.Client');
        }).then((result) => {
            console.log(result);
            let factory = this.businessNetworkConnection.getFactory();
            var owner = factory.newResource('org.aabo.Wallet', 'Wallet', 'PID:1234567890');
            owner.id = md5(clientSeed);

            result.add(owner);

            return businessNetworkConnection.disconnect();
        }).
    then(() => {
            console.log(chalk.blue(' ------ All done! ------'));
            console.log('\n');
        }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });
}

const showCurrentAssets = () => {
    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            console.log('\n');
            console.log(chalk.green('Connected: BusinessNetworkDefinition obtained = ' + businessNetworkDefinition.getIdentifier()));
            return businessNetworkConnection.getAssetRegistry('org.aabo.Wallet');
        }).then((result) => {
            let table = new Table({
                head: ['ID', 'Balance', 'Owner']
            });
            let arrayLength = result.length;
            for (let i = 0; i < arrayLength; i++) {
                let tableLine = []
                tableLine.push(result[i].id);
                tableLine.push(result[i].balance);
                tableLine.push(result[i].owner.id);
                table.push(tableLine);
            }
            console.log(table.toString());
            return businessNetworkConnection.disconnect();
        }).
    then(() => {
            console.log(chalk.blue(' ------ All done! ------'));
            console.log('\n');
        }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });
}

const showCurrentParticipants = () => {
    businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
        .then((result) => {
            businessNetworkDefinition = result;
            return businessNetworkConnection.getParticipantRegistry('org.aabo.Client')
                .then((registry) => {
                    return registry.getAll();
                })
                .then((pResources) => {
                    let table = new Table({
                        head: ['ID']
                    });
                    let arrayLength = pResources.length;
                    for (let i = 0; i < arrayLength; i++) {
                        let tableLine = [];
                        tableLine.push(pResources[i].id);
                        table.push(tableLine);
                    }
                    console.log(table.toString());
                    return businessNetworkConnection.disconnect();
                })
        })
        .then(() => {
            console.log(chalk.blue(' ------ All done! ------'));
            console.log('\n');
        }) // and catch any exceptions that are triggered
        .catch(function (error) {
            throw error;
        });
}

module.exports = {
    checkConnection,
    initializatorDaemon,
    showCurrentAssets,
    showCurrentParticipants
}