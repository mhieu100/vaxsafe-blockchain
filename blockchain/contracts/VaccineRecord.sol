// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VaccineRecord
 * @dev Smart contract for storing immutable vaccine records on blockchain
 * Links to IPFS for detailed off-chain data
 */
contract VaccineRecord {
    
    // Vaccination site enum
    enum VaccinationSite { LEFT_ARM, RIGHT_ARM, LEFT_THIGH, RIGHT_THIGH, ORAL, NASAL }
    
    // Vaccine record structure
    struct Record {
        uint256 recordId;               // Unique record ID
        bytes32 identityHash;           // Patient identity hash
        string vaccineId;               // Vaccine ID
        string vaccineName;             // Vaccine name
        uint256 doseNumber;             // Dose number (1, 2, 3, etc.)
        uint256 vaccinationDate;        // Date of vaccination (timestamp)
        string lotNumber;               // Vaccine lot number
        uint256 expiryDate;             // Vaccine expiry date (timestamp)
        VaccinationSite site;           // Vaccination site on body
        string doctorId;                // Doctor ID
        string doctorName;              // Doctor name
        string centerId;                // Vaccination center ID
        string centerName;              // Vaccination center name
        string appointmentId;           // Related appointment ID
        string notes;                   // Additional notes
        string ipfsHash;                // IPFS hash for detailed data
        uint256 createdAt;              // Creation timestamp
        bool isActive;                  // Active status
    }
    
    // State variables
    uint256 private recordCounter;
    
    // Mappings
    mapping(uint256 => Record) public records;
    mapping(bytes32 => uint256[]) public identityRecords; // All records for an identity
    
    // Events
    event RecordCreated(
        uint256 indexed recordId,
        bytes32 indexed identityHash,
        string vaccineId,
        string vaccineName,
        uint256 doseNumber,
        uint256 vaccinationDate,
        uint256 timestamp
    );
    
    event RecordUpdated(
        uint256 indexed recordId,
        string ipfsHash,
        uint256 timestamp
    );
    
    /**
     * @dev Create a new vaccine record
     */
    function createRecord(
        bytes32 _identityHash,
        string memory _vaccineId,
        string memory _vaccineName,
        uint256 _doseNumber,
        uint256 _vaccinationDate,
        string memory _lotNumber,
        uint256 _expiryDate,
        VaccinationSite _site,
        string memory _doctorId,
        string memory _doctorName,
        string memory _centerId,
        string memory _centerName,
        string memory _appointmentId,
        string memory _notes,
        string memory _ipfsHash
    ) external returns (uint256) {
        require(_identityHash != bytes32(0), "Invalid identity hash");
        require(bytes(_vaccineId).length > 0, "Vaccine ID cannot be empty");
        require(bytes(_vaccineName).length > 0, "Vaccine name cannot be empty");
        require(_doseNumber > 0, "Dose number must be greater than 0");
        require(_vaccinationDate > 0, "Vaccination date must be valid");
        
        recordCounter++;
        uint256 newRecordId = recordCounter;
        
        records[newRecordId] = Record({
            recordId: newRecordId,
            identityHash: _identityHash,
            vaccineId: _vaccineId,
            vaccineName: _vaccineName,
            doseNumber: _doseNumber,
            vaccinationDate: _vaccinationDate,
            lotNumber: _lotNumber,
            expiryDate: _expiryDate,
            site: _site,
            doctorId: _doctorId,
            doctorName: _doctorName,
            centerId: _centerId,
            centerName: _centerName,
            appointmentId: _appointmentId,
            notes: _notes,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp,
            isActive: true
        });
        
        identityRecords[_identityHash].push(newRecordId);
        
        emit RecordCreated(
            newRecordId,
            _identityHash,
            _vaccineId,
            _vaccineName,
            _doseNumber,
            _vaccinationDate,
            block.timestamp
        );
        
        return newRecordId;
    }
    
    /**
     * @dev Get a specific vaccine record
     * @param _recordId Record ID
     */
    function getRecord(uint256 _recordId) 
        external 
        view 
        returns (Record memory) 
    {
        require(_recordId > 0 && _recordId <= recordCounter, "Invalid record ID");
        return records[_recordId];
    }
    
    /**
     * @dev Get all records for a specific identity
     * @param _identityHash Identity hash
     */
    function getRecordsByIdentity(bytes32 _identityHash) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return identityRecords[_identityHash];
    }
    
    /**
     * @dev Update IPFS hash for a record (in case of additional data)
     * @param _recordId Record ID
     * @param _ipfsHash New IPFS hash
     */
    function updateRecordIPFS(uint256 _recordId, string memory _ipfsHash) 
        external 
    {
        require(_recordId > 0 && _recordId <= recordCounter, "Invalid record ID");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        records[_recordId].ipfsHash = _ipfsHash;
        
        emit RecordUpdated(_recordId, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Get total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return recordCounter;
    }
}
