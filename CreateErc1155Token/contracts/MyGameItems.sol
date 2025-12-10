// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyGameItems is ERC1155, Ownable {
    using Strings for uint256;

    string public name;
    string public symbol;
    string private baseMetadataURI;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) ERC1155(_uri) Ownable(msg.sender) {
        name = _name;
        symbol = _symbol;
        baseMetadataURI = _uri;
    }

    /// @notice Mint a single token type
    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        _mint(to, id, amount, "");
    }

    /// @notice Mint multiple token types in one transaction
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) public onlyOwner{
        _mintBatch(to, ids, amounts, "");
    }

    /// @notice Update the base URI (e.g. after uploading metadata to IPFS)
    function setURI(string memory newuri) external onlyOwner {
        baseMetadataURI = newuri;
        _setURI(newuri);
    }

    /// @notice Return metadata URI for each ID
    function uri(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(baseMetadataURI, _id.toString(), ".json"));
    }
}