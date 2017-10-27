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

/** Start the connection */
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Lyra',{useMongoClient:true});

/*
/ ======== Save Transaction =========
/ Persists a Transaction into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Tested >> Further Tests:: Works correctly
/ ======== ======== ======== ========
*/


const saveTransaction = (jsonDoc) => {

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

    tx.save((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Saved to the db!');
        }
    })
}

/*
/ ======== Save Participant =========
/ Persists a Participant into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Tested >> Further Tests:: Works correctly
/ ======== ======== ======== ========
*/


const saveParticipant = (jsonDoc) => {
    var ptc = new Participant({
        id: jsonDoc.id
    });

    ptc.save((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Saved to the db!');
        }
    });
}

/*
/ ======== Save Asset =========
/ Persists an Asset into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Tested >> Further Tests:: Works correctly
/ ======== ======== ======== ========
*/


const saveAsset = (jsonDoc, idOwner) => {
    var wallet = new Wallet({
        id: jsonDoc.id,
        balance: jsonDoc.balance,
        ownerID: idOwner
    });

    wallet.save((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Saved to the db!');
        }
    });

}

/*
/ ======== Get All Transactions =========
/ Retrieves all persisted transactions
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ============
*/

async function getAllTransactions() {
    let data = await Transaction.find({});
    return data;
}

/*
/ ======== Get All Participants =========
/ Retrieves all persisted participants
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ============
*/

async function getAllParticipants() {
    let data = await Participant.find({});
    return data;
}

/*
/ ======== Get All Assets ============
/ Retrieves all persisted assets
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ========
*/

async function getAllAssets(){
    let data = await Wallet.find({});
    return data;
}

/*
/ ======== Get One Asset ============
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies an asset
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ========
*/

async function getOneAsset(identifier) {
    let data = await Wallet.findOne({
        id : identifier
    });

    return data;
}

/*
/ ======== Get One Participant =========
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies a participant
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ==========
*/

async function getOneParticipant(identifier){
    let data = await Participant.findOne({
        id : identifier
    });
    return data;
}

/**
 * ======== Get All Assets IDs =========
 * Retrieves all persisted assets' id
 * Receives no parameters 
 * Returns all assets ID's (Not the mongo ones)
 * Bugs: None >> Further Tests :: Check if it can be faster
 */

 async function getAllAssetsID(){
    let data = await Wallet.find({},'id -_id');
    return data;
 }


module.exports = {
    saveAsset,
    saveParticipant,
    saveTransaction,
    getAllAssets,
    getAllParticipants,
    getAllTransactions,
    getOneParticipant,
    getOneAsset,
    getAllAssetsID
}