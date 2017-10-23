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
mongoose.connect('mongodb://localhost:27017/Lyra');

/*
/ ======== Save Transaction =========
/ Persists a Transaction into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/


const saveTransaction = (jsonDoc) => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
    });
    console.log('Connected to MongoDB server');
    db.collection('Transactions').insertOne(jsonDoc, (err, result) => {
        if (err) {
            console.log('Unable to insert Transaction', err);
        }
    });
    db.close();
}

/*
/ ======== Save Participant =========
/ Persists a Participant into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/


const saveParticipant = (jsonDoc) => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
        db.collection('Participants').insertOne(jsonDoc, (err, result) => {
            if (err) {
                console.log('Unable to insert Transaction', err);
            }
        });
        db.close();
    });
}

/*
/ ======== Save Asset =========
/ Persists an Asset into a MongoDB DB System
/ @Param jsonDoc is a JSON Document that has all relevant information
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/


const saveAsset = (jsonDoc) => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
        console.log('Connected to MongoDB server');
        db.collection('Assets').insertOne(jsonDoc, (err, result) => {
            if (err) {
                console.log('Unable to insert Transaction', err);
            }
        });
        db.close();
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
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
    });
    console.log('Connected to MongoDB server');
    db.collection('Transactions').find({}).toArray().then((docs) => {
        return JSON.stringify(docs, undefined, 2);
    });
    db.close();
}

/*
/ ======== Get All Participants =========
/ Retrieves all persisted participants
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ============
*/

const getAllParticipants = () => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
        console.log('Connected to MongoDB server');
        db.collection('Participants').find({}).toArray().then((docs) => {
            return JSON.stringify(docs, undefined, 2);
        });
        db.close();
    });

}

/*
/ ======== Get All Assets ============
/ Retrieves all persisted assets
/ @returns a JSON document with all participants from a MongoDB DB System
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/

const getAllAssets = () => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
        console.log('Connected to MongoDB server');
        db.collection('Assets').find({}).toArray().then((docs) => {
            return JSON.stringify(docs, undefined, 2);
        });
        db.close();
    });
}

/*
/ ======== Get One Transaction =========
/ Retrieves a particular transaction from MongoDB
/ @params identifier is an md5 hash that identifies a transaction
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ===========
*/

const getOneTransaction = (identifier) => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
        console.log('Connected to MongoDB server');
        db.collection('Transactions').findOne({
            id: identifier
        }).toArray().then((docs) => {
            return JSON.stringify(docs, undefined, 2);
        });
        db.close();
    });
}

/*
/ ======== Get One Asset ============
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies an asset
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ========
*/

const getOneAsset = (identifier) => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
        console.log('Connected to MongoDB server');
        db.collection('Assets').findOne({
            id: identifier
        }).toArray().then((docs) => {
            return JSON.stringify(docs, undefined, 2);
        });
        db.close();
    });
}

/*
/ ======== Get One Participant =========
/ Retrieves all persisted assets
/ @params identifier is an md5 hash that identifies a participant
/ Bugs:: Not tested >> Further Tests:: Once it is programmed
/ ======== ======== ======== ==========
*/

const getOneParticipant = (identifier) => {
    MongoClient.connect('mongodb://localhost:27017/Lyra', (err, db) => {
        if (err) {
            return console.log('Unable to connect to MongoDB server');
        }
        console.log('Connected to MongoDB server');
        db.collection('Participant').findOne({
            id: identifier
        }).toArray().then((docs) => {
            return JSON.stringify(docs, undefined, 2);
        });
        db.close();
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
    getOneTransaction,
    getOneAsset
}