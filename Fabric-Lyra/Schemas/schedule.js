var mongoose = require('mongoose');

var Schedule = mongoose.model('Schedule',{
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

module.exports = {Schedule};