import { expect } from 'chai';
import { BigNumber } from 'bignumber.js';
import elect from '../src/scoring';
import assertRevert from './helpers/assertRevert';
import expectEvent from './helpers/expectEvent';

const RPVoting = artifacts.require('./RPVoting.sol');
const DEFAULT_GAS_PRICE = 1e11; // 100 Shannon

function formatVotes(result) {
  return result.map((x) => new BigNumber(x).toNumber());
}

contract('RPVoting', (accounts) => {
  let voting;
  let owner = accounts[0];
  let voter1 = accounts[1];
  let voter2 = accounts[2];
  let voter3 = accounts[3];
  let voter4 = accounts[4];
  const candidates = [voter1, voter2, voter3];
  const authorizedVoters = [voter1, voter2, voter3, voter4];

  async function runMockElection(voting) {
    // Note: this test assumes votes are cast in sequential order, obviously we cannot guarentee the order of transactions irl
    const rank1 = [2,3,1];
    const rank2 = [1,2,3];
    const rank3 = [3,1,2];

    await voting.castVote(rank1, { from: voter1 });
    await voting.castVote(rank2, { from: voter2 });
    await voting.castVote(rank3, { from: voter3 });
    await voting.castVote(rank1, { from: voter4 });
    const block = await web3.eth.getBlock('latest');

    await web3.currentProvider.send({ jsonrpc: "2.0", method: 'evm_increaseTime', params: [block.timestamp + 10e12], id: 123 }, () =>{});
    await web3.currentProvider.send({ jsonrpc: "2.0", method: 'evm_mine', params: [], id: 123 }, () => {});

    const expectedResults = [];
    expectedResults[`${candidates[0]}`] = [2,1,3,2];
    expectedResults[`${candidates[1]}`] = [3,2,1,3];
    expectedResults[`${candidates[2]}`] = [1,3,2,1];

    return expectedResults;
  }

  beforeEach(async () => {
    voting = await RPVoting.new(accounts[0], 10*12, authorizedVoters, candidates, { from: accounts[0] });
  });

  it('should revert if provided ranking contains a zero', async () => {
    await assertRevert(voting.castVote([0,1,2], { from: voter1 }));
    await assertRevert(voting.castVote([0,0,0], { from: voter2 }));
  });

  it('should revert if ranking contains a repeated ranks', async () => {
    await assertRevert(voting.castVote([1,1,2], { from: voter1 }));
    await assertRevert(voting.castVote([2,2,2], { from: voter2 }));
  });

  it('should revert if ranking contains values that exceed the candidate range', async () => {
    await assertRevert(voting.castVote([6,7,9], { from: voter1 }));
    await assertRevert(voting.castVote([4,2,1], { from: voter2 }));
  });

  it('should be viewable and emit an event after successful submission', async () => {
    const rank = [2,3,1];
    await expectEvent(
      voting.castVote(rank, { from: voter1 }),
      'CastVote',
    );

    let submission = await voting.getBallot({ from: voter1 });
    expect(formatVotes(submission)).to.be.eql(rank);
  });

  it('should revert if someone tries to access the ballout before it ends', async () => {
    await assertRevert(voting.getResults(candidates[0], { from: owner }));
  });

  it('should return the list of rankings from each voter for a given candidate', async () => {
    const expectedResults = await runMockElection(voting);
    await expectEvent(
      voting.announceWinner({ from: owner }),
      'EndElection',
    );
    for (let i = 0; i < expectedResults.length; i++) {
      const ranking = await voting.getResults(candidates[i], { from: voter1 });
      expect(formatVotes(ranking)).to.be.eql(expectedResults[candidates[i]]);
    }
  });

  it('should revert if the owner tries to end the election without time passed', async () => {
    await assertRevert(voting.announceWinner({ from: owner }));
  });

  it('should generate a graph of results', async () => {
    const ballots = await runMockElection(voting);
    const winners = elect(candidates, ballots);
    expect(winners[0]).to.be.eql(candidates[2]);
  });
});

