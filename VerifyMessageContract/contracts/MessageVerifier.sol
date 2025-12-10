// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MessageVerifier {
    using ECDSA for bytes32;

    function verify(
        address expectedSigner,
        string memory message,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 ethSignedMsgHash = MessageHashUtils.toEthSignedMessageHash(
            bytes(message)
        );
        address signer = ethSignedMsgHash.recover(signature);
        return signer == expectedSigner;
    }
}