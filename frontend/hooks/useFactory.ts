import { useState } from "react";
import { mnemonicToAccount } from "viem/accounts";
import { SimpleMiniWalletFactory } from "@/abi/SimpleMiniWalletFactory";
import { createWalletClient, http } from "viem";
import { anvil } from "viem/chains";
import { sponsor } from "@/config/config";
import { addToast } from "@heroui/toast";

const network = {
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

const sponsorWalletClient = createWalletClient({
  account: sponsor.address,
  chain: network,
  transport: http(process.env.NEXT_PUBLIC_API),
});

export default function useFactory(session: unknown, walletAddress: string | null) {
  const [loading, setLoading] = useState(false);

  const factory = async () => {
    if (!walletAddress) return;
    setLoading(true);

    try {
      const mnemonic = localStorage.getItem("mnemonic");
      if (!mnemonic) {
        console.error("Mnemonic not found in localStorage");
        return;
      }

      const account = mnemonicToAccount(mnemonic);

      const EOAwalletClient = createWalletClient({
        account,
        chain: network,
        transport: http(),
      });

      const authorization = await EOAwalletClient.signAuthorization({
        account,
        contractAddress: SimpleMiniWalletFactory.address,
      });

      const hash = await sponsorWalletClient.writeContract({
        abi: SimpleMiniWalletFactory.abi,
        address: SimpleMiniWalletFactory.address,
        authorizationList: [authorization],
        functionName: "createMiniWallet",
        args: [account.address],
      });

      console.log(`View on explorer: ${network.blockExplorers.default.url}/tx/${hash}`);

      addToast({
        title: "Transaction confirm",
        description: `Hash: ${hash.slice(0, 5)}...${hash.slice(-5)}`,
        color: "success",
      });

    } catch (error) {
      console.error("Transaction failed", error);

      addToast({
        title: "Error",
        description: "Transaction fail!",
        color: "danger",
      });

    } finally {
      setLoading(false);
    }
  };

  return { factory, loading };
}
