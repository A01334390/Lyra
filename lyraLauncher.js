//CLI Elements and Libraries
var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var inquirer = require('inquirer');
var cliSpinners = require('cli-spinners');
var ora = require('ora');

//Inside classes of Halley
const superman = require('./SuperManager');

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

// We start the daemon here
helloWorld((err,success)=>{
    if(err){
        return console.log('An error just happened, shutting down...');
    }
});

// This Displays information about the app. 
function helloWorld(){
    clear();
    console.log(
        chalk.cyan(
            figlet.textSync('Lyra', {
                font: 'isometric3',
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
    console.log(chalk.blue.bold('--Hector Carlos Flores Reynoso'));
    console.log(chalk.magenta.bold('--Fernando Martin Garcia Del Angel'));

    console.log("\n");
    //Call to the main menu
    showMainMenu((err,success)=>{
        if(err){
            return console.log('Main menu had a problem,shutting down...');
        }
    });
}
//Main menu with the needed methods
function showMainMenu(){
    var questions = [{
        type: "list",
        name: "initial",
        message: "What should we do next?",
        choices: [
            new inquirer.Separator(),
            "Check if all Blockchain Nodes are Up",
            "Check if ledger is synchronized",
            "Initiate Gremlin Test",
            new inquirer.Separator(),
            "Exit"
        ]
    }];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.initial) {
            case 'Check if all Blockchain Nodes are Up':
                blockchainNodes();
                break;

            case 'Check if ledger is synchronized':
                ledgerSync('home');
                break;

            case 'Initiate Gremlin Test':
                gremlinTestDaemon();
                break;
            case 'Exit':
                process.exit(1);
                break;
        }
    });
}