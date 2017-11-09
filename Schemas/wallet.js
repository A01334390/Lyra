var mongoose = require('mongoose');

var Wallet = mongoose.model('Wallet',{
    id: {
        type: String
    },
    balance: {
        type: String
    }
});

module.exports = {Wallet};
