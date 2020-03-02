pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";


contract RPVoting {
  using SafeMath for uint256;

  address public owner; // Address of the that deployed the election
  uint256 public beginTime; // Timestamp of when the election started
  uint256 public votingDuration; // The duration of the election for voters to cast their ballot. Default:
  address[] public candidates; // List of candidates on the ballot for the election
  address[] public voters; // List of all possible voters
  mapping (address => bool) public canVote; // Addresses who are able to cast a vote
  mapping (address => bool) public hasVoted; // Status of addressed who have casted their votes
  mapping (address => uint256[]) private ballots; // All the ballots from approved voters. Can be revealed after the votingDuration expiry

  uint256 constant MAX_VOTING_PERIOD_LENGTH = 10**18; // Maximum length of voting period
  uint256 constant MIN_NUM_CANDIDATES = 3; // Minimum number of candidates on the ballot
  uint256 constant MAX_NUM_CANDIDATES = 10; // Maximum number of candidates so we don't run out of gas

  mapping (address => uint256[]) private results;

  event BeginElection(address indexed owner, uint256 startTime, uint256 duration, address[] candidates);
  event CastVote(address indexed voter, uint256 when, uint256[] rankings);
  event EndElection(uint256 endTime);

  modifier onlyOwner() {
    require(msg.sender == owner, "Error: sender is not the owner of the election");
    _;
  }

  modifier onlyAuthorized() {
    require(canVote[msg.sender], "Error: sender does not have permission to vote");
    _;
  }

  modifier onElectionEnd() {
    require(now > (SafeMath.add(beginTime, votingDuration)), "the election has not ended");
    _;
  }

  constructor(
    address _owner,
    uint256 _duration,
    address[] memory _authorized,
    address[] memory _candidates
  ) public {
    require(_owner != address(0), "_owner cannot be null");
    require(_duration > 0, "_duration cannot be zero");
    require(_duration <= MAX_VOTING_PERIOD_LENGTH, "_duration exceeds limit");
    require(_candidates.length >= MIN_NUM_CANDIDATES, "_candidates must be greater than the minimum (3)");

    emit BeginElection(_owner, now, _duration, _candidates);

    for (uint256 i = 0; i < _candidates.length; i++) {
      require(_candidates[i] != address(0), "_candidate cannot be null");
      candidates.push(_candidates[i]);
    }

    for (uint256 i = 0; i < _authorized.length; i++) {
      require(_authorized[i] != address(0), "_authorized address cannot be null");
      canVote[_authorized[i]] = true;
      voters.push(_authorized[i]);
    }

    owner = _owner;
    votingDuration = _duration;
    beginTime = now;
  }

  function castVote(uint256[] memory _rankings) public onlyAuthorized {
    require(now < (SafeMath.add(beginTime,votingDuration)), "election has ended");
    require(_rankings.length == candidates.length, "all candidates must have a ranking");
    require(_rankings.length <= MAX_NUM_CANDIDATES, "ranking exceeds limit");
    require(hasVoted[msg.sender] == false, "address has already submitted vote");

    uint256[] memory unique = new uint256[](MAX_NUM_CANDIDATES);

    for (uint256 i = 0; i < _rankings.length; i++) {
      require(_rankings[i] != 0, "ranking must be greater than one");
      require(_rankings[i] <= _rankings.length, "ranking must be within range");

      if (i == 0) {
        unique[i] = _rankings[i];
      } else {
        for (uint256 j = i+1; j < unique.length - 1; j++) {
          require(_rankings[i] != unique[j], "rankings must be unique");
          unique[j] = _rankings[i];
        }
      }
    }

    ballots[msg.sender] = _rankings;
    for (uint256 i = 0; i < _rankings.length; i++) {
      results[candidates[i]].push(_rankings[i]);
    }
    emit CastVote(msg.sender, now, _rankings);
  }

  function announceWinner() public onlyOwner onElectionEnd {
    emit EndElection(now);
  }

  function getResults(address candidate) public onElectionEnd view returns(uint256[] memory) {
    return results[candidate];
  }

  function getBallot() public view onlyAuthorized returns(uint256[] memory) {
    return ballots[msg.sender];
  }
}

