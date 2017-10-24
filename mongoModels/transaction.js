var mongoose = require('mongoose');

var Transaction = mongoose.model('Transaction',{
    amount: {
        type: Number,
        default: 0
    },
    from: {
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

// "$class": "org.aabo.Transfer",
// "amount": 100,
// "from": {
//     "$class": "org.aabo.Wallet",
//     "id": from.getIdentifier(),
//     "balance": from.balance,
//     "owner": "resource:org.aabo.Client#" + from.owner.getIdentifier()
// },
// "to": {
//     "$class": "org.aabo.Wallet",
//     "id": to.getIdentifier(),
//     "balance": to.balance,
//     "owner": "resource:org.aabo.Client#" + to.owner.getIdentifier()
// }