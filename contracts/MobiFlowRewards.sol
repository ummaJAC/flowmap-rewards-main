// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MobiFlowRewards
 * @dev A DePIN reward contract for the MobiFlow protocol.
 *      Users earn MobiPoints (MP) by photographing and verifying 
 *      real-world businesses. The AI Oracle validates photos off-chain,
 *      and this contract records verified submissions on the Flow blockchain.
 */
contract MobiFlowRewards {
    // --- State Variables ---
    address public owner;

    struct Submission {
        address explorer;
        string  ipfsCid;       // IPFS Content ID of the verified photo
        uint256 lat;           // Latitude  * 1e6 (e.g., 52523000 = 52.523000)
        uint256 lng;           // Longitude * 1e6 (e.g., 13402500 = 13.402500)
        uint256 reward;        // MP tokens awarded
        uint256 timestamp;
    }

    mapping(address => uint256) public balances;      // MP balances
    mapping(address => uint256) public strikes;       // Failed validation count
    mapping(address => uint256) public totalEarned;   // Lifetime earnings
    
    Submission[] public submissions;                  // All verified submissions
    uint256 public totalSubmissions;

    // --- Events (for Flowscan Explorer visibility) ---
    event RewardDistributed(
        address indexed explorer,
        uint256 reward,
        string  ipfsCid,
        uint256 lat,
        uint256 lng,
        uint256 timestamp
    );

    event StrikeIssued(
        address indexed explorer,
        uint256 totalStrikes
    );

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner (AI Oracle backend) can call");
        _;
    }

    // --- Constructor ---
    constructor() {
        owner = msg.sender;
    }

    // --- Core Functions ---

    /**
     * @dev Called by the backend when AI Oracle verifies a photo as valid.
     * @param _explorer  Address of the user who took the photo
     * @param _ipfsCid   IPFS CID of the stored photo
     * @param _lat       Latitude * 1e6
     * @param _lng       Longitude * 1e6
     * @param _reward    Amount of MP to award
     */
    function distributeReward(
        address _explorer,
        string calldata _ipfsCid,
        uint256 _lat,
        uint256 _lng,
        uint256 _reward
    ) external onlyOwner {
        require(_explorer != address(0), "Invalid explorer address");
        require(_reward > 0, "Reward must be > 0");

        balances[_explorer] += _reward;
        totalEarned[_explorer] += _reward;

        submissions.push(Submission({
            explorer:  _explorer,
            ipfsCid:   _ipfsCid,
            lat:       _lat,
            lng:       _lng,
            reward:    _reward,
            timestamp: block.timestamp
        }));

        totalSubmissions++;

        emit RewardDistributed(
            _explorer,
            _reward,
            _ipfsCid,
            _lat,
            _lng,
            block.timestamp
        );
    }

    /**
     * @dev Called by the backend when AI Oracle rejects a photo.
     * @param _explorer Address of the user who submitted invalid photo
     */
    function issueStrike(address _explorer) external onlyOwner {
        strikes[_explorer]++;
        emit StrikeIssued(_explorer, strikes[_explorer]);
    }

    // --- View Functions ---

    function getBalance(address _explorer) external view returns (uint256) {
        return balances[_explorer];
    }

    function getStrikes(address _explorer) external view returns (uint256) {
        return strikes[_explorer];
    }

    function getSubmission(uint256 _index) external view returns (Submission memory) {
        require(_index < submissions.length, "Index out of range");
        return submissions[_index];
    }

    function getExplorerStats(address _explorer) external view returns (
        uint256 balance,
        uint256 strikeCount,
        uint256 lifetime
    ) {
        return (balances[_explorer], strikes[_explorer], totalEarned[_explorer]);
    }
}
