#!/bin/bash

set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

starttime=$(date +%s)
docker rm -f $(docker ps -aq)

# launch network; create channel and join peer to channel
cd ../Network-Components
./start.sh

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli

#Get into the container
docker exec -it cli bash

#Install the chaincode
peer chaincode install -n halley -v 1.0 -l golang -p github.com/

#Instantiate it 
peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n fabcar -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"

printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
printf "Start by installing required packages run 'npm install'\n"
