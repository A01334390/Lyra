const bm = require('./blockchainManager');
const md5 = require('md5');

// bm.getWalletByRange('0','10000').then((result)=>{
//     console.log(result);
// }).catch(function(err){
//     console.log(err);
// })

// bm.getWallet('0').then((result)=>{
//     console.log(result);
// }).catch(function(err){
//     console.log(err);
// })

// bm.createWallets(10).then((result)=>{
//     console.log(result);
// }).catch(function(err){
//     console.log('An error occured: ', err);
// });

// bm.createSchedule('10').then((result)=>{
//     console.log(result);
// }).catch(function(error){
//     console.log(error);
// });

bm.transactionCannon(2,'10').then((result)=>{

}).catch(function(err){
    console.log("An error occured:",err);
});