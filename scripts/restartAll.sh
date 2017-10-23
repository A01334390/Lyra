#!/bin/bash

# Exit on first error, print all commands.
set -v

# Go to fabric
cd ~/fabric-tools/

#Tear down Fabric
./teardownFabric.sh

#Startup Hyperledger
./startFabric.sh

#Go back to the project folder
cd ~/Documents/Git\ Projects/Lyra/

#Run npm script
npm run-script deployNetwork