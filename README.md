# Ranked Pairs Voting

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

The `rank` for each corresponding `candidates` in the array share the same index. Let `V` be defined as the range of integers: (0, length(`candidates`)]:
For each integer value `x_i, x_j` in `V`, where `i,j` is an index of an element in the array, for all `i,j` where `i != j --> x_i != x_j`

## Considerations

There are flaws with ranked voting in which public disclosure might actually mitigate the disadvantages layed out here. Namely, if we assume that this system exists in a state of
nash equilibrium in which all agents of the system have perfect information and there are no winning strategies, then tatical voting could prove to be a non-issue. See below:

An honest voter can cause their candidate to lose the election if they rank their favorite candidate the highest where otherwise they could have stayed home and have their choice win.
Since all votes are being cast publically, an informed honest voter now has the option to choose to not vote rather than being in a situation in which they are not able to know the
state of the election. This is especially true for the contrapositive case in which the worst-candidate would be elected unless they stayed home.
We can provide `view` functions which make it easier for non-developers to have access of the running tally in the election or track emitted events. Furthermore, in this use-case
we are forced to know the size of the electorate so our biggest challenge is mitigating collusion. In the future it'd be nice to airdrop NFT tokens and have that be someone's ticket
to vote.

However, I imagine this being used for small organizations who are already highly coordinated and non-adversarial.

The last most significant flaw is called favorite betrayal criterion. This is when a voter dishonestly ranks their favorite candidate below the top,
causing a "lesser-evil" candidate to win the election. Again, in a system in which we can model the possible outcomes in real-time, it's disadvantageous to vote dishonestly.
