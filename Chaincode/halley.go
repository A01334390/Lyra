package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the smart contract Structure
type SmartContract struct {

}

/* Define the Wallet Structure with 2 properties
/ [ID] <-- Wallet Identifier made up of an md5 hash
/ [Balance] <-- Balance that indicates the amount of money a wallet holds
*/
type Wallet struct {
	id string `json:"id"`
	balance string `json:"balance"`
}

/*
*The Init method is called when the Smart Contract 'Halley' is instantiated by the blockchain network
* Best practice is to have any Ledger initialization as a separate function
*/

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil);
}

/*
* The Invoke method is called as a result of an application request to the Smart Contract 'Halley'
* The calling application program has also specified the particular smart contract function to be called, with arguments
*/

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstu.GetFunctionAndParameters();
	//Route to the appropiate handler function to interact with the ledger appropiately
	if function == "transferFunds" {
		return s.transferFunds(APIstub,args)
	} else if function == "getAllWallets" {
		return s.getWallets(APIstub)
	} else if function == "createWallet" {
		return s.createWallet(APIstub,args)
	} else if function == "getWalletHistory" {
		return s.getWalletHistory(APIstub, args)
	}

	// If nothing was invoked, launch an error
	fmt.Println("Invoke didn't find any function: "+function)
	return shim.Error("Received Unknown function invocation")
}

/*
* The main method is only relevant in unit test mode. 
* Included here for completeness
*/
func main(){
	//Create a new Smart Contract
	err :=shim.Start(new(SmartContract))
	if(err!=nil){
		fmt.Printf("Error creating a new Smart Contract: %s",err)
	}
}

/*
* transferFunds
* This method is the main driver for the application, it allows the transfer of balance between wallets
* [from]	= This is the id for a wallet that's sending money
* [to]		= This is the id for a wallet that's receiving money
* [balance]	= This is the amount of money that it's being transfered
*/

func (s *SmartContract) transferFunds(APIstub shim.ChaincodeStubInterface, args[]string) sc.Response {
	//TODO
}

/*
* getWallets
* This method returns all wallets that reside in the ledger
* [Nothing]	= Receives no arguments
* (JSON)	= JSON with all wallets on the ledger
*/

func (s *SmartContract) getWallets(APIstub shim.ChaincodeStubInterface) sc.Response {
	//TODO
}

/*
* createWallet
* This method creates a wallet and initializes it into the system
* [id]		= This is an md5 hash that identifies the wallet
* [balance]	= This is the numerical balance of the account
*/

func (s *SmartContract) createWallet(APIstub shim.ChaincodeStubInterface, args[]string) sc.Response {
	//TODO
}

/*
* getWalletHistory
* This method returns the history of the wallet asset through the network
* [id]		= This is an md5 that identifies the wallet
* (JSON)	= JSON Document with the complete history
*/

func (s *SmartContract) getWalletHistory(APIstub shim.ChaincodeStubInterface, args[]string) sc.Response {
	//TODO
}



//InitUser assigns the address and initial balance of an user account
//1. Receives and sanitizes the input
//2. Assigns it to an user object
//3. Saves the user to the blockchain
//4. Adds the user to an index to find it faster later

func (t *SimpleChaincode) initUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	// 	  0			  1
	// Address	Initial Balance

	if len(args) != 2 {
		return shim.Error("Incorrect Number of arguments, expecting 2")
	}

	//Input Sanitation as this part is really important
	fmt.Printf(" - Initializing User - ")

	if len(args[0]) <= 0 || len(args[0]) <= 0 {
		return shim.Error("Arguments can't be non empty")
	}

	//Variable initialization 
	address := args[0]
	balance := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("2nd Argument must be a numeric string")
	}

	//Create the user object and convert it to bytes to save
	objectType := "user"
	user := &user(objectType, address, balance)
	userJSONasBytes, err := json.Marshal(user)
	if err != nil {
		return shim.Error(err.Error())
	}

	//Save the user to the blockchain
	err = stub.PutState(address, userJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	//Create an Index to look faster for Users
	indexName:="address~balance"
	addressBalanceIndexKey,err:=stub.CreateCompositeKey(indexName, []string{user.Owner,user.Balance})
	if(err!=nil){
		return shim.Error(err.Error())
	}

	//Save Index to State
	value:=[]byte[0x00]
	stub.PutState(addressBalanceIndexKey,value)

	//User saved and indexed, return success
	fmt.Println(" - END User Init - ")
	return shim.Success(nil)
}

//ReadUser searches for an user by address to look at it's information
//1. We take the data and sanitize it 
//2. We search for this user on the Blockchain
//3. We return the user data as a JSON Document

func (t* SimpleChaincode) readUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var address, jsonResp string
	var err error

	if(len(args)!=1){
		return shim.Error("Incorrect number of arguments, expecting the address to query")
	}

	address = args[0]
	valAsBytes, err:= stub.GetState(address)
	if(err !=nil){
		jsonResp = "{\"Error\":\"Failed to get state for " + address + "\"}"
		return shim.Error(jsonResp)
	}else if valAsBytes == nil {
		jsonResp = "{\"Error\":\"User does not exist: " + address + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsBytes)
}

//TransferFunds transfers funds from an user to the other
//[NOTE] This part REALLY needs to be as minimal as possible
//1. We take the input and sanitize it
//2. We search for both users in the blockchain
//3. There's a check where an user can only spend as much as he has
//4. Funds are transfered
//5. User states are updated and pushed to the Blockchain

func (t* SimpleChaincode) transferFunds(stub shim.ChaincodeStubInterface, args[]string) pb.Response {
	//		 0			1		   2
	//		from		to		balance		

	if(len(args)< 3){
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	//Variable setting from - to - ammount to be transfered
	from := args[0]
	to := args[1]
	transfer := strconv.Atoi(args[2])

	//if user 'from' doesn't exist, then the transfer halts
	fromAsBytes,err := stub.GetState(from)
	if(err != nil){
		return shim.Error("Failed to get User: "+err.Error())
	}else if (fromAsBytes == nil){
		return shim.Error("User 1 doesn't exist")
	}

	//if user 'to' doesn't exist, then the transfer halts
	toAsBytes,err := stub.GetState(to)
	if(err != nil){
		return shim.Error("Failed to get User: "+err.Error())
	}else if (toAsBytes == nil){
		return shim.Error("User 1 doesn't exist")
	}

	//Make User 'from' usable for us
	userFrom := user {}
	err = json.Unmarshal(fromAsBytes, &userFrom)
	if(err != nil){
		return shim.Error(err.Error())
	}
	
	//Make User 'To' usable for us
	userTo := user {}
	err = json.Unmarshal(toAsBytes, &userTo)
	if(err!= nil){
		return shim.Error(err.Error())
	}

	//This is the main balance transfer mechanism 
	//As far as we know, this part is really simple
	//1. Checks if an user has enough funds to transfer to another user
	//2. Checks if the transfer amount is not negative (that'd be really weird)
	//3. Then, it simply 'transfers' it.

	if(userFrom.Balance >= transfer && transfer > 0){
		userTo.Balance+=transfer
		userFrom.Balance-=transfer
	}
	
	//The state is updated to the blockchain for both
	//the 'to' user and the 'from' user

	userToAsBytes, _ :=json.Marshal(userTo)
	err = stub.PutState(to,userToAsBytes)
	if(err != nil){
		return shim.Error(err.Error())
	}

	userFromAsBytes,_:=json.Marshal(userFrom)
	err = stub.PutState(from,userFromAsBytes)
	if(err != nil){
		return shim.Error(err.Error())
	}

	fmt.Println(" - END Transaction (success) - ");
	return shim.Success(nil)
}

func (t *SimpleChaincode) getUsersByRange(stub, shim.ChaincodeStubInterface, args []string) pb.Response {
	if(len(args) < 2){
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	startKey:= args[0]
	endKey:= args[1]

	resultsIterator, err:= stub.GetStateByRange(startKey,endKey)
	if(err != nil){
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	//Buffer is a JSON Array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse,err := resultsIterator.Next()
		if(err != nil){
			return shim.Error(err.Error())
		}
		//Add a comma before array members, supress ir for the first array member
		if (bArrayMemberAlreadyWritten == true){
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		//Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	fmt.Printf("- get USER by RANGE queryResult:\n%s\n", buffer.String())
	return shim.Success(buffer.Bytes())
}

func (t *SimpleChaincode) getHistoyForUser(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
		if len(args) < 1 {
			return shim.Error("Incorrect number of arguments. Expecting 1")
		}
	
		address := args[0]
	
		fmt.Printf("- start getHistoyForUser: %s\n", address)
	
		resultsIterator, err := stub.GetHistoryForKey(address)
		if err != nil {
			return shim.Error(err.Error())
		}
		defer resultsIterator.Close()
	
		// buffer is a JSON array containing historic values for the marble
		var buffer bytes.Buffer
		buffer.WriteString("[")
	
		bArrayMemberAlreadyWritten := false
		for resultsIterator.HasNext() {
			response, err := resultsIterator.Next()
			if err != nil {
				return shim.Error(err.Error())
			}
			// Add a comma before array members, suppress it for the first array member
			if bArrayMemberAlreadyWritten == true {
				buffer.WriteString(",")
			}
			buffer.WriteString("{\"TxId\":")
			buffer.WriteString("\"")
			buffer.WriteString(response.TxId)
			buffer.WriteString("\"")
	
			buffer.WriteString(", \"Value\":")
			
			// if it was a delete operation on given key, then we need to set the
			//corresponding value null. Else, we will write the response.Value
			//as-is (as the Value itself a JSON user)
			if response.IsDelete {
				buffer.WriteString("null")
			} else {
				buffer.WriteString(string(response.Value))
			}
	
			buffer.WriteString(", \"Timestamp\":")
			buffer.WriteString("\"")
			buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
			buffer.WriteString("\"")
	
			buffer.WriteString(", \"IsDelete\":")
			buffer.WriteString("\"")
			buffer.WriteString(strconv.FormatBool(response.IsDelete))
			buffer.WriteString("\"")
	
			buffer.WriteString("}")
			bArrayMemberAlreadyWritten = true
		}
		buffer.WriteString("]")
	
		fmt.Printf("- getHistoryForMarble returning:\n%s\n", buffer.String())
	
		return shim.Success(buffer.Bytes())
	}