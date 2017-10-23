
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
var config = require('config').get('mongo-connection');

/** Get data from the configuration files */
let connectionURI = config.get('mongoURI');
let databaseName = config.get('mongoDatabase');

/** Get the data models */
var {Participant} = require('./mongoModels/participant');
var {Transaction} = require('./mongoModels/transaction');
var {Wallet} = require('./mongoModels/wallet');

/** Start the connection */
mongoose.connect(connectionURI+databaseName,(err,db)=>{
    if(err){
        return console.log('Unable to connect to MongoDB server');
    }
}); 

/*
/ ======== Save Transaction =========
/ Persists a Transaction into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/


const saveTransaction = (jsonDoc) => {
    db.collection('Transactions').insertOne(jsonDoc,(err,result)=>{
        if(err){
            console.log('Unable to insert Transaction',err);
        }
    })
}

/*
/ ======== Save Participant =========
/ Persists a Participant into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/


const saveParticipant = (jsonDoc) => {

}

/*
/ ======== Save Asset =========
/ Persists an Asset into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/


const saveAsset = (jsonDoc) => {

}

/*
/ ======== Get All Transactions =========
/ Retrieves all persisted transactions
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ============
*/

const getAllTransactions = () => {

}

/*
/ ======== Get All Participants =========
/ Retrieves all persisted participants
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ============
*/

const getAllParticipants = () => {

}

/*
/ ======== Get All Assets ============
/ Retrieves all persisted assets
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/

const getAllAssets = () => {

}

/*
/ ======== Get One Transaction =========
/ Retrieves a particular transaction from MongoDB
/ @params identifier is an md5 hash that identifies a transaction
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ===========
*/

const getOneTransaction = (identifier) => {

}

/*
/ ======== Get One Asset ============
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies an asset
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/

const getOneAsset = (identifier) => {

}

/*
/ ======== Get One Participant =========
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies a participant
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ==========
*/

const getOneParticipant = (identifier) => {

}


