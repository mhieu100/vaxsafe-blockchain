// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VaxSafeIdentity
 * @dev Smart contract for managing decentralized identities for vaccine records
 * Supports DID (Decentralized Identifier) with guardian model for children
 */
contract VaxSafeIdentity {
    
    // Identity types
    enum IdentityType { ADULT, CHILD, NEWBORN }
    
    // Identity structure
    struct Identity {
        bytes32 identityHash;           // Unique identity hash
        string did;                     // Decentralized Identifier (DID)
        address guardian;               // Guardian address (for children)
        IdentityType idType;            // Identity type
        uint256 createdAt;              // Creation timestamp
        bool isActive;                  // Active status
        string ipfsDataHash;            // IPFS hash for additional data
    }
    
    // Document structure for linking documents to identity
    struct Document {
        string documentType;            // e.g., "BIRTH_CERTIFICATE", "ID_CARD"
        string ipfsHash;                // IPFS hash of the document
        uint256 linkedAt;               // Timestamp when linked
        bool isVerified;                // Verification status
    }
    
    // Mappings
    mapping(bytes32 => Identity) public identities;
    mapping(bytes32 => Document[]) public identityDocuments;
    mapping(bytes32 => bool) public identityExists;
    
    // Events
    event IdentityCreated(
        bytes32 indexed identityHash,
        string did,
        address indexed guardian,
        IdentityType idType,
        uint256 timestamp
    );
    
    event DocumentLinked(
        bytes32 indexed identityHash,
        string documentType,
        string ipfsHash,
        uint256 timestamp
    );
    
    event DocumentVerified(
        bytes32 indexed identityHash,
        string documentType,
        uint256 timestamp
    );
    
    /**
     * @dev Create a new identity
     * @param _identityHash Unique identity hash
     * @param _did Decentralized Identifier
     * @param _guardian Guardian address (use msg.sender for adults, parent address for children)
     * @param _idType Identity type (ADULT, CHILD, NEWBORN)
     * @param _ipfsDataHash IPFS hash for additional off-chain data
     */
    function createIdentity(
        bytes32 _identityHash,
        string memory _did,
        address _guardian,
        IdentityType _idType,
        string memory _ipfsDataHash
    ) external {
        require(!identityExists[_identityHash], "Identity already exists");
        require(_guardian != address(0), "Invalid guardian address");
        require(bytes(_did).length > 0, "DID cannot be empty");
        
        identities[_identityHash] = Identity({
            identityHash: _identityHash,
            did: _did,
            guardian: _guardian,
            idType: _idType,
            createdAt: block.timestamp,
            isActive: true,
            ipfsDataHash: _ipfsDataHash
        });
        
        identityExists[_identityHash] = true;
        
        emit IdentityCreated(_identityHash, _did, _guardian, _idType, block.timestamp);
    }
    
    /**
     * @dev Link a document to an identity
     * @param _identityHash Identity hash
     * @param _documentType Type of document
     * @param _ipfsHash IPFS hash of the document
     */
    function linkDocument(
        bytes32 _identityHash,
        string memory _documentType,
        string memory _ipfsHash
    ) external {
        require(identityExists[_identityHash], "Identity does not exist");
        require(bytes(_documentType).length > 0, "Document type cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        Identity memory identity = identities[_identityHash];
        require(msg.sender == identity.guardian, "Only guardian can link documents");
        
        identityDocuments[_identityHash].push(Document({
            documentType: _documentType,
            ipfsHash: _ipfsHash,
            linkedAt: block.timestamp,
            isVerified: false
        }));
        
        emit DocumentLinked(_identityHash, _documentType, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Verify a document (to be called by authorized verifiers)
     * @param _identityHash Identity hash
     * @param _documentIndex Index of document in the array
     */
    function verifyDocument(
        bytes32 _identityHash,
        uint256 _documentIndex
    ) external {
        require(identityExists[_identityHash], "Identity does not exist");
        require(_documentIndex < identityDocuments[_identityHash].length, "Invalid document index");
        
        identityDocuments[_identityHash][_documentIndex].isVerified = true;
        
        emit DocumentVerified(
            _identityHash,
            identityDocuments[_identityHash][_documentIndex].documentType,
            block.timestamp
        );
    }
    
    /**
     * @dev Get identity details
     * @param _identityHash Identity hash
     */
    function getIdentity(bytes32 _identityHash) 
        external 
        view 
        returns (
            bytes32 identityHash,
            string memory did,
            address guardian,
            IdentityType idType,
            uint256 createdAt,
            bool isActive,
            string memory ipfsDataHash
        ) 
    {
        require(identityExists[_identityHash], "Identity does not exist");
        Identity memory identity = identities[_identityHash];
        
        return (
            identity.identityHash,
            identity.did,
            identity.guardian,
            identity.idType,
            identity.createdAt,
            identity.isActive,
            identity.ipfsDataHash
        );
    }
    
    /**
     * @dev Get all documents linked to an identity
     * @param _identityHash Identity hash
     */
    function getDocuments(bytes32 _identityHash) 
        external 
        view 
        returns (Document[] memory) 
    {
        require(identityExists[_identityHash], "Identity does not exist");
        return identityDocuments[_identityHash];
    }
}
