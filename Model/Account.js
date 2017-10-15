var mongoose = require('mongoose');

var Account = mongoose.model('Account', {
    privAddress: {
        type: String,
        required: true,
        minlength: 5
    },
    pubAddress: {
        type: String,
        required: true,
        minlength: 5
    },
    balance: {
        type: Number,
        required: true
    }
});

module.exports = {
    Account
};