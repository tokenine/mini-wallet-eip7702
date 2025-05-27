import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { anvil } from "viem/chains";
import { SimpleMiniWalletFactory } from "@/abi/SimpleMiniWalletFactory";

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

const publicClient = createPublicClient({
  chain: network,
  transport: http(),
});

export default function useMiniWallet(walletAddress: string | null) {
  const [miniWallet, setMiniWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWallet = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const result = await publicClient.readContract({
        address: SimpleMiniWalletFactory.address,
        abi: SimpleMiniWalletFactory.abi,
        functionName: "getUserWallets",
        args: [walletAddress as `0x${string}`],
      });

      const wallet = result as string;
      setMiniWallet(
        wallet !== "0x0000000000000000000000000000000000000000" ? wallet : null
      );
    } catch (error) {
      console.error("Failed to fetch mini wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]); //

  return { miniWallet, loading };
}
