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

const getAllTransactions = () => {
    Transaction.find((err,transactions)=>{
        if(err){
            console.log(err);
        }else{
            console.log(transactions);
        }
    });
}

/*
/ ======== Get All Participants =========
/ Retrieves all persisted participants
/ @returns a JSON document with all participants from a MongoDB DB System
/ $TODO: Needs to be formatted
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ============
*/

const getAllParticipants = () => {
    Participant.find((err,participants)=>{
        if(err){
            console.log(err);
        }else{
            console.log(participants);
        }
    });
}

/*
/ ======== Get All Assets ============
/ Retrieves all persisted assets
/ @returns a JSON document with all participants from a MongoDB DB System
/ $TODO: Needs to be formatted
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ========
*/

const getAllAssets = () => {
    Wallet.find((err,wallet)=>{
        if(err){
            console.log(err);
        }else{
            console.log(wallet);
        }
    });
}

/*
/ ======== Get One Asset ============
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies an asset
/ $TODO: Needs to be formatted
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ========
*/

const getOneAsset = (identifier) => {
    Wallet.findOne({
        id : identifier
    }).then((wallet)=>{
        console.log(wallet);
    });
}

/*
/ ======== Get One Participant =========
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies a participant
/ $TODO: Needs to be formatted
/ Bugs:: Not tested >> Further Tests:: Invoke it somewhere
/ ======== ======== ======== ==========
*/

const getOneParticipant = (identifier) => {
    Participant.findOne({
        id : identifier
    }).then((participant)=>{
        console.log(participant);
    });
}

/**
 * 
 */

 const getAllAssetsID = () => {
    Wallet.find({}).select({
        "_id":0,
        id:1
    }).then((assets)=>{
        return assets;
    });
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