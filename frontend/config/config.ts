import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { anvil } from 'viem/chains';

export const chain = {
  ...anvil,
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL as string],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: process.env.NEXT_PUBLIC_BLOCKSCOUT_EXPLORER_URL as string,
    },
  },
};

export const sponsor = privateKeyToAccount(process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY as `0x${string}`)

export const walletClient = createWalletClient({
    account: sponsor,
    chain: chain,
    transport: http(),
})

export const publicClient = createPublicClient({
  chain: chain,
  transport: http(),
})
