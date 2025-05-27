# Mini Wallet EIP7702

<p align="center">
   <picture>
      <img alt="logo" src="https://github.com/tokenine/mini-wallet-eip7702/blob/main/design.png" width="100%" height="600">
   </picture>
</p>

> [!NOTE]  
> **Disclaimer: Educational Only**  
> This project is intended for learning and demonstration purposes only.  
  The authors assume no responsibility for any damage or misuse that may occur from using this code in production environments.

## Overview

The **Mini Wallet EIP7702** is a flexible, signature-based smart contract wallet designed for secure and gasless transactions. It leverages the power of **EIP-7702** to provide Web2-like, seamless off-chain approvals for both ETH and ERC-20 tokens, while maintaining robust security through OpenZeppelin libraries like **AccessControl**, **SafeERC20**, and **ECDSA**.

## Key Features

* **Gasless Transactions:** Zero gas fees for end users via EIP-7702.
* **Web2-Like UX:** No on-chain transaction confirmations required, providing a familiar Web2 experience.
* **Signature-Based Access Control:** Off-chain approvals with cryptographic signature verification.
* **Modular Architecture:** Separate contracts for wallet creation and management (MiniWalletFactory) and individual wallet logic (MiniWallet).

---

## Architecture

The Mini Wallet system consists of the following key components:

### 1. **Authentication and Wallet Generation (Web2 + Web3)**

* Users authenticate via **Next Auth** for Web2-like login.
* Wallets are generated and deployed through the **MiniWalletFactory** contract.
* The main address (**0x1Main**) interacts with the factory for wallet creation.

### 2. **MiniWalletFactory (0x1Main)**

* Responsible for deploying and linking new **MiniWallet** instances.
* Maintains mappings of owners to wallets and vice versa.
* Includes functions for wallet creation, lookup, and management.

### 3. **MiniWallet (0x2Sub)**

* Individual wallet contracts, each linked to a single owner.
* Supports ETH and ERC-20 transfers with signature verification.
* Utilizes **EIP-7702** for gasless transactions without on-chain confirmation.

### 4. **Proof with Signature (Owner / EIP-7702)**

* Validates signatures to ensure transaction authenticity.
* Prevents double-spending using signature tracking.

---

## Workflow

1. **Authentication:** Users authenticate using **Next Auth (Web2)**.
2. **Wallet Generation:** Wallets are created via the **MiniWalletFactory** (Web3).
3. **Transaction Flow:**

   * Users generate a signed proof for transactions.
   * **MiniWallet** verifies the signature and processes the transfer without gas fees.
4. **Fund Management:**

   * Wallets support ETH and ERC-20 transfers with **EIP-7702** gasless approvals.

---

## Smart Contracts

### MiniWalletFactory

* Deploys and manages individual **MiniWallet** instances.
* Maintains owner-to-wallet mappings.
* Emits events on wallet creation.

### MiniWallet

* Individual, flexible wallets with signature-based access control.
* Supports gasless ETH and ERC-20 transfers.
* Enforces strong security through cryptographic signatures.

---

## Getting Started

### Tech stacks

* Nextjs
* Next auth
* Solidity
* Blockchain
  
### Libraries

* Foundry
* OpenZeppelin
* Viem
* Ethers
* Tailwind CSS
* others..

---

## License

This project is licensed under the **GNU General Public License v3.0** License.
