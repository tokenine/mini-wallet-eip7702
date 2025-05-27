"use client";

import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Code,
} from "@heroui/react";
import { formatEther } from "viem";
import useTokenList from "@/hooks/useTokenList";
import useMiniWallet from "@/hooks/useMiniWallet";
import { chain } from "@/config/config";

export default function MyTable() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const { miniWallet, loading: walletLoading } = useMiniWallet(walletAddress);
  const { tokens, loading: tokensLoading } = useTokenList(miniWallet);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  return (
    <>
      <Table aria-label="Token List Table">
        <TableHeader>
          <TableColumn className="text-center align-middle">TOKEN</TableColumn>
          <TableColumn className="text-center align-middle">BALANCE</TableColumn>
          <TableColumn className="text-center align-middle">ACTION</TableColumn>
        </TableHeader>
        <TableBody className="">
          {tokens.length === 0 ? (
            <TableRow key="empty">
              <TableCell colSpan={3} className="text-center align-middle">
                No tokens found. <br />
                Receive with Address <Code>miniWallet:<span className="text-green-500">0xYou</span></Code>
              </TableCell>
            </TableRow>
          ) : (
            tokens.map((token) => (
              <TableRow key={token.address} >
                <TableCell className="text-center align-middle">{token.symbol}</TableCell>
                <TableCell className="text-center align-middle">
                  {Number(formatEther(token.value)).toFixed(4)}
                </TableCell>
                <TableCell className="text-center align-middle">
                  <a
                    href={`${chain.blockExplorers.default.url}/token/${token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline justify-center items-center inline-flex"
                  >
                    <Navigation className="" />
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
