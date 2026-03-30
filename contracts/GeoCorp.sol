// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GeoCorp
 * @dev A GameFi/DePIN smart contract for the GeoCorp protocol on Flow EVM.
 *      Players capture real-world buildings by photographing them. 
 *      Each captured building is minted as an ERC721 NFT with IPFS-backed proof.
 *      NFTs generate passive $GEO yield. Players can trade properties on-chain.
 *
 *      Tracks: Flow (Consumer DeFi), Protocol Labs (DePIN/Crypto), Fresh Code
 */
contract GeoCorp {

    // ============================
    // ERC721 Core (Minimal Inline)
    // ============================
    string public name = "GeoCorp Property";
    string public symbol = "GPROP";

    uint256 private _nextTokenId = 1;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balanceOf;
    mapping(uint256 => address) private _tokenApprovals;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Zero address");
        return _balanceOf[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address o = _owners[tokenId];
        require(o != address(0), "Token does not exist");
        return o;
    }

    function approve(address to, uint256 tokenId) external {
        address o = ownerOf(tokenId);
        require(msg.sender == o, "Not owner");
        _tokenApprovals[tokenId] = to;
        emit Approval(o, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenApprovals[tokenId];
    }

    function _mint(address to) internal returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _balanceOf[to]++;
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Not owner");
        require(to != address(0), "Zero address");
        delete _tokenApprovals[tokenId];
        _balanceOf[from]--;
        _balanceOf[to]++;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    // ============================
    // GeoCorp Game Logic
    // ============================
    address public oracle;  // Backend AI Oracle (only this address can mint)

    // Building categories with different yield rates
    enum BuildingType { Cafe, Restaurant, Shop, Office, Gas, Park, Hotel, Mall, Gym, Other }

    struct Property {
        address  owner;
        string   ipfsCid;         // IPFS CID of the verified photo (via Pinata)
        int256   lat;             // Latitude  * 1e6 (signed for negative coords)
        int256   lng;             // Longitude * 1e6
        BuildingType buildingType;
        uint256  dailyYield;      // GEO tokens earned per day
        uint256  capturedAt;      // Timestamp of capture
        uint256  lastClaimed;     // Last yield claim timestamp
        bool     forSale;         // Listed on marketplace?
        uint256  salePrice;       // Price in GEO if listed
    }

    mapping(uint256 => Property) public properties;  // tokenId => Property
    mapping(address => uint256) public geoBalance;    // $GEO token balance
    mapping(address => uint256) public totalEarned;   // Lifetime GEO earned
    mapping(address => uint256) public strikes;       // Failed validation count
    mapping(address => uint256[]) public playerProperties; // Player's owned token IDs

    // H3-style district tracking (simplified: location hash => owner count)
    mapping(bytes32 => mapping(address => uint256)) public districtCount;  // district => player => count

    uint256 public totalProperties;
    uint256 public totalGeoMinted;

    // Daily yield rates per building type (in GEO tokens)
    mapping(BuildingType => uint256) public yieldRates;

    // ============================
    // Events
    // ============================
    event PropertyCaptured(
        uint256 indexed tokenId,
        address indexed owner,
        string ipfsCid,
        int256 lat,
        int256 lng,
        BuildingType buildingType,
        uint256 dailyYield,
        uint256 timestamp
    );

    event YieldClaimed(
        address indexed player,
        uint256 totalYield,
        uint256 propertiesCount
    );

    event PropertyListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event PropertySold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event PropertyDelisted(uint256 indexed tokenId);

    event StrikeIssued(address indexed player, uint256 totalStrikes);

    // ============================
    // Modifiers
    // ============================
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only AI Oracle can call");
        _;
    }

    // ============================
    // Constructor
    // ============================
    constructor() {
        oracle = msg.sender;

        // Set yield rates (GEO per day)
        yieldRates[BuildingType.Cafe]       = 10;
        yieldRates[BuildingType.Restaurant] = 15;
        yieldRates[BuildingType.Shop]       = 12;
        yieldRates[BuildingType.Office]     = 20;
        yieldRates[BuildingType.Gas]        = 8;
        yieldRates[BuildingType.Park]       = 5;
        yieldRates[BuildingType.Hotel]      = 25;
        yieldRates[BuildingType.Mall]       = 30;
        yieldRates[BuildingType.Gym]        = 14;
        yieldRates[BuildingType.Other]      = 7;
    }

    // ============================
    // Core: Capture a Building (Mint NFT)
    // ============================
    /**
     * @dev Called by the backend after AI Oracle approves a photo.
     *      Mints an ERC721 NFT representing the captured building.
     * @param _player      Address of the player who captured the building
     * @param _ipfsCid     IPFS CID of the photo (uploaded via Pinata)
     * @param _lat         Latitude * 1e6 (signed)
     * @param _lng         Longitude * 1e6 (signed)
     * @param _buildingType Category of the building (0-9)
     */
    function captureProperty(
        address _player,
        string calldata _ipfsCid,
        int256 _lat,
        int256 _lng,
        uint8 _buildingType
    ) external onlyOracle returns (uint256) {
        require(_player != address(0), "Invalid player");
        require(_buildingType <= uint8(BuildingType.Other), "Invalid building type");

        BuildingType bType = BuildingType(_buildingType);
        uint256 dailyYield = yieldRates[bType];

        // Mint the NFT
        uint256 tokenId = _mint(_player);

        // Store property data
        properties[tokenId] = Property({
            owner: _player,
            ipfsCid: _ipfsCid,
            lat: _lat,
            lng: _lng,
            buildingType: bType,
            dailyYield: dailyYield,
            capturedAt: block.timestamp,
            lastClaimed: block.timestamp,
            forSale: false,
            salePrice: 0
        });

        playerProperties[_player].push(tokenId);
        totalProperties++;

        // Give a small instant capture bonus (50 GEO)
        geoBalance[_player] += 50;
        totalEarned[_player] += 50;
        totalGeoMinted += 50;

        // Track district ownership
        bytes32 district = _getDistrict(_lat, _lng);
        districtCount[district][_player]++;

        emit PropertyCaptured(
            tokenId, _player, _ipfsCid,
            _lat, _lng, bType, dailyYield, block.timestamp
        );

        return tokenId;
    }

    // ============================
    // Core: Claim Passive Yield
    // ============================
    /**
     * @dev Player claims accumulated yield from ALL their properties.
     *      Yield = sum of (dailyYield * days since last claim) for each property.
     */
    function claimYield() external returns (uint256) {
        uint256[] storage tokenIds = playerProperties[msg.sender];
        require(tokenIds.length > 0, "No properties owned");

        uint256 totalYield = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            Property storage prop = properties[tokenId];

            // Only count properties still owned by the caller
            if (prop.owner == msg.sender) {
                uint256 elapsed = block.timestamp - prop.lastClaimed;
                uint256 yield_ = (prop.dailyYield * elapsed) / 1 days;

                if (yield_ > 0) {
                    totalYield += yield_;
                    prop.lastClaimed = block.timestamp;
                }
            }
        }

        require(totalYield > 0, "No yield to claim");

        geoBalance[msg.sender] += totalYield;
        totalEarned[msg.sender] += totalYield;
        totalGeoMinted += totalYield;

        emit YieldClaimed(msg.sender, totalYield, tokenIds.length);
        return totalYield;
    }

    // ============================
    // Marketplace: List for Sale
    // ============================
    function listForSale(uint256 _tokenId, uint256 _price) external {
        require(ownerOf(_tokenId) == msg.sender, "Not owner");
        require(_price > 0, "Price must be > 0");

        properties[_tokenId].forSale = true;
        properties[_tokenId].salePrice = _price;

        emit PropertyListed(_tokenId, msg.sender, _price);
    }

    // ============================
    // Marketplace: Cancel Listing
    // ============================
    function delistProperty(uint256 _tokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Not owner");

        properties[_tokenId].forSale = false;
        properties[_tokenId].salePrice = 0;

        emit PropertyDelisted(_tokenId);
    }

    // ============================
    // Marketplace: Buy Property
    // ============================
    /**
     * @dev Buy a listed property using GEO tokens.
     *      5% fee goes to the protocol (oracle address).
     */
    function buyProperty(uint256 _tokenId) external {
        Property storage prop = properties[_tokenId];
        require(prop.forSale, "Not for sale");

        address seller = ownerOf(_tokenId);
        require(seller != msg.sender, "Cannot buy own property");

        uint256 price = prop.salePrice;
        require(geoBalance[msg.sender] >= price, "Insufficient GEO");

        // Calculate 5% fee
        uint256 fee = price / 20;
        uint256 sellerAmount = price - fee;

        // Transfer GEO
        geoBalance[msg.sender] -= price;
        geoBalance[seller] += sellerAmount;
        geoBalance[oracle] += fee;  // Protocol revenue

        // Transfer NFT
        _transfer(seller, msg.sender, _tokenId);

        // Update property metadata
        prop.owner = msg.sender;
        prop.forSale = false;
        prop.salePrice = 0;
        prop.lastClaimed = block.timestamp; // Reset yield timer on transfer

        // Update player property arrays
        playerProperties[msg.sender].push(_tokenId);
        _removeFromArray(playerProperties[seller], _tokenId);

        // Update district tracking
        bytes32 district = _getDistrict(prop.lat, prop.lng);
        districtCount[district][seller]--;
        districtCount[district][msg.sender]++;

        emit PropertySold(_tokenId, seller, msg.sender, price);
    }

    // ============================
    // Strikes (Failed Validations)
    // ============================
    function issueStrike(address _player) external onlyOracle {
        strikes[_player]++;
        emit StrikeIssued(_player, strikes[_player]);
    }

    // ============================
    // View Functions
    // ============================
    function getProperty(uint256 _tokenId) external view returns (Property memory) {
        require(_owners[_tokenId] != address(0), "Property does not exist");
        return properties[_tokenId];
    }

    function getPlayerProperties(address _player) external view returns (uint256[] memory) {
        return playerProperties[_player];
    }

    function getPlayerStats(address _player) external view returns (
        uint256 propertyCount,
        uint256 geoTokens,
        uint256 lifetimeEarned,
        uint256 strikeCount
    ) {
        return (
            _balanceOf[_player],
            geoBalance[_player],
            totalEarned[_player],
            strikes[_player]
        );
    }

    function getPendingYield(address _player) external view returns (uint256) {
        uint256[] storage tokenIds = playerProperties[_player];
        uint256 pending = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            Property storage prop = properties[tokenIds[i]];
            if (prop.owner == _player) {
                uint256 elapsed = block.timestamp - prop.lastClaimed;
                pending += (prop.dailyYield * elapsed) / 1 days;
            }
        }
        return pending;
    }

    function getDistrictCount(int256 _lat, int256 _lng, address _player) external view returns (uint256) {
        bytes32 district = _getDistrict(_lat, _lng);
        return districtCount[district][_player];
    }

    function getMarketListings(uint256 _start, uint256 _count) external view returns (
        uint256[] memory tokenIds,
        uint256[] memory prices,
        address[] memory sellers
    ) {
        // Count total listings first
        uint256 total = 0;
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (properties[i].forSale) total++;
        }

        uint256 resultCount = _count;
        if (_start + _count > total) {
            resultCount = total > _start ? total - _start : 0;
        }

        tokenIds = new uint256[](resultCount);
        prices = new uint256[](resultCount);
        sellers = new address[](resultCount);

        uint256 found = 0;
        uint256 added = 0;
        for (uint256 i = 1; i < _nextTokenId && added < resultCount; i++) {
            if (properties[i].forSale) {
                if (found >= _start) {
                    tokenIds[added] = i;
                    prices[added] = properties[i].salePrice;
                    sellers[added] = ownerOf(i);
                    added++;
                }
                found++;
            }
        }

        return (tokenIds, prices, sellers);
    }

    // ============================
    // Internal Helpers
    // ============================

    /**
     * @dev Simple district hashing: groups locations into ~1km² cells.
     *      Uses integer division to "snap" coordinates to a grid.
     *      Resolution: ~0.01 degrees ≈ 1.1km at equator.
     */
    function _getDistrict(int256 _lat, int256 _lng) internal pure returns (bytes32) {
        // Divide by 10000 (since coords are *1e6, this gives ~0.01 degree resolution)
        int256 gridLat = _lat / 10000;
        int256 gridLng = _lng / 10000;
        return keccak256(abi.encodePacked(gridLat, gridLng));
    }

    function _removeFromArray(uint256[] storage arr, uint256 value) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                return;
            }
        }
    }
}
