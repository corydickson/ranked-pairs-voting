# Ranked Pairs Voting Contract

## Definition

A ranked pair ballot selects a winner amongst a list of preferences. It generates a sorted list of winners and ensures that at least one candidate wins
amongst all the possible choices.

The procedure in the traditional system are as follows:

  1. Tally the scored preferences for each candidate, and compare each pair of candidates (choices) to determine the winner of each pair.
  2. Sort (rank) each pair by the largest strength of victory first to smallest last.
  3. "Lock in" each pair, begining with the one with the largest amount of votes (weighted scoring), and add one to create a DAG in which the root node is the winner.

RP can also be used to create a sorted list of preferred candidates. To create a sorted list, repeatedly use RP to select a winner, remove that winner from the list of
candidates, and repeat (to find the next runner up, and so forth).

-- Source [Wikipedia](https://en.wikipedia.org/wiki/Ranked_pairs)

## Implementation

The goal here is to have NFTs used to represent a users' ticket into the election. If an ethereum address has a valid token then they will be able to participate by submitting
their scored preferences from a predetermined list of choices on a `Ballot`. Once the voting period ends a winner will be annouced from the contracts' event
`AnnounceResult` which will return an ordered list of winners from choices on the ballot.

### Methods

#### Public

- `startElection(startTime, endTime, candidates)`
- `castVote(ballot)`

#### Private

- `collectVotes()`

- `elect`

- `lockPairs`

## Considerations

