const express = require('express');
const { JSONRPCServer } = require('json-rpc-2.0');
const { createWalletClient, http, hexToNumber, createPublicClient } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { anvil } = require('viem/chains');
const cors = require('cors');
require('dotenv').config();

// ----- Setup -----
const app = express();
const jsonRpcServer = new JSONRPCServer();
const PORT = 1111; //

// ----- Chain Setup -----
const network = {
  ...anvil,
  id: process.env.CHAIN_ID,
  rpcUrls: {
    default: {
      http: [process.env.RPC_URL],
    },
  },
};

// ----- Sponsor Wallet Setup -----
const sponsorWallet = privateKeyToAccount(process.env.PRIVATE_KEY);

const sponsorWalletClient = createWalletClient({
  account: sponsorWallet,
  chain: network,
  transport: http(),
});

const publicClient = createPublicClient({
  chain: network,
  transport: http(),
});

// CORS for frontend
app.use(cors({
  origin: [
    '*' //
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ----- Nonce Queue Management -----
let txQueue = Promise.resolve();
let currentNonce = 0;
let nonceInitialized = false;

async function getNextNonce() {
  if (!nonceInitialized) {
    currentNonce = await publicClient.getTransactionCount({ address: sponsorWallet.address });
    nonceInitialized = true;
  }
  return currentNonce++;
}

// ----- eth_sendTransaction Method -----
jsonRpcServer.addMethod("eth_sendTransaction", (params) => {
  return new Promise((resolve, reject) => {
    txQueue = txQueue.then(async () => {
      try {
        if (params[0]?.authorizationList?.[0]) {
          params[0].authorizationList[0].contractAddress = params[0].authorizationList[0].address;
          params[0].authorizationList[0].chainId = hexToNumber(params[0].authorizationList[0].chainId);
          params[0].authorizationList[0].nonce = hexToNumber(params[0].authorizationList[0].nonce);
        }

        const nonce = await getNextNonce();
        const request = await sponsorWalletClient.prepareTransactionRequest({
          ...params[0],
          nonce,
        });

        console.log('request:', request);
        const signature = await sponsorWalletClient.signTransaction(request);
        console.log('signed serialized txn:', signature);

        const response = await fetch(process.env.RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_sendRawTransaction',
            params: [signature],
          }),
        });

        const result = await response.json();

        if (
          typeof result === 'object' &&
          result !== null &&
          'result' in result &&
          typeof result.result === 'string'
        ) {
          resolve(result.result);
        } else {
          reject(new Error('Invalid response format from eth_sendRawTransaction'));
        }
      } catch (err) {
        console.error('Error in eth_sendTransaction:', err);
        reject(err);
      }
    });
  });
});

// ----- eth_chainId Method -----
jsonRpcServer.addMethod('eth_chainId', async (params) => {
  const response = await fetch(process.env.RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_chainId',
      params: params,
    })
  });

  const responseJson = await response.json();
  return responseJson.result;
});

// ----- HTTP Listener -----
app.post('/', (req, res) => {
  jsonRpcServer.receive(req.body).then((response) => {
    res.json(response);
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gas Sponsor JSON-RPC server is running on port: ${PORT}`);
});

