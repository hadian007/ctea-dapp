"use client";

// CTEA DApp Template - Thirdweb + Sepolia Tea

import {
  ThirdwebProvider,
  useContractWrite,
  useContract,
  useTokenBalance,
  useAddress,
  ConnectWallet,
} from "@thirdweb-dev/react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

function DApp() {
  const [stakingAddress] = useState("0x7Eaa8557E1A608bcc77C2d392093cE7F05c0DB14");
  const [tokenAddress] = useState("0x57599fAb69e148Ab533163DF14c4416B726736d6"); // CTEA
  const [tokenBAddress] = useState("0x227327f8f6dcC4fAa5C78E5A03D98769f29113b6"); // TEA
  const [routerAddress] = useState("0x8b74Cc56E3FbEaE401C1765bA2b988121A142c0e");

  const address = useAddress();
  const { contract: tokenContract } = useContract(tokenAddress, "token");
  const { contract: tokenBContract } = useContract(tokenBAddress, "token");
  const { contract: stakingContract } = useContract(stakingAddress);
  const { contract: routerContract } = useContract(routerAddress);

  const { data: balance } = useTokenBalance(tokenContract, address);
  const { mutateAsync: stakeTokens, isLoading: isStaking } = useContractWrite(stakingContract, "stake");
  const { mutateAsync: swapTokens, isLoading: isSwapping } = useContractWrite(routerContract, "swapExactTokensForTokens");

  const { mutateAsync: approveCTEA } = useContractWrite(tokenContract, "approve");
  const { mutateAsync: approveTEA } = useContractWrite(tokenBContract, "approve");

  const [swapAmount, setSwapAmount] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  async function handleStake() {
    try {
      const amount = prompt("Enter amount to stake:");
      if (!amount) return;
      const result = await stakeTokens({ args: [amount] });
      alert("Staking successful");
    } catch (err) {
      alert("Staking failed");
    }
  }

  async function handleSwap() {
    try {
      const amountIn = ethers.utils.parseUnits(swapAmount, 18);
      const path = [tokenAddress, tokenBAddress];
      const to = address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      await swapTokens({ args: [amountIn, 0, path, to, deadline] });
      alert("Swap successful!");
    } catch (err) {
      alert("Swap failed");
    }
  }

  async function handleAddLiquidity() {
    try {
      if (!routerContract) {
        alert("Router contract not loaded yet!");
        return;
      }

      const amountADesired = ethers.utils.parseUnits(amountA, 18);
      const amountBDesired = ethers.utils.parseUnits(amountB, 18);
      const amountAMin = 0;
      const amountBMin = 0;
      const to = address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      await routerContract.call("addLiquidity", [
        tokenAddress,
        tokenBAddress,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline,
      ]);

      alert("Liquidity added!");
    } catch (err) {
      alert("Add liquidity failed");
    }
  }

  async function handleApproveCTEA() {
    try {
      await approveCTEA({ args: [routerAddress, ethers.constants.MaxUint256] });
      alert("CTEA approved for router!");
    } catch (err) {
      alert("Approval failed");
    }
  }

  async function handleApproveTEA() {
    try {
      await approveTEA({ args: [routerAddress, ethers.constants.MaxUint256] });
      alert("TEA approved for router!");
    } catch (err) {
      alert("Approval failed");
    }
  }

  useEffect(() => {
    if (balance) {
      console.log("User balance:", balance.displayValue, balance.symbol);
    }
  }, [balance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f8fa] to-[#e0e0e0] text-gray-800 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">CTEA DApp</h1>
        <ConnectWallet className="mb-4" />

        {address && (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold">Your Balance:</h2>
              <p>{balance?.displayValue} {balance?.symbol}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Staking Interface</h3>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
                onClick={handleStake}
                disabled={isStaking}
              >
                {isStaking ? "Staking..." : "Stake Tokens"}
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Swap Interface</h3>
              <input
                type="number"
                className="border rounded px-3 py-1 w-full mb-2"
                placeholder="Amount to swap"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
              />
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleApproveCTEA}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                >
                  Approve CTEA
                </button>
                <button
                  onClick={handleApproveTEA}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                >
                  Approve TEA
                </button>
              </div>
              <button
                onClick={handleSwap}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
                disabled={isSwapping}
              >
                {isSwapping ? "Swapping..." : "Swap Tokens"}
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Pool Interface</h3>
              <input
                type="number"
                className="border rounded px-3 py-1 w-full mb-2"
                placeholder="Amount Token A"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
              />
              <input
                type="number"
                className="border rounded px-3 py-1 w-full mb-2"
                placeholder="Amount Token B"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
              />
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleApproveCTEA}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                >
                  Approve CTEA
                </button>
                <button
                  onClick={handleApproveTEA}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                >
                  Approve TEA
                </button>
              </div>
              <button
                onClick={handleAddLiquidity}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl"
              >
                Add Liquidity
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ThirdwebProvider
      clientId="36a396117a2a7ec328aee3928b5c19b1"
      activeChain={{
        chainId: 10218,
        rpc: ["https://tea-sepolia.g.alchemy.com/public"],
        nativeCurrency: {
          name: "TeaETH",
          symbol: "TEA",
          decimals: 18,
        },
        shortName: "tea",
        slug: "tea",
        name: "Sepolia Tea",
        testnet: true,
        chain: "tea-sepolia",
      }}
    >
      <DApp />
    </ThirdwebProvider>
  );
}
