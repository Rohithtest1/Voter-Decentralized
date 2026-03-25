// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        bool active;
        uint256[] candidateIds;
    }

    address public admin;
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public nextCandidateId;
    uint256 public nextElectionId;

    event ElectionCreated(uint256 indexed electionId, string title);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId);
    event ElectionClosed(uint256 indexed electionId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createElection(string memory _title) public onlyAdmin {
        uint256 electionId = nextElectionId++;
        elections[electionId].id = electionId;
        elections[electionId].title = _title;
        elections[electionId].active = true;
        emit ElectionCreated(electionId, _title);
    }

    function addCandidate(uint256 _electionId, string memory _name, string memory _party) public onlyAdmin {
        require(elections[_electionId].active, "Election is not active");
        uint256 candidateId = nextCandidateId++;
        candidates[candidateId] = Candidate(candidateId, _name, _party, 0);
        elections[_electionId].candidateIds.push(candidateId);
        emit CandidateAdded(_electionId, candidateId, _name);
    }

    function vote(uint256 _electionId, uint256 _candidateId) public {
        require(elections[_electionId].active, "Election is not active");
        require(!hasVoted[_electionId][msg.sender], "You have already voted in this election");
        
        candidates[_candidateId].voteCount++;
        hasVoted[_electionId][msg.sender] = true;
        
        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    function closeElection(uint256 _electionId) public onlyAdmin {
        elections[_electionId].active = false;
        emit ElectionClosed(_electionId);
    }

    function getCandidate(uint256 _id) public view returns (uint256, string memory, string memory, uint256) {
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.party, c.voteCount);
    }

    function getElectionCandidates(uint256 _electionId) public view returns (uint256[] memory) {
        return elections[_electionId].candidateIds;
    }
}
