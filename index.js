/*
/ ======== Index =========
/ This is the main file for the Lyra Project
/ As of now, it works with the latest version of Hyperledger
/ Made by Aabo Technologies © 2017 - Servers Division
/ Created > September 18th, 2017 @ 2:26 p.m. by A01334390
/ Last revised > October 21st, 2017 @ 7:20 p.m. by A01334390
/ ======== ======== ======== ========
*/

//CLI Elements and Libraries
var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var inquirer = require('inquirer');
var cliSpinners = require('cli-spinners');
var ora = require('ora');


//Hyperledger Fabric Code And Connectors
var hyper = require('./blockchainManager');



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

//Initializes the main menu
helloWorld((err, success) => {
    if (err) {
        return console.log('An error just happened, shutting down...');
    }
});

/*
/ ======== Hello World =========
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
    console.log(chalk.cyan.bold('0.0.1'));
    console.log(chalk.cyan.bold('Aabo Technologies'));

    console.log("\n");
    console.log(chalk.cyan.bold('Welcome to the fast Blockchain Simulator'));
    console.log(chalk.magenta.bold('Made by:'));
    console.log(chalk.green.bold('--Andres Bustamante Diaz'));
    console.log(chalk.white.bold('--Enrique Navarro Torres-Arpi'));
    console.log(chalk.magenta.bold('--Fernando Martin Garcia Del Angel'));
    console.log(chalk.blue.bold('--Hector Carlos Flores Reynoso'));

    console.log("\n");
    //Call to the main menu
    showMainMenu((err, success) => {
        if (err) {
            return console.log('Main menu had a problem,shutting down...');
        }
    });
}
//Main menu with the needed methods
function showMainMenu() {
    var questions = [{
        type: "list",
        name: "initial",
        message: "What should we do next?",
        choices: [
            new inquirer.Separator(),
            "Check the connection with Hyperledger",
            "Create a batch of Clients and Wallets",
            "Show current Assets on the Blockchain",
            "Show current Participants on the Blockchain",
            "Make a transaction",
            "Initiate Gremlin Test",
            new inquirer.Separator(),
            "Exit"
        ]
    }];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.initial) {
            case 'Check the connection with Hyperledger':
                hyper.checkConnection();
                setTimeout(() => {
                    showMainMenu((err, success) => {
                        if (err) {
                            console.log(chalk.red('An error occured, closing..'));
                            process.exit(1);
                        }
                    });
                }, 8000);
                break;
            case 'Create a batch of Clients and Wallets':
                batchCreation();
                
                break;

            case 'Initiate Gremlin Test':
                gremlinTestDaemon();
                break;

            case 'Show current Assets on the Blockchain':
                hyper.showCurrentAssets();
                setTimeout(() => {
                    showMainMenu((err, success) => {
                        if (err) {
                            console.log(chalk.red('An error occured, closing..'));
                            process.exit(1);
                        }
                    });
                }, 8000);
                break;

            case 'Show current Participants on the Blockchain':
                hyper.showCurrentParticipants();
                setTimeout(() => {
                    showMainMenu((err, success) => {
                        if (err) {
                            console.log(chalk.red('An error occured, closing..'));
                            process.exit(1);
                        }
                    });
                }, 6000);
            break;

            case 'Make a transaction':
                makeTransaction();
            break;

            case 'Exit':
                process.exit(0);
                break;
        }
    });
}

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
        //We first initiate the ora module
        const spinner = new ora({
            text: 'Initializing Clients and Wallets..',
            spinner: 'moon'
        });

        try {
            spinner.start();
                for(let i = 0; i < answers.clientNumber ; i++){
                    hyper.initializatorDaemon(i, (answers.clientNumber + i), answers.bottom, answers.top);
                }            
        } catch (err) {
            spinner.fail('Found a problem while creating...');
            console.log(err);
        }
        spinner.succeed('Clients and Wallets Created!');
        showMainMenu((err, success) => {
            if (err) {
                console.log(chalk.red('An error occured, closing..'));
                process.exit(1);
            }
        },8000);
    
    });
    
}

const makeTransaction = () => {
    var questions = [
        {
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
        hyper.makeTransaction(answers.from,answers.to,answers.funds);
        showMainMenu((err, success) => {
            if (err) {
                console.log(chalk.red('An error occured, closing..'));
                process.exit(1);
            }
        });
    });
}

const gremlinTestDaemon = () =>{
    console.log("I'm not built yet!")
}