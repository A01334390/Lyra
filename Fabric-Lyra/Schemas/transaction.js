var mongoose = require('mongoose');

var Transaction = mongoose.model('Transaction',{
    from : {
        type: String
    },
    to : {
        type : String
    },
    funds : {
        type : String
    }

});

module.exports = {Transaction};