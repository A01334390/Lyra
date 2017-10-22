
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
<h3> Node JS Path </h3>
<p> If you've already got node.js and npm installed, you can reach to the project's folder and issue the following commands</p>
<ul>
  <li> $ npm run-script first-step</li>
  <li> <b>Then logout and login again, reboot if possible</b></li>
    <li> $ npm run-script second-step</li>
</ul>

<h3> The 'Clean Slate' Path </h3>
<p> If your system has nothing but basic ubuntu installed, do the following <p>
  <ol>
    <li>
      <b> Go to the lyra-cli/scripts folder </b>
    </li>
    <li>
      $ chmod u+x lyrainstaller-1.sh 
    </li>
    <li>
      $ chmod u+x lyrainstaller-2.sh
    </li>
    <li>
      $ ./lyrainstaller-1.sh
    </li>
    <li>
      <b> Logout and login again, reboot if possible</b>
    </li>
    <li>
      <b> Go to the lyra-cli/scripts folder </b>
    </li>
    <li>
      $ ./lyrainstaller-2.sh
    </li>
    <li>
      <b> Logout and login again, reboot if possible</b>
    </li>
    <li>
      <b> DONE </b>
    </li>
  </ol>
  <p> If the Scripts launch a <i> bad interpreter: No such file or directory </i> message, issue the following statements: </p>
  <ul>
  <li>
    $ sed -i -e 's/\r$//' lyrainstaller-1.sh
  </li>
  <li>
    $ sed -i -e 's/\r$//' lyrainstaller-2.sh
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
