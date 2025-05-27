"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { english, generateMnemonic, mnemonicToAccount } from "viem/accounts";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Textarea,
  Code,
  Image
} from "@heroui/react";
import bip39 from "bip39";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [step, setStep] = useState(1);
  const [confirmSelfStorage, setConfirmSelfStorage] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [word3, setWord3] = useState("");
  const [word9, setWord9] = useState("");
  const [error, setError] = useState("");
  const [importMnemonic, setImportMnemonic] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      const savedWallet = localStorage.getItem("walletAddress");
      const savedMnemonic = localStorage.getItem("mnemonic");

      if (savedWallet && savedMnemonic) {
        setWalletAddress(savedWallet);
        setMnemonic(savedMnemonic);
        setStep(4);
      } else {
        setStep(1);
      }
      onOpen();
    }
  }, [status]);

  const handleGenerateWallet = () => {
    const newMnemonic = generateMnemonic(english);
    const account = mnemonicToAccount(newMnemonic);
    setMnemonic(newMnemonic);
    setWalletAddress(account.address);
    setStep(3);
  };

  const handleValidateWords = () => {
    const words = mnemonic.split(" ");
    if (word3.trim() === words[2] && word9.trim() === words[8]) {
      localStorage.setItem("walletAddress", walletAddress);
      localStorage.setItem("mnemonic", mnemonic);
      setStep(4);
      setError("");
    } else {
      setError("Incorrect word 3 or word 9.");
    }
  };

  const handleImportWallet = () => {
    const trimmedMnemonic = importMnemonic.trim();
    const isValid = bip39.validateMnemonic(trimmedMnemonic);

    if (!isValid) {
      setError("Invalid mnemonic phrase.");
      return;
    }

    try {
      const account = mnemonicToAccount(trimmedMnemonic);
      setMnemonic(trimmedMnemonic);
      setWalletAddress(account.address);
      localStorage.setItem("walletAddress", account.address);
      localStorage.setItem("mnemonic", trimmedMnemonic);
      setError("");
      setStep(4);
    } catch (e) {
      setError("Failed to import wallet. Please try again.");
    }
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-96 p-16 sm:p-36">
      <h1 className="text-5xl font-bold mb-2">Welcome back</h1>
      <h1 className="text-3xl font-bold mb-6 text-gray-500">Login</h1>
      <Image
        isBlurred
        alt="HeroUI Album Cover"
        className="mb-8 rounded-lg shadow-lg"
        src="https://heroui.com/images/album-cover.png"
        width={240}
        height={240}
      />
      <Button
        color="primary"
        radius="full"
        variant="shadow"
        className="flex items-center gap-2"
        onClick={() => signIn("google")}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          className="w-5 h-5"
        />
        Sign in with Google
      </Button>

      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {step === 1 && "Step 1: Acceptance"}
                {step === 2 && "Step 2: Create or Import Wallet"}
                {step === 3 && "Step 3: Confirm Mnemonic"}
                {step === 4 && "Step 4: Success"}
              </ModalHeader>

              <ModalBody>
                {step === 1 && (
                  <>
                    <p className="mb-2">
                      You are responsible for securely storing your key. If lost, it cannot be recovered.
                    </p>
                    <Checkbox
                      isSelected={confirmSelfStorage}
                      onValueChange={setConfirmSelfStorage}
                    >
                      I understand and accept
                    </Checkbox>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="mb-2">Click to generate a wallet or import web3 wallet a mnemonic phrase:</p>
                    <Button color="primary" className="mb-4" onPress={handleGenerateWallet}>
                      Generate New Wallet
                    </Button>
                    <Textarea
                      label="Import mnemonic phrase"
                      value={importMnemonic}
                      onChange={(e) => setImportMnemonic(e.target.value)}
                      placeholder="e.g. word1 word2 word3... - word12"
                    />
                    <Button
                      color="secondary"
                      className="mt-2"
                      onPress={handleImportWallet}
                      isDisabled={
                        importMnemonic.trim().split(/\s+/).length !== 12
                      }
                    >
                      Import Wallet
                    </Button>
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                  </>
                )}

                {step === 3 && (
                  <>
                    <p className="text-sm text-gray-500 mb-2">Your mnemonic phrase:</p>
                    <pre className="bg-blue-100 text-blue-900 p-3 rounded mb-4 break-words whitespace-pre-wrap overflow-x-auto max-w-full">
                      {mnemonic}
                    </pre>
                    <p className="mb-2">Enter word 3 and word 9 for verification:</p>
                    <Input
                      label="Word 3"
                      value={word3}
                      onChange={(e) => setWord3(e.target.value)}
                    />
                    <Input
                      label="Word 9"
                      value={word9}
                      onChange={(e) => setWord9(e.target.value)}
                      className="mt-2"
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  </>
                )}

                {step === 4 && (
                  <>
                    <p>🎉 Your web3 Wallet is!</p>
                    <p>
                      Address: <Code >{walletAddress}</Code>
                    </p>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="ghost"
                      onPress={() => setStep(2)}
                      className="mt-2"
                    >
                      Import or New Generate wallet
                    </Button>
                  </>
                )}
              </ModalBody>

              <ModalFooter>
                {step === 1 && (
                  <Button
                    color="primary"
                    onPress={() => confirmSelfStorage && setStep(2)}
                    isDisabled={!confirmSelfStorage}
                  >
                    Continue
                  </Button>
                )}

                {(step === 2 || step === 4) && (
                  <Button
                    color="success"
                    onPress={handleFinish}
                    isDisabled={!walletAddress}
                  >
                    Go to Dashboard
                  </Button>
                )}

                {step === 3 && (
                  <Button color="primary" onPress={handleValidateWords}>
                    Confirm Mnemonic
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
