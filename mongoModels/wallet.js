var mongoose = require('mongoose');

var Wallet = mongoose.model('Wallet',{
    $namespace: {
        type: String,
        default: "org.aabo"
    },
    $type: {
        type: String,
        default: "Wallet"
    },
    $identifier: {
        type: String
    },
    $id: {
        type: String
    },
    balance: {
        type: Number
    },
    ownerID: {
        type: String
    }
});

module.exports = {Wallet};

// =========== Validated Resource ===========
// ValidatedResource {
//     '$modelManager':
//      ModelManager {
//        modelFiles:
//         { 'org.hyperledger.composer.system': [Object],
//           'org.aabo': [Object] } },
//     '$namespace': 'org.aabo',
//     '$type': 'Wallet',
//     '$identifier': 'b59c21a078fde074a6750e91ed19fb21',
//     '$validator': ResourceValidator { options: {} },
//     id: 'b59c21a078fde074a6750e91ed19fb21',
//     balance: 15160.681669919395,
//     owner:
//      Relationship {
//        '$modelManager': ModelManager { modelFiles: [Object] },
//        '$namespace': 'org.aabo',
//        '$type': 'Client',
//        '$identifier': '8a7ea3516f353de45b95b4c3317f3c69',
//        '$class': 'Relationship' } }
// =========== Validated Resource ===========