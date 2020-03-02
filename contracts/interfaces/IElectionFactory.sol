pragma solidity 0.5.13;

interface IElectionFactory {
  function generateElection(address[] calldata, uint256, address) external returns (address);
}
