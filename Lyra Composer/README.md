# Lyra Composer
A Tecnologico de Monterrey's POC Blockchain Project built for performance
## Getting Started
These instructions will help you get the project up and running on your local machine for development and testing purposes. See deployment notes on how to deploy the project on a live system. Bare in mind this project was made for Banco Banorte with the help of IBM and it's subject to the rules and rights they hold on the project. Through this project, the Lyra Business Network will be called LBM to be concise.
### Prerequisites
For testing purposes and [speed](https://www.ubuntu.com/server) considerations, it's expected that Lyra would be installed or launched from an Ubuntu Server environment. Although it's recommended, it's been shown that systems based on a Linux or Unix kernel with bash can run Hyperledger Fabric, Hyperledger Composer and the LBM.

If the OS you're using is not Ubuntu or you prefer to install components manually, you'll need

* A 64-bit Computer with at least 4GB of RAM and 25GB of free Hard Drive Space
* A Broadband Internet Connection
* Docker Engine: Version 17.03 or higher
* Docker-Compose: Version 1.8 or higher
* Node: 6.x (note versions 7 and higher are not supported)
* npm: v3.x or v5.x
* git: 2.9.x or higher
* Python: 2.7.x

It's not recommended to install Hyperledger Composer as a superuser - or use 'sudo' or the 'root' user, if on Linux as this may cause certain installation errors. It's therefore recommended to install Composer as a non-privileged user.

### Clean Install on Ubuntu (14.04 / 16.04 LTS) 
Lyra already comes with an installer to installed all required software to run Hyperledger Fabric and Composer. These can be invoked by following these instructions : 
##### Step 1 - Go to the /scripts folder
```
$ cd scripts
```
##### Step 2 - Give permissions to each installer file before executing
This script installs all prerequisites listed above
```
$ chmod u+x lyrainstaller-1.sh 
```
This script bootstraps the Hyperledger Fabric Network
```
$ chmod u+x lyrainstaller-1.sh 
```
##### Step 3 - Execute the first script
```
$ ./lyrainstaller-1.sh
```
Once executed, this file will prompt you to logout and login again; if possible, restart the system before moving to the next step
##### Step 4 - Execute the second script
Take into consideration that this file will download the Hyperledger Fabric dependencies and install them into Docker containers, therefore, it may take a few minutes or even an hour to completely install.
```
$ ./lyrainstaller-2.sh
```

### Known Issues
When launching either of both installer scripts, a message such as
```
$ bad interpreter: No such file or directory
```
may be displayed. If this happens, this can be solved by issuing the following statements : 
```
$ sed -i -e 's/\r$//' lyrainstaller-1.sh
```
And then : 
```
$ sed -i -e 's/\r$//' lyrainstaller-2.sh
```
## Deploying Lyra's business network
There's an already crafted script that automatically deploys the LBM into the test Hyperledger Fabric network we built on the previous step. To do this, issue the following command :
```
$ npm run-script deployNetwork
```
Once installed, the prompt will issue a success message to indicate the chaincode has been succesfully instantiated. To test this, issue the following command :
```
$ npm run-script pingNetwork
```
If the network has been succesfully deployed, it should display a success mesage. This means it's already possible to interact with the chaincode.
#### Known Issues
This process has been known to be problematic for begginers, if an issue arises the following list of steps might help : 
* Check if Docker is up and running
* Check if the hlfv1 profile exists (most issues that involve authentication are usually resolved by instantiating it)
* Re - run the deployNetwork command
* Restart the network

If after checking these steps the problem persists, please create an issue on this Github page to be solved ASAP and included into this readme.

## Starting up the Lyra Node Application
There's an included application to interact with Hyperledger and the ledger, this would allow you to :
* Show the list of assets on the LBM
* Show the list of participants on the LBM
* Initialize a list of assets and participants into the network and persist them into MongoDB.
* Create a transaction schedule
* Launch a bunch of transactions into the ledger 
* Show the performance achieved and amount of transactions per day possible.

### Getting the dependencies
To install all Node.js modules and dependencies, you'd need to issue the command as a 'sudo' or 'superuser' : 
```
$ sudo npm install
```
Once installed, you can get all available commands by issuing into the prompt :
```
$ node index --help
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/A01334390/Lyra/tags). 

## Authors

* **Andres Bustamante Diaz** - *Documentation and Network Consultant*
* **Enrique Navarro Torres-Arpi** - *Documentation and Programming Consultant*
* **Fernando Martin Garcia Del Angel** - *Programming and Documentation Consultant*
* **Hector Carlos Flores Reynoso** - *Network and Programming Consultant*

See also the list of [contributors](https://github.com/A01334390/Lyra/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks to Luis Brime who provided the documentation to bootstrap this project
* Thanks to all dogs and cats who couldn't play while the authors programmed
* Everyone involved on this project
