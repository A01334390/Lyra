var mongoose = require('mongoose');

var Participant = mongoose.model('Participant',{
    $namespace: {
        type: String,
        default: "org.aabo"
    },
    $type: {
        type: String,
        default: "Client"
    },
    $identifier: {
        type: String
    },
    $id: {
        type: String
    }
});

module.exports = {Participant};
// =========== Validated Resource ===========
// ValidatedResource {
//     '$modelManager':
//      ModelManager {
//        modelFiles:
//         { 'org.hyperledger.composer.system': [Object],
//           'org.aabo': [Object] } },
//     '$namespace': 'org.aabo',
//     '$type': 'Client',
//     '$identifier': 'b45f432ab28d3501db17cf5b508ec8a4',
//     '$validator': ResourceValidator { options: {} },
//     id: 'b45f432ab28d3501db17cf5b508ec8a4' }
// =========== Validated Resource ===========