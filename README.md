
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
<p> Install Node.js and NPM </p>
<ul>
    <li>$ sudo apt-get update</li>
    <li>$ sudo apt-get install nodejs</li>
    <li>$ sudo apt-get install npm</li>
</ul>
<h3> Step 2 </h3>
<p> Go into the Lyra-cli folder and issue the install command </p>
<ul>
  <li>
    $ cd ~/lyra-cli
  </li>
  <li>
    $ sudo npm install
  </li>
</ul>   
<h3> Step 3 </h3>
<p> Check if Node.js and npm was installed correctly </p>
<ul>
  <li>
    $ npm run-script test
  </li>
</ul>

<p> If you see printed on your screen <b>Lyra-cli can be installed now</b>, you can proceed to install Lyra and Hyperledger </p>

<h3> Step 4 </h3>
<p> Run the following commands. (Note: These might take up to 1h to execute, have at least 5GB of memory free </p>
<ul>
  <li> $ npm run-script systemPrepare : <b> This command installs all needed technologies to run Hyperledger </b></li>
  <li> $ npm run-script composerPrepare : <b> This command installs all Hyperledger Composer Tools </b></li>
  <li> $ npm run-script hyperledgerStart : <b> This command removes all Docker containers, downloads Hyperledger, starts it and creates a Composer certificate</b></li>
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
