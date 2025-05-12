// SPDX-License-Identifier: GNU General Public License v3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MiniWallet
 * @author Nidz (nidz-the-fact)
 *
 * @notice A flexible smart contract wallet for managing ETH and ERC-20 tokens, 
 *         featuring signature-based, gasless approvals through EIP-7702 for a seamless,
 *         Web2-like transaction experience without the need for on-chain confirmations.
 * @dev    Leverages OpenZeppelin's AccessControl, ECDSA, and SafeERC20 for security.
 */
contract MiniWallet is AccessControl {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    /// @dev Role identifiers for the contract
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    /// @notice The primary owner of the wallet
    address public owner;
    
    /// @notice The authorized external address (e.g., a delegate)
    address public eip7702;

    /// @dev Tracks used signatures to prevent replay attacks
    mapping(bytes32 => bool) public usedSignatures;

    /**
     * @notice Initializes the MiniWallet contract with the owner and optional executor.
     * @dev Grants OWNER and EXECUTOR roles to the specified addresses.
     * @param _owner The address of the wallet owner
     * @param _eip7702 The address authorized to execute transactions (e.g., a delegate)
     */
    constructor(address _owner, address _eip7702) {
        owner = _owner;
        eip7702 = _eip7702;

        // Grant roles
        _grantRole(OWNER_ROLE, owner);
        _grantRole(EXECUTOR_ROLE, owner);
        _grantRole(EXECUTOR_ROLE, eip7702);
    }

    /**
     * @dev Restricts function access to accounts with the EXECUTOR_ROLE.
     */
    modifier onlyExecutor() {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Not executor");
        _;
    }

    /**
     * @notice Transfers Ether from the contract to a specified address.
     * @dev Requires a valid, unused signature from the owner to prevent double spending.
     * @param to The recipient address
     * @param amount The amount of Ether to send
     * @param timestamp The transaction timestamp
     * @param signature The owner's signature approving the transaction
     * @param sender The address that initiated the transaction
     */
    function send(
        address to, 
        uint256 amount, 
        uint256 timestamp, 
        bytes memory signature, 
        address sender
    ) external payable onlyExecutor {
        // Check if the contract has enough Ether
        require(address(this).balance >= amount, "Not enough balance in contract");

        // Create the message hash for signature verification
        bytes32 messageHash = keccak256(abi.encodePacked(to, amount, timestamp, sender));
        bytes32 signedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        // Prevent replay attacks
        require(!usedSignatures[signedMessageHash], "Signature already used");

        // Recover the signer address and verify ownership
        address signer = signedMessageHash.recover(signature);
        require(signer == owner, "Invalid signature");

        // Mark the signature as used
        usedSignatures[signedMessageHash] = true;

        // Transfer the Ether
        payable(to).transfer(amount);
    }

    /**
     * @notice Transfers ERC-20 tokens from the contract to a specified address.
     * @dev Requires a valid, unused signature from the owner to prevent double spending.
     * @param token The address of the ERC-20 token contract
     * @param to The recipient address
     * @param amount The amount of tokens to send
     * @param timestamp The transaction timestamp
     * @param signature The owner's signature approving the transaction
     * @param sender The address that initiated the transaction
     */
    function sendERC20(
        address token, 
        address to, 
        uint256 amount, 
        uint256 timestamp, 
        bytes memory signature, 
        address sender
    ) external onlyExecutor {
        // Check if the contract has enough token balance
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance >= amount, "Not enough Tokens balance in contract");

        // Create the message hash for signature verification
        bytes32 messageHash = keccak256(abi.encodePacked(token, to, amount, timestamp, sender));
        bytes32 signedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        // Prevent replay attacks
        require(!usedSignatures[signedMessageHash], "Signature already used");

        // Recover the signer address and verify ownership
        address signer = signedMessageHash.recover(signature);
        require(signer == owner, "Invalid signature");

        // Mark the signature as used
        usedSignatures[signedMessageHash] = true;

        // Transfer the tokens
        IERC20(token).transfer(to, amount);
    }

    /**
     * @notice Fallback function for receiving Ether.
     * @dev Allows the contract to accept Ether directly.
     */
    receive() external payable {}
}
