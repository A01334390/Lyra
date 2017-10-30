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
var config = require('config').get('mongo-connection');

/** Get data from the configuration files */
let connectionURI = config.get('mongoURI');
let databaseName = config.get('mongoDatabase');

/** Get the data models */
var {
    Participant
} = require('./mongoModels/participant');
var {
    Transaction
} = require('./mongoModels/transaction');
var {
    Wallet
} = require('./mongoModels/wallet');

//Start the connection to Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Lyra', {
    useMongoClient: true
});

class MongoManager {
    /**@description Persists a transaction into MongoDB
     * @param {JSON} a JSON Document with transaction information
     * @return {Promise} whose fulfillment means the transaction has been saved
     */
    saveTransaction(jsonDoc) {
        const METHOD = 'saveTransaction';
        var tx = new Transaction({
            amount: jsonDoc.amount,
            from: {
                id: jsonDoc.from.id,
                balance: jsonDoc.from.balance,
                owner: jsonDoc.from.owner
            },
            to: {
                id: jsonDoc.to.id,
                balance: jsonDoc.to.balance,
                owner: jsonDoc.to.owner
            }
        });

        return tx.save()
            .then(() => {
                return true;
            })
            .catch(function () {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@description Persists a participant into MongoDB
     * @param {JSON} a JSON Document with participant information
     * @return {Promise} whose fulfillment means the participant has been saved
     */

    saveParticipant(jsonDoc) {
        const METHOD = 'saveParticipant';
        var ptc = new Participant({
            id: jsonDoc.id
        });

        return ptc.save()
            .then(() => {
                return true;
            })
            .catch(function () {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@description Persists an asset into MongoDB
     * @param {JSON} a JSON Document with asset information
     * @param {String} an md5 address of the owner
     * @return {Promise} whose fulfillment means the asset has been saved
     */

    saveAsset(jsonDoc, idOwner) {
        const METHOD = 'saveAsset';
        console.log(jsonDoc);
        var wallet = new Wallet({
            id: jsonDoc.id,
            balance: jsonDoc.balance,
            ownerID: idOwner
        });

        return wallet.save()
            .then(() => {
                return true;
            })
            .catch(function () {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@description Queries all transactions persisted on MongoDB
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

    /**@description Queries all participants persisted on MongoDB
     * @return {JSON} a file with all participants persisted on mongoDB
     */

    getAllParticipants() {
        return Participant.find({})
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@description Queries all Assets persisted on MongoDB
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

    /**@description Queries one asset persisted on MongoDB
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

    /**@description Queries one participant persisted on MongoDB
     * @param {String} Id of the participant on MongoDB
     * @return {JSON} a file with one participant persisted on mongoDB
     */

    getOneParticipant(identifier) {
       return Participant.findOne({
                id: identifier
            })
            .then((result) => {
                return result;
            })
            .catch(function (error) {
                console.log('An error occured: ', chalk.bold.red(error));
            });
    }

    /**@description Queries all assets on MongoDB
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

    /**@description Executes the Save Transaction Command
     * @returns {Promise} whose fullfilment means the transaction has been persisted
     */

    static saveTx(jsonDoc) {
        let mong = new MongoManager();
        return mong.saveTransaction(jsonDoc);
    }

    /**@description Executes the Save Participant Command
     * @returns {Promise} whose fullfilment means the participant has been persisted
     */

    static savePnt(jsonDoc) {
        let mong = new MongoManager();
        return mong.saveParticipant(jsonDoc);
    }

    /**@description Executes the Save Asset Command
     * @returns {Promise} whose fullfilment means the asset has been persisted
     */

    static saveAst(jsonDoc, idOwner) {
        let mong = new MongoManager();
        return mong.saveAsset(jsonDoc,idOwner);
    }

    /**@description Executes the Get All Transaction command
     * @returns {Promise} whose fullfilment means all transactions have been retrieved
     */

    static getAllTx() {
        let mong = new MongoManager();
        return mong.getAllTransactions()
        .then((result)=>{
            return result;
        })
        .catch(function(error){
            console.log('An error occured: ', chalk.bold.red(error));
        });
    }

    /**@description Executes the Get All Participants command
     * @returns {Promise} whose fullfilment means all participants have been retrieved
     */

    static getAllPnt() {
        let mong = new MongoManager();
        return mong.getAllParticipants()
        .then((result)=>{
            return result;
        })
        .catch(function(error){
            console.log('An error occured: ', chalk.bold.red(error));
        });
    }

    /**@description Executes the Get All Assets command
     * @returns {Promise} whose fullfilment means all assets have been retrieved
     */

    static getAllAst() {
        let mong = new MongoManager();
        return mong.getAllAssets()
        .then((result)=>{
            return result;
        })
        .catch(function(error){
            console.log('An error occured: ', chalk.bold.red(error));
        });
    }

    /**@description Executes the Get One Asset command
     * @param {String} that identifies the asset on the Database 
     * @returns {Promise} whose fullfilment means either the asset was retrieved or none existed
     */

    static getOneAst(identifier) {
        let mong = new MongoManager();
        return mong.getOneAsset(identifier)
        .then((result)=>{
            return result;
        })
        .catch(function(error){
            console.log('An error occured: ', chalk.bold.red(error));
        });
    }

    /**@description Executes the Get One Participant command
     * @param {String} that identifies the participant on the Database 
     * @returns {Promise} whose fullfilment means either the participant was retrieved or none existed
     */

    static getOnePnt(identifier) {
        let mong = new MongoManager();
        return mong.getOneParticipant(identifier)
        .then((result)=>{
            return result;
        })
        .catch(function(error){
            console.log('An error occured: ', chalk.bold.red(error));
        });
    }

    /**@description Executes the All Asset's id command
     * @returns {Promise} whose fullfilment means either all assets were retrieved or none existed
     */

    static getAllAstID() {
        let mong = new MongoManager();
        return mong.getAllAssetsID()
        .then((result)=>{
            return result;
        })
        .catch(function(error){
            console.log('An error occured: ', chalk.bold.red(error));
        });
    }
}

module.exports = MongoManager;