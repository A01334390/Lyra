var mongoose = require('mongoose');

// W)      ww         l)L  l)L            t)   
// W)      ww          l)   l)          t)tTTT 
// W)  ww  ww a)AAAA   l)   l)  e)EEEEE   t)   
// W)  ww  ww  a)AAA   l)   l)  e)EEEE    t)   
// W)  ww  ww a)   A   l)   l)  e)        t)   
//  W)ww www   a)AAAA l)LL l)LL  e)EEEE   t)T  
                                            

var Wallet = mongoose.model('Wallet',{
    id: {
        type: String
    },
    balance: {
        type: String
    }
});

module.exports = {Wallet};
