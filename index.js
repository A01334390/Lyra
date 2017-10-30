#!/usr/bin/env node

//CLI Elements and Libraries
var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var inquirer = require('inquirer');

//Hyperledger Fabric Code And Connectors
var hyper = require('./blockchainManager');
var jsond = require('./package');
var index = require('.');



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
    .command('cli', 'Start the CLI Lyra Application')
    .command('author', 'Show the projects authors')
    .command('assets', 'Lists all registered assets in the Blockchain')
    .command('participants', 'Lists all registered participants on the Blockchain')
    .command('initialize', 'Initializes the Participants and Wallets on the network', {
        amount: {
            description: 'Amount of clients and wallets to make',
            require: true,
            alias: 'a'
        },
        top: {
            description: 'Most amount of money a client can have',
            require: true,
            alias: 't'
        },
        bottom: {
            description: 'Least amount of money a client can have',
            require: true,
            alias: 'b'
        }
    })
    .command('cassets', 'Lists all current wallets on the Ledger')
    .command('passets', 'Lists all current participants on the Ledger')
    .command('transfer', 'Makes a single transaction over the network', {
        from: {
            description: "Address from a client who's sending money",
            require: true,
            alias: 'f'
        },
        to: {
            description: "Address from a client who's receiving money",
            require: true,
            alias: 't'
        },
        amount: {
            description: "Amount of money to be sent",
            require: true,
            alias: 'a'
        }
    })
    .help()
    .argv;

switch (yargs._[0]) {
    case 'cli':
        author();
        mainMenu();
        break;

    case 'author':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        helloWorld();
        break;

    case 'assets':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.registeredAssets()
            .then(() => {
                process.exit(0);
            })
            .catch(() => {
                process.exit(1);
            });
        break;

    case 'participants':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.registeredParticipants()
            .then(() => {
                process.exit(0);
            })
            .catch(() => {
                process.exit(1);
            });
        break;
    case 'initialize':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        for (let i = 0; i < yargs.amount; i++) {
            hyper.batchAccount(i, (i + yargs.amount), yargs.top, yargs.bottom)
                .then(() => {

                })
                .catch(function (error) {

                });
        }
        break;

    case 'cassets':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.assetsOnLedger()
            .then(() => {
                process.exit(0);
            })
            .catch(() => {
                process.exit(1);
            });
        break;

    case 'passets':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.participantsOnLedger()
            .then(() => {
                process.exit(0);
            })
            .catch(() => {
                process.exit(1);
            });
        break;

    case 'transfer':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.transfer(yargs.from, yargs.to, yargs.amount)
            .then(() => {
                process.exit(0);
            })
            .catch(() => {
                process.exit(1);
            })
        break;

    default:
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        console.log(chalk.bold.red('No commands were issued from the terminal. Please '));
        process.exit(0);
        break;
}

/**@description Shows current authors on the system */

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
    console.log(chalk.cyan.bold('Aabo Technologies © 2017'));
    /** Displays the characteristics of the Program */
    console.log("\n");
    console.log(chalk.cyan.bold('Welcome to the fast Blockchain Simulator'));
    /** Displays the authors of the Program */
    console.log(chalk.magenta.bold('Made by:'));
    console.log(chalk.green.bold('--Andres Bustamante Diaz'));
    console.log(chalk.white.bold('--Enrique Navarro Torres-Arpi'));
    console.log(chalk.magenta.bold('--Fernando Martin Garcia Del Angel'));
    console.log(chalk.blue.bold('--Hector Carlos Flores Reynoso'));
    console.log("\n");
}

/**@description Shows the menu with the main options */

function mainMenu() {
    /** Displays the main menu  */
    console.log(
        chalk.green(
            figlet.textSync('Main Menu', {
                horizontalLayout: 'full',
                verticalLayout: 'default'
            })
        )
    );
    var questions = [{
        type: "list",
        name: "initial",
        message: "Choose an Option from the main menu",
        choices: [
            new inquirer.Separator(),
            "Access Debug Menu",
            "Start the testing mode",
            new inquirer.Separator(),
            "Exit"
        ]
    }];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.initial) {
            case "Access Debug Menu":
                debugMenu();
                break;

            case "Start the testing mode":
                testingMenu();
                break;

            case "Exit":
                process.exit(0);
                break;
        }
    });
}

/**@description Shows the debug menu with the debug options */


function debugMenu() {
    console.log(
        chalk.yellow(
            figlet.textSync('Debug Menu', {
                horizontalLayout: 'full',
                verticalLayout: 'default'
            })
        )
    );
    var questions = [{
        type: "list",
        name: "initial",
        message: "Choose an option from the debug menu",
        choices: [
            new inquirer.Separator(),
            "Shows the project's authors",
            "Lists all registered assets in the Blockchain",
            "Lists all registered participants on the Blockchain",
            "Initializes the Participants and Wallets on the network",
            "Lists all current wallets on the Ledger",
            "Lists all current participants on the Ledger",
            "Makes a single transaction over the network",
            new inquirer.Separator(),
            "Go back to the main menu"
        ]
    }];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.initial) {
            case "Shows the project's authors":
                author();
                console.log('\n');
                debugMenu();
                break;
            case "Lists all registered assets in the Blockchain":
                hyper.registeredAssets()
                    .then(() => {
                        debugMenu();
                    })
                    .catch(() => {
                        process.exit(1);
                    });
                break;
            case "Lists all registered participants on the Blockchain":
                hyper.registeredParticipants()
                    .then(() => {
                        debugMenu();
                    })
                    .catch(() => {
                        process.exit(1);
                    });
                break;
            case "Initializes the Participants and Wallets on the network":
                batchCreation();
                break;
            case "Lists all current wallets on the Ledger":
                hyper.assetsOnLedger()
                    .then(() => {
                        debugMenu();
                    })
                    .catch(() => {
                        process.exit(1);
                    });
                break;
            case "Lists all current participants on the Ledger":
                hyper.participantsOnLedger()
                    .then(() => {
                        debugMenu();
                    })
                    .catch(() => {
                        process.exit(1);
                    });
                break;
            case "Go back to the main menu":
                clear();
                mainMenu();
                break;
        }
    });
}

/**@description Shows current testing options
 * @version 0
 */


function testingMenu() {
    clear();
    console.log(
        chalk.yellow(
            figlet.textSync('Testing Menu', {
                horizontalLayout: 'full',
                verticalLayout: 'default'
            })
        )
    );
    console.log(chalk.red('Not done yet...'));
    setTimeout(function () {
        clear();
        mainMenu();
    }, 3000);
}

/**@description Creates a batch amount of accounts and wallets on the system
 * @param {Nothing}
 */


function batchCreation() {
    var questions = [{
            type: 'input',
            name: 'clientNumber',
            message: 'How many users are we going to create?',
            default: 1,
        },
        {
            type: 'input',
            name: 'top',
            message: 'Which will be the top amount of balance the client will have?',
            default: 100000
        },
        {
            type: 'input',
            name: 'bottom',
            message: 'Which will be the bottom amount of balance the client will have?',
            default: 0
        }
    ];

    inquirer.prompt(questions).then(function (answers) {
        for (let i = 0; i < answers.clientNumber; i++) {
            hyper.batchAccount(i, (i + answers.clientNumber), answers.top, answers.bottom)
                .then(() => {

                })
                .catch(function (error) {

                });
        }
    });
}

/**@description Makes a bunch of transactions */


function makeTransaction() {
    var questions = [{
            type: 'input',
            name: "from",
            message: 'Which Address from?'
        },
        {
            type: 'input',
            name: 'to',
            message: 'Which Address to?'
        },
        {
            type: 'input',
            name: 'funds',
            message: 'How much?'
        }
    ];
    inquirer.prompt(questions).then(function (answers) {
        hyper.transfer(answers.from, answers.to, answers.funds)
            .then(() => {
                mainMenu();
            })
            .catch(function (error) {
                throw error;
            })
    });
}