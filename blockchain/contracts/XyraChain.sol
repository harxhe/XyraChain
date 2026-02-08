// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract XyraChain {
    struct Report {
        string ipfsHash;    // The CID from IPFS
        string diagnosis;   // "Normal" or "Pneumonia"
        uint256 confidence; // Accuracy score from CNN (multiplied by 100 for decimals)
        uint256 timestamp;
    }

    // Maps a user's wallet address to their list of medical reports
    mapping(address => Report[]) private userReports;

    event ReportAdded(address indexed user, string ipfsHash, uint256 timestamp);

    function addReport(string memory _hash, string memory _diagnosis, uint256 _confidence) public {
        userReports[msg.sender].push(Report({
            ipfsHash: _hash,
            diagnosis: _diagnosis,
            confidence: _confidence,
            timestamp: block.timestamp
        }));
        
        emit ReportAdded(msg.sender, _hash, block.timestamp);
    }

    function getMyReports() public view returns (Report[] memory) {
        return userReports[msg.sender];
    }
}