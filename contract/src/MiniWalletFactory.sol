// SPDX-License-Identifier: GNU General Public License v3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MiniWallet.sol";

/**
 * @title MiniWalletFactory
 * @author Nidz (nidz-the-fact)
 *
 * @notice A smart contract for creating and managing MiniWallet instances.
 * @dev Allows the owner to deploy new MiniWallets and maintain the mapping 
 *      between wallet owners and their respective wallets.
 */
contract MiniWalletFactory is Ownable {
    /// @dev Stores the addresses of all created wallets.
    address[] private allWallets;
    
    /// @dev Maps each wallet owner to their wallet address.
    mapping(address => address) public ownerToWallet;
    
    /// @dev Maps each wallet address to its owner.
    mapping(address => address) public walletToOwner;

    /**
     * @notice Emitted when a new MiniWallet is created.
     * @param walletAddress The address of the newly created wallet.
     * @param walletOwner The address of the wallet owner.
     */
    event WalletCreated(address indexed walletAddress, address indexed walletOwner);

    /**
     * @notice Initializes the MiniWalletFactory contract.
     * @dev Sets the owner of the contract using the Ownable constructor.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Modifier to ensure a wallet can only be created once for each owner.
     * @param owner The address of the wallet owner.
     */
    modifier onlyOnce(address owner) {
        require(ownerToWallet[owner] == address(0), "Wallet already created for this owner");
        _;
    }

    /**
     * @notice Creates a new MiniWallet for the specified owner.
     * @dev Only the contract owner can create wallets. The function ensures 
     *      that each owner can only have one wallet.
     * @param owner The address of the wallet owner.
     * @return address The address of the newly created wallet.
     */
    function createMiniWallet(address owner) external onlyOnce(owner) onlyOwner returns (address) {
        // Deploy a new MiniWallet
        MiniWallet wallet = new MiniWallet(owner, msg.sender);
        address walletAddress = address(wallet);

        // Register the owner and wallet address
        ownerToWallet[owner] = walletAddress;
        walletToOwner[walletAddress] = owner;
        allWallets.push(walletAddress);

        // Emit the WalletCreated event
        emit WalletCreated(walletAddress, owner);

        // Return the address of the newly created wallet
        return walletAddress;
    }

    /**
     * @notice Returns the total number of wallets created.
     * @return uint256 The total number of wallets.
     */
    function getWalletCount() external view returns (uint256) {
        return allWallets.length;
    }

    /**
     * @notice Returns all created wallets and their respective owners.
     * @dev Useful for getting an overview of all wallets in the system.
     * @return walletAddresses The list of all wallet addresses.
     * @return walletOwners The list of corresponding wallet owners.
     */
    function getAllWallets() external view returns (address[] memory walletAddresses, address[] memory walletOwners) {
        uint256 length = allWallets.length;
        address[] memory owners = new address[](length);

        // Populate the owners array
        for (uint256 i = 0; i < length; i++) {
            address walletAddr = allWallets[i];
            owners[i] = walletToOwner[walletAddr];
        }

        // Return the addresses and their respective owners
        return (allWallets, owners);
    }

    /**
     * @notice Returns the wallet address associated with a given owner.
     * @param walletOwner The address of the wallet owner.
     * @return walletAddress The wallet address, or zero address if none exists.
     */
    function getUserWallets(address walletOwner) external view returns (address walletAddress) {
        return ownerToWallet[walletOwner];
    }

    /**
     * @notice Returns the owner of a given wallet address.
     * @param walletAddress The address of the wallet.
     * @return walletOwner The owner address, or zero address if none exists.
     */
    function getWalletOwner(address walletAddress) external view returns (address walletOwner) {
        return walletToOwner[walletAddress];
    }
}
