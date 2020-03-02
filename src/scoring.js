/**
 * Runs a single election where a list of candidates are given in the order of victory
 * @param candidates Array of candidates in the election
 * @param ballots A mapping of candidate addresses to ballots generated from the smart contract
 * @returns [candidate] Array of candidates of in order of victory
 *
 * Sourced from wikipedia
 */
export default function elect(candidates, ballots) {
  let graph = {};
  let Gfinal = {};
  let scores = {};
  let majorities = [];

  if (!candidates.length) {
    return [];
  }

  candidates.map(addr => {
    Gfinal[addr] = [];
    let count = 0;
    scores[addr] = ballots[addr].reduce(x => count += x);
  });

  candidates.forEach(xCID => {
    let Vx = graph[xCID] = {};
    candidates.forEach(yCID => {
      if (yCID != xCID) {
        Vx[yCID] = (scores[xCID] < scores[yCID] ? 1 : 0)
        majorities.push({x: xCID, y: yCID, Vxy: Vx[yCID]});
      }
    });
  });

  majorities.sort(function (m1, m2) {
    let x = m1.x, y = m1.y, z = m2.x, w = m2.y;
    let diff = m1.Vxy - m2.Vxy //Vxy - Vzw

    if (diff > 0) return 1;
    if (diff == 0) return graph[w][z] - graph[y][x]; // Vwz > Vyx Smaller minority opposition (now wz and yz)
    return -1;
  }).reverse();

  const reachable = (from, to) => {
    let nFrom = Gfinal[from];
    return nFrom.some(neighbor => {
      return neighbor == to || reachable(neighbor, to);
    });
  }

  majorities.forEach(m => {
    // if x is reachable from y, then x->y would create a circle
    if (!reachable(m.y, m.x)) {
      (Gfinal[m.x] = Gfinal[m.x] || []).push(m.y);
    }
  });

  let winners = candidates.filter(candidate => {
    return candidates.every(neighbor => { // not reachable from every candidate.
      return Gfinal[neighbor].indexOf(candidate) === -1;
    });
  });

  return winners;
}
