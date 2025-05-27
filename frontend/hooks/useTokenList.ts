import { useState, useEffect } from "react";
import axios from "axios";
import { chain } from "@/config/config";

interface Token {
    address: string;
    value: bigint;
    contract_address: string;
    symbol: string;
    balance: string;
}

interface UseTokenListResult {
    tokens: Token[];
    loading: boolean;
}

export default function useTokenList(accountAddress: string | null): UseTokenListResult {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!accountAddress) {
            setTokens([]);
            setLoading(false);
            return;
        }

        const fetchTokens = async () => {
            setLoading(true);

            try {
                const url = `${chain.blockExplorers.default.url}/api/v2/addresses/${accountAddress}/tokens?type=ERC-20`;
                const response = await axios.get(url);
                const extracData: Token[] = response.data.items.map((item: any) => ({
                    address: item.token.address,
                    symbol: item.token.symbol,
                    value: item.value,
                }));
                setTokens(extracData);
            } catch (err) {
                console.error("Failed to fetch token list:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
    }, [accountAddress]);

    return { tokens, loading };
}
