var mongoose = require('mongoose');

// T)tttttt                                                   t)   ##                 
//    T)                                                    t)tTTT                    
//    T)     r)RRR  a)AAAA  n)NNNN   s)SSSS a)AAAA   c)CCCC   t)   i)  o)OOO  n)NNNN  
//    T)    r)   RR  a)AAA  n)   NN s)SSSS   a)AAA  c)        t)   i) o)   OO n)   NN 
//    T)    r)      a)   A  n)   NN      s) a)   A  c)        t)   i) o)   OO n)   NN 
//    T)    r)       a)AAAA n)   NN s)SSSS   a)AAAA  c)CCCC   t)T  i)  o)OOO  n)   NN 
                                                                                   

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