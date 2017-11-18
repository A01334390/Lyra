// ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗ 
// ████╗ ████║██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗
// ██╔████╔██║██║   ██║██╔██╗ ██║██║  ███╗██║   ██║
// ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║   ██║
// ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝
// ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ 

// ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗ 
// ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗
// ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝
// ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗
// ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║
// ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚═ ═════╝╚═╝  ╚═╝

/** Dependencies needed */
const mongoose = require('mongoose');
const {
    MongoClient,
    ObjectID
} = require('mongodb');
var config = require('./config.json');
const chalk = require('chalk');
/** Get data from the configuration files */
let connectionURI = config.mongoConnection.mongoURI;
/** Get the Schemas */
var {
    Transaction
} = require('./Schemas/transaction');
var {
    Wallet
} = require('./Schemas/wallet');

//Start the connection to Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(connectionURI, {
    useMongoClient: true
});

class MongoManager {

    /**
     * @description Persists a transaction into MongoDB
     * @param {JSON} a JSON Document with transaction information
     * @return {Promise} whose fulfillment means the transaction has been saved
     */
    saveTransaction(jsonDoc) {
        const METHOD = 'saveTransaction';
        var tx = new Transaction({
            from: jsonDoc.from,
            to: jsonDoc.to,
            funds: jsonDoc.funds
        });

        return tx.save()
            .then(() => {
                return true;
            })
            .catch(function (err) {
                console.log('An error occured: ', chalk.bold.red(err));
            });
    }

    /**
     * @description Persists an asset into MongoDB
     * @param {JSON} a JSON Document with asset information
     * @param {String} an md5 address of the owner
     * @return {Promise} whose fulfillment means the asset has been saved
     */

    saveAsset(jsonDoc) {
        const METHOD = 'saveAsset';
        var wallet = new Wallet({
            id: jsonDoc[0],
            balance: jsonDoc[1]
        });

        return wallet.save()
            .then(() => {
                return true;
            })
            .catch(function () {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Queries all transactions persisted on MongoDB
     * @return {JSON} a file with all transactions persisted on mongoDB
     */

    getAllTransactions() {
        const METHOD = 'getAllTransactions';
        return Transaction.find({})
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Queries all Assets persisted on MongoDB
     * @return {JSON} a file with all assets persisted on mongoDB
     */

    getAllAssets() {
        return Wallet.find({})
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Queries one asset persisted on MongoDB
     * @param {String} Id of the wallet on MongoDB
     * @return {JSON} a file with one asset persisted on mongoDB
     */

    getOneAsset(identifier) {
        return Wallet.findOne({
                id: identifier
            })
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Queries all assets on MongoDB
     * @return {JSON} a file with all asset's id persisted on mongoDB
     */

    getAllAssetsID() {
        return Wallet.find({}, 'id -_id')
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Executes the Save Transaction Command
     * @returns {Promise} whose fullfilment means the transaction has been persisted
     */

    static saveTx(jsonDoc) {
        let mong = new MongoManager();
        return mong.saveTransaction(jsonDoc);
    }

    /**
     * @description Executes the Save Asset Command
     * @returns {Promise} whose fullfilment means the asset has been persisted
     */

    static saveAst(jsonDoc, idOwner) {
        let mong = new MongoManager();
        return mong.saveAsset(jsonDoc, idOwner);
    }

    /**
     * @description Executes the Get All Transaction command
     * @returns {Promise} whose fullfilment means all transactions have been retrieved
     */

    static getAllTx() {
        let mong = new MongoManager();
        return mong.getAllTransactions()
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Executes the Get All Assets command
     * @returns {Promise} whose fullfilment means all assets have been retrieved
     */

    static getAllAst() {
        let mong = new MongoManager();
        return mong.getAllAssets()
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Executes the Get One Asset command
     * @param {String} that identifies the asset on the Database 
     * @returns {Promise} whose fullfilment means either the asset was retrieved or none existed
     */

    static getOneAst(identifier) {
        let mong = new MongoManager();
        return mong.getOneAsset(identifier)
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Executes the All Asset's id command
     * @returns {Promise} whose fullfilment means either all assets were retrieved or none existed
     */

    static getAllAstID() {
        let mong = new MongoManager();
        return mong.getAllAssetsID()
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Removes all Wallets
     * @returns {Promise} whose fullfilment means all assets were deleted
     */

    static removeAllAssets() {
        return Wallet.remove({})
            .then(() => {
                console.log(('All Wallets have been removed'));
            })
            .catch(function () {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**
     * @description Removes all Transactions
     * @returns {Promise} whose fullfilment means all Transactions were deleted
     */

    static removeAllTransactions() {
        return Transaction.remove({})
            .then(() => {
                console.log(('All Transactions have been removed'));
            })
            .catch(function () {
                console.log('An error occured: ', chalk.bold.red(error));
            })
    }

}

module.exports = MongoManager;