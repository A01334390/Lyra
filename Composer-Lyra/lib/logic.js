'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Sample Transfer
 * @param {org.aabo.Transfer} Transfer
 * @transaction
 */

 function transferFunds(transfer){
    //Transfer the funds
    transfer.from.balance -= transfer.amount;
    transfer.to.balance += transfer.amount;

    return getAssetRegistry('org.aabo.Wallet')
    .then(function(assetRegistry){
        //persist the state of the Wallet
        assetRegistry.update(transfer.from);
        assetRegistry.update(transfer.to);
    });
 }

/**
 * Sample Transfer
 * @param {org.aabo.SeedMoney} SeedMoney
 * @transaction
 */

 function transferSeed(seed){
    //Transfer the funds
    seed.wallet.balance+=seed.amount;

    return getAssetRegistry('org.aabo.Wallet')
    .then(function(assetRegistry){
        //persist the state of the Wallet
        assetRegistry.update(seed.wallet);
    });
 }
