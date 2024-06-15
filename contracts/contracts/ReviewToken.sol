// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title ReviewToken
 * @dev This is a basic ERC20 token using the OpenZeppelin's ERC20PresetFixedSupply preset.
 * You can edit the default values as needed.
 */
contract ReviewToken is ERC20Burnable {
    /**
     * @dev Constructor to initialize the token with default values.
     * You can edit these values as needed.
     */
    constructor() ERC20("ReviewToken", "RVW") {
        // Default initial supply of 1 billion tokens (without decimals).
        uint256 initialSupply = 1_000_000_000;

        // The initial supply is minted to the deployer's address
        _mint(msg.sender, initialSupply);
    }
}
