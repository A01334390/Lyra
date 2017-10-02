#!/usr/bin/env node

var chalk = require('chalk');
var clear = require('clear');
var CLI = require('clui');
var figlet = require('figlet');
var inquirer = require('inquirer');
var Preferences = require('preferences');
var Spinner = CLI.Spinner;
var GitHubApi = require('github');
var _ = require('lodash');
var git = require('simple-git')();
var touch = require('touch');
var fs = require('fs');
var files = require('./lib/files');
var program = require('commander');
var cliSpinners = require('cli-spinners');
var ora = require('ora');
var md5 = require('md5');

//We will start the daemon here
helloWorld((err, success) => {
    if (err) {
        return console.log('App wont open. Check log');
    }
})

//Here it ends

///This is the main screen, shows the name of everyone involved in the project
function helloWorld() {
    clear();
    console.log(
        chalk.cyan(
            figlet.textSync('Luna', {
                font: 'isometric3',
                horizontalLayout: 'full',
                verticalLayout: 'default'
            })
        )
    );
    console.log(chalk.cyan.bold('0.2.3'));
    console.log(chalk.cyan.bold('Aabo Technologies'));

    console.log("\n");
    console.log(chalk.magenta.bold('Welcome to the SUPA DUPA FAST Blockchain Simulator'));
    console.log(chalk.magenta.bold('Made by:'));
    console.log(chalk.blue.bold('--Andres Bustamante Diaz'));
    console.log(chalk.blue.bold('--Enrique Navarro Torres-Arpi'));
    console.log(chalk.blue.bold('--Enrique Correa Herrerias'));
    console.log(chalk.blue.bold('--Hector Carlos Flores Reynoso'));
    console.log(chalk.blue.bold('--Fernando Martin Garcia Del Angel'));

    console.log("\n");
    getDo(function () {
        console.log(arguments);
    });
}

if (files.directoryExists('.git')) {
    console.log(chalk.red('Already a git repository!'));
    process.exit();
}

function getDo(callback) {
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

function blockchainNodes() {
    console.log(
        chalk.red(
            figlet.textSync('BC Nodes', {
                font: 'lean',
                horizontalLayout: 'default',
            })
        )
    );

    const spinner = ora({
        text: 'Checking all BC Nodes...',
        spinner: "dots12"
    }).start();

    setTimeout(() => {
        spinner.color = 'yellow';
        spinner.text = 'Pinging PC-01';

        setTimeout(() => {
            spinner.succeed('PC-01 up!');
            spinner.stop();

            const spinner1 = ora({
                text: 'Starting Ping Mechanism',
                spinner: "dots12"
            }).start();

            setTimeout(() => {
                spinner1.color = 'red';
                spinner1.text = 'Pinging PC-02';
            }, 2000);

            setTimeout(() => {
                spinner1.succeed('PC-02 up!');
                spinner1.stop();

                const spinner2 = ora({
                    text: 'Starting Ping Mechanism',
                    spinner: "dots12"
                }).start();

                setTimeout(() => {
                    spinner2.color = 'green';
                    spinner2.text = 'Pinging PC-03';
                }, 3000);

                setTimeout(() => {
                    spinner2.succeed('PC-03 up!');
                    spinner2.stop();

                    const spinner3 = ora({
                        text: 'Starting Ping Mechanism',
                        spinner: "dots12"
                    }).start();

                    setTimeout(() => {
                        spinner3.color = 'white';
                        spinner3.text = 'Pinging PC-04';
                    }, 4000);

                    setTimeout(() => {
                        spinner3.succeed('PC-04 up!');
                        spinner3.stop();
                        const spinner4 = ora({
                            text: 'Starting Ping Mechanism',
                            spinner: "dots12"
                        }).start();

                        setTimeout(() => {
                            spinner4.color = 'magenta';
                            spinner4.text = 'Pinging PC-05';
                        }, 5000);

                        setTimeout(() => {
                            spinner4.succeed('PC-05 up!');
                            spinner4.stop();
                            const spinner5 = ora({
                                text: 'Starting Ping Mechanism',
                                spinner: "dots12"
                            }).start();

                            setTimeout(() => {
                                spinner5.color = 'cyan';
                                spinner5.text = 'Networking everything';
                            }, 7000);

                            setTimeout(() => {
                                spinner5.succeed('All PCs are up!');
                                spinner5.stop();
                                getDo(function () {
                                    console.log(arguments);
                                });
                            }, 8000);
                        }, 5500);
                    }, 4500);
                }, 3500);
            }, 2500);
        }, 1500);
    }, 8500);
}

function ledgerSync(whereto) {
    console.log(
        chalk.cyan(
            figlet.textSync('Ledger Checker', {
                font: 'lean',
                horizontalLayout: 'default',
            })
        )
    );

    const spinner = ora({
        text: 'Checking all ledgers...',
        spinner: "noise"
    }).start();

    setTimeout(() => {
        spinner.color = 'yellow';
        spinner.text = 'Checking ledger 01';

        setTimeout(() => {
            spinner.succeed('Ledger 01 is OK!');
            spinner.stop();

            const spinner1 = ora({
                text: 'Starting LedCheck Algorithm',
                spinner: "noise"
            }).start();

            setTimeout(() => {
                spinner1.color = 'red';
                spinner1.text = 'Checking ledger 02';
            }, 2000);

            setTimeout(() => {
                spinner1.succeed('Ledger 02 is OK!');
                spinner1.stop();

                const spinner2 = ora({
                    text: 'Starting LedCheck Algorithm',
                    spinner: "noise"
                }).start();

                setTimeout(() => {
                    spinner2.color = 'green';
                    spinner2.text = 'Checking ledger 03';
                }, 3000);

                setTimeout(() => {
                    spinner2.succeed('Ledger 03 is OK!');
                    spinner2.stop();

                    const spinner3 = ora({
                        text: 'Starting LedCheck Algorithm',
                        spinner: "noise"
                    }).start();

                    setTimeout(() => {
                        spinner3.color = 'white';
                        spinner3.text = 'Checking ledger 04';
                    }, 4000);

                    setTimeout(() => {
                        spinner3.succeed('Ledger 04 is OK!');
                        spinner3.stop();
                        const spinner4 = ora({
                            text: 'Starting LedCheck Algorithm',
                            spinner: "noise"
                        }).start();

                        setTimeout(() => {
                            spinner4.color = 'magenta';
                            spinner4.text = 'Checking ledger 05';
                        }, 5000);

                        setTimeout(() => {
                            spinner4.succeed('Ledger 05 is OK!');
                            spinner4.stop();
                            const spinner5 = ora({
                                text: 'Starting LedCheck Algorithm',
                                spinner: "noise"
                            }).start();

                            setTimeout(() => {
                                spinner5.color = 'cyan';
                                spinner5.text = 'Syncing everything...';
                            }, 7000);

                            setTimeout(() => {
                                spinner5.succeed('All Ledgers are Synced!');
                                spinner5.stop();
                                if (whereto == 'home') {
                                    getDo(function () {
                                        console.log(arguments);
                                    });
                                } else {
                                    postGremlinMenu(function () {
                                        console.log(arguments);
                                    });
                                }

                            }, 8000);
                        }, 5500);
                    }, 4500);
                }, 3500);
            }, 2500);
        }, 1500);
    }, 8500);
}

function gremlinTestDaemon() {
    console.log(
        chalk.cyan(
            figlet.textSync('Gremlin Test', {
                font: 'epic',
                horizontalLayout: 'default',
            })
        )
    );

    gremlinInitialMenu(function () {
        console.log();
    });

}

function gremlinInitialMenu() {
    var questions = [{
            type: "input",
            name: "users",
            message: "How many users should we simulate?",
            default: 1000
        }, {
            type: "input",
            name: "transactions",
            message: "How many transactions should we simulate?",
            default: 1000
        }, {
            type: 'list',
            name: 'variability',
            message: "How much variability do you want in the system?",
            choices: [
                "0%",
                "10%",
                "20%",
                "30%",
                "40%",
                "50%",
                "60%",
                "70%",
                "80%",
                "90%",
            ],
            default: "0%"
        }, {
            type: 'input',
            name: 'time',
            message: "How long is the test gonna run? (Input in minutes)",
            default: 60
        }

    ];

    inquirer.prompt(questions).then(function (answers) {
        console.log('\n');
        wait(500);
        console.log(chalk.bgBlue('Preparing the God Algorithm...'));
        wait(500);
        console.log(chalk.bgRed('Preparing the Hopscotch Algorithm...'));
        wait(500);
        console.log(chalk.bgGreen('Preparing the Gremlin Algorithm...'));
        wait(500);
        console.log(chalk.bgYellow('Checking the ledger...'));
        clear();
        wait(2000);
        console.log(
            chalk.cyan(
                figlet.textSync('PREPARING', {
                    font: 'epic',
                    horizontalLayout: 'default',
                })
            )
        );

        console.log(
            chalk.cyan(
                figlet.textSync('FOR', {
                    font: 'epic',
                    horizontalLayout: 'default',
                })
            )
        );

        console.log(
            chalk.cyan(
                figlet.textSync('TAKEOFF', {
                    font: 'epic',
                    horizontalLayout: 'default',
                })
            )
        );
        wait(2000);
        console.log(
            chalk.yellow(
                figlet.textSync('READY?', {
                    font: 'epic',
                    horizontalLayout: 'default',
                })
            )
        );

        wait(2000);

        console.log(
            chalk.red(
                figlet.textSync('GO!', {
                    font: 'epic',
                    horizontalLayout: 'default',
                })
            )
        );

        wait(500);

        console.log('\n');

        for (i = 1; i <= answers.users; i++) {
            wait(5);
            console.log(chalk.bgBlue('User: ' + i + ' created!'));
        }
        clear();
        wait(2000);
        console.log(
            chalk.cyan(
                figlet.textSync('PREPARING', {
                    font: 'univers',
                    horizontalLayout: 'default',
                })
            )
        );

        console.log(
            chalk.cyan(
                figlet.textSync('TRANSACTION', {
                    font: 'univers',
                    horizontalLayout: 'default',
                })
            )
        );

        console.log(
            chalk.cyan(
                figlet.textSync('CANNON!', {
                    font: 'univers',
                    horizontalLayout: 'default',
                })
            )
        );
        wait(2000);
        console.log(
            chalk.yellow(
                figlet.textSync('STEADY?', {
                    font: 'univers',
                    horizontalLayout: 'default',
                })
            )
        );

        wait(2000);

        console.log(
            chalk.red(
                figlet.textSync('FIRE!', {
                    font: 'univers',
                    horizontalLayout: 'default',
                })
            )
        );

        wait(500);

        console.log('\n');

        for (i = 1; i <= answers.transactions; i++) {
            wait(10);
            console.log(chalk.bgMagenta('Transaction: ' + i + ' done!'));
        }


        clear();
        wait(2000);
        console.log(
            chalk.green(
                figlet.textSync('Post Gremlin', {
                    font: 'stop',
                    horizontalLayout: 'default',
                })
            )
        );
        postGremlinMenu(function () {
            console.log(arguments);
        });

    });
}

function postGremlinMenu() {

    var questions = [{
            type: "list",
            name: "post",
            message: "What should we do next?",
            choices: [
                new inquirer.Separator(),
                "Review All Transaction",
                "Check if ledger is (STILL) synchronized",
                "Review individual user accounts",
                new inquirer.Separator(),
                "Exit"
            ]
        }

    ];

    inquirer.prompt(questions).then(function (answers) {
        switch (answers.post) {
            case 'Review All Transaction':
                reviewIndivTransactions();
                break;

            case 'Check if ledger is (STILL) synchronized':
                ledgerSync('post');
                break;

            case 'Review individual user accounts':
                reviewUserAccount();
                break;
            case 'Exit':
                process.exit(1);
                break;

        }
    });
}

function reviewIndivTransactions() {
    console.log(
        chalk.cyan(
            figlet.textSync('List of Transactions', {
                font: 'lean',
                horizontalLayout: 'default',
            })
        )
    );

    console.log('\n');

    for(var i = 0;i<100;i++){
        console.log(chalk.red('Transaction :',(i+1),'from:',md5(i),'to:',md5(i*100),'for:',Math.random()*1000));
    }

    console.log('\n');

    postGremlinMenu((error,success)=>{
        if(error){
            return console.log('Fatal error, closing...');
        }
    });
}

function reviewUserAccount() {
    console.log(
        chalk.blue(
            figlet.textSync('User accounts involved', {
                font: 'chunky',
                horizontalLayout: 'default',
            })
        )
    );

    console.log('\n');
    
        for(var i = 0;i<100;i++){
            console.log(chalk.white('User :',(i+1),'Wallet address:',md5(i),'Ether:',Math.random()*1000));
        }
    
        console.log('\n');
    
        postGremlinMenu((error,success)=>{
            if(error){
                return console.log('Fatal error, closing...');
            }
        });

}

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}