import { useEffect, useState } from "react";
import { createWalletClient, http, encodePacked, keccak256, createPublicClient } from "viem";
import { parseEther } from "viem/utils";
import { mnemonicToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import { SimpleMiniWalletFactory } from "@/abi/SimpleMiniWalletFactory";
import { SimpleMiniWallet } from "@/abi/SimpleMiniWallet";
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

const publicClient = createPublicClient({
  chain: network,
  transport: http(),
});

export default function useSendERC20(wallet: string | null, tokenAddress: string | null, to: string | null, amountInput: string | null) {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  const sendERC20 = async () => {
    if (!wallet || !tokenAddress || !to || !amountInput) return;
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

      const miniWallet = await publicClient.readContract({
        address: SimpleMiniWalletFactory.address,
        abi: SimpleMiniWalletFactory.abi,
        functionName: 'getUserWallets',
        args: [walletAddress as `0x${string}`],
      });

      const authorization = await EOAwalletClient.signAuthorization({
        account,
        contractAddress: miniWallet,
      });

      const amount = parseEther(amountInput as string);
      const timestamp = Math.floor(Date.now() / 1000);

      const packedData = encodePacked(
        ["address", "address", "uint256", "uint256", "address"],
        [tokenAddress as `0x${string}`, to as `0x${string}`, amount, BigInt(timestamp), account.address]
      );

      const messageHash = keccak256(packedData);

      const signature = await EOAwalletClient.signMessage({
        account,
        message: { raw: messageHash },
      });

      const hash = await sponsorWalletClient.writeContract({
        abi: SimpleMiniWallet.abi,
        address: miniWallet,
        authorizationList: [authorization],
        functionName: "sendERC20",
        args: [
          tokenAddress as `0x${string}`,
          to as `0x${string}`,
          amount,
          BigInt(timestamp),
          signature as `0x${string}`,
          account.address,
        ],
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

  return { sendERC20, loading };
}
