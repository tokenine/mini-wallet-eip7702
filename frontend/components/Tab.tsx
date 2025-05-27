"use client";

import { useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Tabs, Tab, Card, CardBody, Button } from "@heroui/react";
import { formatEther, isAddress, parseEther } from "viem";
import useSendERC20 from "@/hooks/useSendERC20";
import useTokenList from "@/hooks/useTokenList";
import useMiniWallet from "@/hooks/useMiniWallet";

export default function MyTab() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { miniWallet } = useMiniWallet(walletAddress);
  const { tokens } = useTokenList(miniWallet);

  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isValidTo, setIsValidTo] = useState(true);

  const { sendERC20, loading } = useSendERC20(miniWallet, selectedToken, to, amount);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  useEffect(() => {
    setIsValidTo(isAddress(to));
  }, [to]);

  const selectedTokenData = tokens.find((t) => t.address === selectedToken);

  const selectedTokenBalance = selectedTokenData
    ? BigInt(selectedTokenData.value.toString())
    : BigInt(0);

  let amountBigInt: bigint | null = null;
  try {
    amountBigInt = amount ? parseEther(amount) : null;
  } catch {
    amountBigInt = null;
  }

  const isAmountValid =
    amountBigInt !== null &&
    amountBigInt > BigInt(0) &&
    amountBigInt <= selectedTokenBalance;

  const canSend =
    !loading &&
    !!miniWallet &&
    !!selectedToken &&
    to.length > 0 &&
    isValidTo &&
    amount.length > 0 &&
    isAmountValid;

  return (
    <div className="flex flex-col w-full h-full">
      <Tabs aria-label="Options" className="flex-1 flex flex-col">
        <Tab key="transfers" title="Transfers" className="flex-1 flex flex-col">
          <Card className="h-[440px]">
            <CardBody className="flex-1 overflow-auto">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!canSend) return;
                  sendERC20();
                }}
                className="space-y-4"
              >

                <Autocomplete
                  label="Select Token"
                  selectedKey={selectedToken}
                  onSelectionChange={(key) => setSelectedToken(key as string)}
                  placeholder="Choose token"
                  className="max-w-md"
                >
                  {tokens.map((token) => (
                    <AutocompleteItem key={token.address}>
                      {token.symbol}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <Input
                  type="text"
                  label="To Address"
                  placeholder="0x..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={`max-w-md ${to && !isValidTo ? "border-red-500" : ""}`}
                  description={to && !isValidTo ? "Invalid address" : undefined}
                />

                <div className="w-full max-w-md">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700"></label>
                    {selectedTokenData && (
                      <span className="text-sm text-gray-500">
                        Balance: {formatEther(selectedTokenBalance)}
                      </span>
                    )}
                  </div>
                  <Input
                    type="text"
                    label="Amount"
                    placeholder="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`max-w-md ${amount && !isAmountValid ? "border-red-500" : ""}`}
                    description={
                      amount && !isAmountValid
                        ? amountBigInt === null || amountBigInt <= BigInt(0)
                          ? "Invalid amount, must be greater than 0"
                          : "Insufficient balance"
                        : undefined
                    }
                  />
                </div>

                <Button
                  color="primary"
                  type="submit"
                  disabled={!canSend}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="receive" title="Receive" className="flex-1 flex flex-col">
          <Card className="h-[440px]">
            <CardBody className="flex-1 overflow-auto text-center mt-40">
              <div className="text-lg">Receive with Address</div>
              <div className="mt-2 mx-auto max-w-full overflow-x-auto break-words px-4">
                <code>
                  miniWallet:{" "}
                  <span className="text-green-500">{miniWallet || "0xYou"}</span>
                </code>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
