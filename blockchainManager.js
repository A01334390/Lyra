const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

this.bizNetworkConnection = new BusinessNetworkConnection();
this.CONNECTION_PROFILE_NAME = config.get('connectionProfile');
this.businessNetworkIdentifier = config.get('businessNetworkIdentifier');

this.bizNetworkConnection.connect(this.CONNECTION_PROFILE_NAME, this.businessNetworkIdentifier, participantId, participantPwd)
.then((result) => {
  this.businessNetworkDefinition = result;
});