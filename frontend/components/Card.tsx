"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Button,
  Snippet,
  Tooltip,
} from "@heroui/react";
import useFactory from "@/hooks/useFactory";
import useMiniWallet from "@/hooks/useMiniWallet";
import { chain } from "@/config/config";

export default function MyCard() {
  const { session, status, signOut } = useAuth();
  const router = useRouter();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const { factory, loading: factoryLoading } = useFactory(session, walletAddress);
  const { miniWallet, loading: walletLoading } = useMiniWallet(walletAddress);

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return (
    <>
      <Card>
        <CardHeader className="flex gap-3">
          <Image
            alt="heroui logo"
            height={40}
            radius="sm"
            src={session?.user?.image as string}
            width={40}
          />
          <div className="flex flex-col">
            <p className="text-md">{session?.user?.email}</p>
            <Tooltip content={walletAddress} showArrow={true} color="foreground" placement="bottom-start">
              <p className="text-small text-default-500">
                {walletAddress
                  ? `${walletAddress.slice(0, 7)}...${walletAddress.slice(-5)}`
                  : ""}
              </p>
            </Tooltip>
          </div>
          <Button color="danger" variant="ghost" className="ml-auto" onClick={signOut}>
            Log out
          </Button>
        </CardHeader>

        <Divider />

        <CardBody>
          {miniWallet ? (
            <>
              <div className="text-2xl text-center mt-4">
                miniWallet:<Snippet color="success" symbol="" className="text-xl">{miniWallet}</Snippet>
              </div>

              <br />

              <Divider />

              <CardFooter>
                <Link
                  isExternal
                  showAnchorIcon
                  href={`${chain.blockExplorers.default.url}/address/${miniWallet}`}
                >
                  miniWallet explorer
                </Link>
              </CardFooter>
            </>
          ) : (
            <div className="flex justify-center mt-5 mb-5">
              <Button
                color="primary"
                variant="shadow"
                // radius="full"
                onClick={factory}
                isLoading={factoryLoading}
                disabled={walletLoading || factoryLoading || !!miniWallet}
              >
                Create MiniWallet
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
