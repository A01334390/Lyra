var mongoose = require('mongoose');

var Transaction = mongoose.model('Transaction',{
    $class : {
        type: String,
        default: 'org.aabo.Transfer'
    },
    amount: {
        type: Number,
        default: 0
    },
    from: {
        $class: {
            type: String,
            default: "org.aabo.Wallet"
        },
        id: {
            type: String
        },
        balance : {
            type: Number
        },
        owner: {
            type: String
        }
    },
    to: {
        $class: {
            type: String,
            default: "org.aabo.Wallet"
        },
        id: {
            type: String
        },
        balance : {
            type: Number
        },
        owner: {
            type: String
        }
    }
});

module.exports = {Transaction};