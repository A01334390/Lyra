/*
/ ======== Index =========
/ This is the main file for the Lyra Project
/ As of now, it works with the latest version of Hyperledger
/ Made by Aabo Technologies © 2017 - Servers Division
/ Created > September 18th, 2017 @ 2:26 p.m. by A01334390
/ Last revised > October 25th, 2017 @ 1:30 p.m. by a01334390
/ ======== ======== ======== ========
*/

//CLI Elements and Libraries
var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var inquirer = require('inquirer');
var yargs = require('yargs');
var _ = require('lodash');

//Hyperledger Fabric Code And Connectors
var hyper = require('./blockchainManager');
var pjson = require('./package.json');




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

//Execution Command Line Arguments
const argv = yargs
.command('cli','Start Lyra as a CLI App',)
.command('author',"Show Lyra's main programmers")
.command('batch','Creates Clients and Wallets in Batch')
.command('fast','Creates a batch transaction process',{
    txnumber : {
        describe: 'Number of transactions to make',
        demand: true,
        alias:'t'
    }
})
.command('models','Shows registered models on the network')
.command('wallets','Shows current wallets on the network')
.command('clients','Shows current clients on the network')
.help()
.argv;


switch(argv._[0]){
    case 'cli':
    helloWorld();
    showMainMenu();
    break;

    case 'author':
    helloWorld();
    process.exit(0);
    break;

    case 'batch':
    console.log(chalk.cyan('Lyra v'+pjson.version),chalk.blue('made by Aabo Technologies © 2017'));
    break;

    case 'fast':
    console.log(chalk.cyan('Lyra v'+pjson.version),chalk.blue('made by Aabo Technologies © 2017'));
    superTransactionProcessor().then(()=>{
    });
    break;

    case 'models':
    console.log(chalk.cyan('Lyra v'+pjson.version),chalk.blue('made by Aabo Technologies © 2017'));
    hyper.checkRegisteredModels().then(()=>{
    });
    break;

    case 'wallets':
    console.log(chalk.cyan('Lyra v'+pjson.version),chalk.blue('made by Aabo Technologies © 2017'));
    hyper.showCurrentAssets().then(()=>{
    });
    break;

    case 'clients':
    console.log(chalk.cyan('Lyra v'+pjson.version),chalk.blue('made by Aabo Technologies © 2017'));
    hyper.showCurrentParticipants().then(()=>{
    });
    break;

    default:
    console.log(chalk.red('Command not Recognized, if you need help type --help'));
    process.exit(0);
    break;
}


/*
/ ======== Hello World! =========
/ This method shows the main menu
/ It doesn't receive any parameters and doesn't return any particular ones
/ Bugs:: No >> Further Tests:: Any time a new option is added
/ ======== ======== ======== ========
*/

function helloWorld() {
    clear();
    console.log(
        chalk.cyan(
            figlet.textSync('Lyra', {
                horizontalLayout: 'full',
                verticalLayout: 'default'
            })
        )
    );
    console.log(chalk.cyan.bold(pjson.version));
    console.log(chalk.cyan.bold('Aabo Technologies © 2017'));

    console.log("\n");
    console.log(chalk.cyan.bold('Welcome to the fast Blockchain Simulator'));
    console.log(chalk.magenta.bold('Made by:'));
    console.log(chalk.green.bold('--Andres Bustamante Diaz'));
    console.log(chalk.white.bold('--Enrique Navarro Torres-Arpi'));
    console.log(chalk.magenta.bold('--Fernando Martin Garcia Del Angel'));
    console.log(chalk.blue.bold('--Hector Carlos Flores Reynoso'));

    console.log("\n");
}
/*
/ ======== Main Menu =========
/ This method shows the main options for the program
/ It doesn't receive any parameters and doesn't return any particular ones
/ Bugs:: No >> Further Tests:: Once new options are added
/ ======== ======== ======== ========
*/

function showMainMenu() {
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

/*
/ ======== Debug Menu =========
/ This method is used to test new functionality being added
/ It doesn't receive any parameters and doesn't return any particular ones
/ Bugs:: No >> Further Tests:: Once new options are added
/ ======== ======== ======== ========
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
            "Check Registered Models on Hyperledger",
            "Check current Wallets on the system",
            "Check current Clients on the system",
            "Create Wallets and Participants",
            "Make one transaction",
            "Make Batch Transactions",
            new inquirer.Separator(),
            "Go back to the main menu"
        ]
    }];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.initial) {
            case "Check Registered Models on Hyperledger":
                hyper.checkRegisteredModels();
                setTimeout(function () {
                    debugMenu();
                }, 4000);
                break;

            case "Check current Wallets on the system":
                hyper.showCurrentAssets();
                setTimeout(function () {
                    debugMenu();
                }, 4000);
                break;

            case "Check current Clients on the system":
                hyper.showCurrentParticipants();
                setTimeout(function () {
                    debugMenu();
                }, 4000);
                break;

            case "Create Wallets and Participants":
                batchCreation();
                break;

            case "Make one transaction":
                makeTransaction();
                break;

            case "Go back to the main menu":
                clear();
                showMainMenu();
                break;

            case "Make Batch Transactions":
                /** Make the questions */
                var q = [{
                    type: "input",
                    name: "transactionNumber",
                    message: "How Many Transactions would you like?",
                }];
                /** Send it! */
                inquirer.prompt(q)
                    .then(function (an) {
                        superTransactionProcessor(an.transactionNumber).then({

                        });
                    });
                break;
        }
    });
}

async function superTransactionProcessor(maxNumber) {
    return await hyper.superTransactionEngine(maxNumber).then((result) => {
        
    });
}

/*
/ ======== Testing Menu =========
/ This would be the main testing engine, will be programmed once everything's being maxed out
/ It doesn't receive any parameters and doesn't return any particular ones
/ Bugs:: No >> Further Tests:: Needs to be programmed
/ ======== ======== ======== ========
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
        debugMenu();
    }, 3000);
}

/*
/ ======== Batch Creation =========
/ This method creates multiple wallets and participants at the same time
/ It doesn't receive any parameters and doesn't return any particular ones
/ Bugs:: No >> Further Tests:: It needs to be optimized
/ ======== ======== ======== ========
*/

const batchCreation = () => {
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
        try {
            for (let i = 0; i < answers.clientNumber; i++) {
                hyper.initializatorDaemon(i, (answers.clientNumber + i), answers.bottom, answers.top);
            }

            setTimeout(function () {
                debugMenu();
            }, 100 * answers.clientNumber);

        } catch (err) {
            console.log(err);
        }
    });

}

/*
/ ======== Make Transaction =========
/ This method makes a Transfer transaction between two peers
/ It doesn't receive any parameters and doesn't return any particular ones
/ Bugs:: No >> Further Tests:: It needs to be optimized heavily
/ ======== ======== ======== ========
*/
const makeTransaction = () => {
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
        hyper.makeTransaction(answers.from, answers.to, answers.funds);
    });
    setTimeout(function () {
        debugMenu();
    }, 5000);
}