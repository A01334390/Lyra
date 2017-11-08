#!/usr/bin/env node

//CLI Elements and Libraries
var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var inquirer = require('inquirer');
var Table = require('cli-table');
var colors = require('colors');

//Hyperledger Fabric Code And Connectors
var hyper = require('./Hyperledger-Helpers/blockchainManager');
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
    .command('cannon', 'Starts the transaction cannon', {
        top: {
            description: 'Top wallet address to launch the cannon',
            require: true,
            alias: 't'
        }
    })
    .command('schedule', 'Creates a sample schedule', {
        top: {
            description: 'Top wallet address to create the schedule',
            require: true,
            alias: 't'
        }
    })
    .command('ballet', 'Creates a batch of wallets on the ledger', {
        amount: {
            description: 'Amount of wallets to be created',
            require: true,
            alias: 'a'
        }
    })
    .command('singwall', 'Retrieves the information of a wallet', {
        id: {
            description: 'ID of the wallet to retrieve',
            require: true,
            alias: 'i'
        }
    })
    .command('wallrange', 'Retrieves wallets on a range', {
        start: {
            description: 'The leftmost or smallest wallet on the ledger',
            require: true,
            default: '0',
            alias: 's'
        },
        end: {
            description: 'The rightmost or biggest wallet on the ledger',
            require: true,
            alias: 'e'
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
        author();
        process.exit(0);
        break;

    case 'cannon':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.transactionCannon(yargs.top)
            .then(() => {
                process.exit(0);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
        break;

    case 'schedule':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.getTransactionSchedule(yargs.top)
            .then((schedule) => {
                let table = new Table({
                    head: ['From', 'To', 'Funds']
                });
                let arrayLength = result.length;
                for (let i = 0; i < arrayLength; i++) {
                    let tableLine = [];
                    tableLine.push(schedule[i].from);
                    tableLine.push(schedule[i].to);
                    tableLine.push(schedule[i].funds);
                    table.push(tableLine);
                }
                console.log(table);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
        break;

    case 'ballet':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.createWallets(yargs.amount)
            .then(() => {
                process.exit(0);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
        break;

    case 'singwall':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.getWallet(yargs.id)
            .then((wallet) => {
                console.log(wallet);
                process.exit(0);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
        break;

    case 'wallrange':
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        hyper.getWalletByRange(yargs.start, yargs.end)
            .then((wallets) => {
                console.log(wallets);
                process.exit(0);
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
        break;

    default:
        console.log(chalk.bold.cyan('Lyra CLI App'), chalk.bold.green('Made by Aabo Technologies © 2017'));
        console.log(chalk.bold.red('No commands were issued from the terminal. Please launch it again with --help'));
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
    console.log('Aabo Technologies © 2017'.cyan.bold);
    console.log("Server's division".cyan.bold)
    console.log("\n");
    console.log("Welcome to the".red.bold, "fast".rainbow, "transaction simulator".bold.red) // /** Displays the authors of the Program */
    console.log(('Made by:').red.bold);
    console.log(('--Andres Bustamante Diaz').zebra);
    console.log(('--Enrique Navarro Torres-Arpi').america);
    console.log(('--Fernando Martin Garcia Del Angel'.rainbow));
    console.log(('--Hector Carlos Flores Reynoso').random);
    console.log("\n");
}

/**@description Shows the menu with the main options 
 * @returns {Nothing}
 */

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

/**@description Shows the debug menu with the debug options
 * @returns {Nothing}
 */


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
            "Create a schedule for the transactions",
            "Lists wallets on a range",
            "Register a single wallet over the network",
            "Make a single transaction over the network",
            new inquirer.Separator(),
            "Go back to the main menu"
        ]
    }];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.initial) {
            case "Create a schedule for the transactions":
                makeSchedule();
                break;
            case "Shows the project's authors":
                author();
                console.log('\n');
                debugMenu();
                break;
            case "Lists wallets on a range":
                var questions = [{
                    type: "input",
                    name: "start",
                    message: "Which is the lefftmost or smallest wallet to retrieve?"
                }, {
                    type: "input",
                    name: "end",
                    message: "Which is the rightmost or biggest wallet to retrieve?"
                }];
                inquirer.prompt(questions).then(function (answers) {
                    hyper.getWalletByRange(answers.start, answers.end)
                        .then((wallets) => {
                            console.log(wallets);
                            debugMenu();
                        })
                        .catch(function (err) {
                            console.log('An error occured: ', chalk.bold.red(error));
                            process.exit(1);
                        });
                })
                break;

            case "Register a single wallet over the network":
                var questions = [{
                    type: "input",
                    name: "id",
                    message : "Input a wallet address"
                },{
                    type: "input",
                    name: "balance",
                    message: "Input the initial balance"
                }];
            inquirer.prompt(questions).then(function(answers){
                hyper.walletRegistration(answers.id,answers.balance)
                .then(()=>{
                    debugMenu();
                })
                .catch(function(err){
                    console.log('An error occured: ', chalk.bold.red(err));
                });
            });
            break;
            case "Make a single transaction over the network":
                var questions = [{
                    type: "input",
                    name: "from",
                    message: "Input the wallet address to send balance from"
                }, {
                    type: "input",
                    name: 'to',
                    message: "Input the wallet address to receive balance"
                }, {
                    type: 'input',
                    name: 'money',
                    message: 'Input the amount of money to send'
                }];

                inquirer.prompt(questions).then(function (answers) {
                    hyper.transfer(answers.from, answers.to, answers.money)
                        .then(() => {
                            debugMenu();
                        })
                        .catch(function (error) {
                            console.log('An error occured: ', chalk.bold.red(error));
                            process.exit(1);
                        });
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
 * @version 1.0
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

    var questions = [{
        type: "list",
        name: "initial",
        message: "Choose an option from the debug menu",
        choices: [
            new inquirer.Separator(),
            "Create batch accounts",
            "Start the transaction cannon",
            new inquirer.Separator(),
            "Go back to the main menu"
        ]
    }];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.initial) {
            case 'Create batch accounts':
                batchCreation('test');
                break;

            case 'Start the transaction cannon':
                startTheCannon();
                break;

            case 'Go back to the main menu':
                clear();
                mainMenu();
                break;
        }
    });
}
/**
 * @description Makes a Sample schedule for testing purposes
 * @returns {Table} table including the transactions made by the schedule
 */

function makeSchedule() {
    var questions = [{
        type: 'input',
        name: 'top',
        message: 'Top wallet to be chosen for the schedule',
    }];
    inquirer.prompt(questions).then(function (answers) {
        hyper.createSchedule(answers.transactions)
            .then((result) => {
                let table = new Table({
                    head: ['From', 'To', 'Funds']
                });
                for (const key of Object.keys(result)) {
                    let tableLine = [];
                    tableLine.push(result[key].from);
                    tableLine.push(result[key].to);
                    tableLine.push(result[key].funds);
                    table.push(tableLine);
                }
                console.log(table.toString());
            })
            .then(() => {
                debugMenu();
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
                process.exit(1);
            });
    });
}

/**@description Starts the Transaction Cannon execution
 * @returns {Nothing}
 */

function startTheCannon() {
    var questions = [{
        type: 'input',
        name: 'top',
        message: 'Top wallet to be chosen for the schedule',
        default: 1,
    }];
    inquirer.prompt(questions).then(function (answers) {
        hyper.transactionCannon(answers.top)
            .then(() => {
                testingMenu();
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
                process.exit(1);
            });
    });
}

/**@description Creates a batch amount of accounts and wallets on the system
 * @param {String} whereto is where it will go after executing
 * @returns {Nothing}
 */

function batchCreation(whereTo) {
    var questions = [{
        type: 'input',
        name: 'clientNumber',
        message: 'How many users are we going to create?',
        default: 1,
    }];

    inquirer.prompt(questions).then(function (answers) {
        hyper.createWallets(answers.clientNumber)
            .then(() => {
                if ('debug') {
                    debugMenu();
                } else {
                    testingMenu();
                }
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
                process.exit(1);
            });
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
                debugMenu();
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
                process.exit(1);
            });
    });
}