pragma solidity ^0.5.0;

interface IRPVoting {
  function announceWinner() external;
  function getResults() external view returns(uint256[] memory);
  function getBallot() external view returns(uint256[] memory);
  event BeginElection(address indexed owner, uint256 startTime, uint256 duration, address[] candidates);
  event CastVote(address indexed voter, uint256 when, uint256[] rankings);
  event EndElection(uint256 endTime);
}
