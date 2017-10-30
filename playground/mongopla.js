const mongo = require('../mongoManager');


let res = mongo.getAllAstID().then((result)=>{
    console.log(result);
});