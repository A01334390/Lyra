
# Lyra
Semestre i's challenge Blockchain distribution

<p> This is a POC for blockchain <b>performance</b> </p>
<h2> Technology used </h2>
<ul>
  <li>Node.js</li>
  <li>Hyperledger Fabric</li>
  <li>Ubuntu</li>
  <li> Docker </li>
</ul>

<p> This program is supposed to be a work in progress to reach <i>at least</i> 1E9 transactions per day </p>

<h2> Quick Installation process </h2>
<p> To install this system on any Ubuntu OS with all needed dependencies, do the following steps: </p>
<h3> Step 1 </h3>
<p> Install CURL </p>
<ul>
  <li> $ sudo apt-get install curl </li>
</ul>
<h3> Step 2 </h3>
<p> Install Node.js and NPM </p>
<ul>
    <li>$ sudo apt-get update</li>
    <li>$ sudo apt-get install nodejs</li>
    <li>$ sudo apt-get install npm</li>
</ul>
<h3> Step 3 </h3>
<p> Go into the Lyra-cli folder  </p>
<ul>
  <li>
    $ cd ~/Lyra-Master/lyra-cli
  </li>
</ul>   
<h3> Step 4 </h3>
<p> Check if Node.js and npm was installed correctly </p>
<ul>
  <li>
    $ npm run-script test
  </li>
</ul>

<p> If you see printed on your screen <b>Lyra-cli can be installed now</b>, you can proceed to install Lyra and Hyperledger </p>

<h3> Step 5 </h3>
<p> Run the following commands. (Note: These might take up to 1h to execute, have at least 5GB of memory free </p>
<ul>
  <li>$ curl -O https://hyperledger.github.io/composer/prereqs-ubuntu.sh </li> 
  <li>$ chmod u+x prereqs-ubuntu.sh </li> 
  <li>$ ./prereqs-ubuntu.sh </li> 
  <li>$ npm install -g composer-cli </li> 
  <li>$ npm install -g generator-hyperledger-composer </li> 
  <li>$ npm install -g composer-rest-server </li> 
  <li>$ npm install -g yo </li> 
  <li>$ npm install -g composer-playground </li> 
  <li>$ docker kill $(docker ps -q) </li> 
  <li>$ docker rm $(docker ps -aq) </li> 
  <li>$ docker rmi $(docker images dev-* -q) </li> 
  <li>$ cd ~/fabric-tools </li> 
  <li>$ curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip </li> 
  <li>$ unzip fabric-dev-servers.zip </li> 
  <li>$ cd ~/fabric-tools </li> 
  <li>$ ./downloadFabric.sh </li> 
  <li>$ ./startFabric.sh </li> 
  <li>$ ./createComposerProfile.sh </li> 
  
</ul>

<h3> Step 6 </h3> 
<p> Run the npm install command </p>
<ul>
    <li>
    $ sudo npm install
  </li>
  </ul>
  
<h1> How to deploy the Smart Contract to Docker </h1>
<p> To deploy the Smart Contract (chaincode) you can run </p>
  <ul>
  <li> $ npm run-script deployNetwork </li>
  </ul>
<p> This command will create the .bna and deploy it as a docker container. You can check if its up by issuing: </p>
  <ul>
  <li> $ npm run-script pingNetwork </li>
  </ul>
  
<h1> How to interact with the Application </h1>
<p> To interact with the lyra app you can issue any of these commands </p>
<ul>
  <li> $ npm start </li>
  <li> $ node index </li>
  </ul>
