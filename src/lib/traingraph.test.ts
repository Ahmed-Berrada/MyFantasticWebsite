import { describe, expect, it } from "vitest";
import { TrainGraph } from "./traingraph";

describe("TrainGraph", () => {
  it("builds monotone schedules that visit every station", () => {
    const g = new TrainGraph(3);
    g.schedule(0);
    expect(g.trains.length).toBeGreaterThan(10);
    for (const tr of g.trains) {
      for (let i = 1; i < tr.path.length; i++) expect(tr.path[i].t).toBeGreaterThanOrEqual(tr.path[i - 1].t);
      const ys = new Set(tr.path.map((w) => w.y));
      expect(ys.size).toBe(g.stations.length);
    }
  });

  it("reports dwell and run states consistently with position", () => {
    const g = new TrainGraph(5);
    g.schedule(0);
    const tr = g.trains[0];
    const [a, b, c] = tr.path; // depart, arrive at station 2, leave station 2
    const mid = (a.t + b.t) / 2;
    expect(g.stateAt(tr, mid)).toMatchObject({ kind: "run", nextStation: tr.dir === 1 ? 2 : g.stations.length - 1 });
    expect(g.stateAt(tr, (b.t + c.t) / 2)?.kind).toBe("dwell");
    expect(g.positionAt(tr, (b.t + c.t) / 2)).toBeCloseTo(b.y, 10);
  });

  it("prunes finished trains", () => {
    const g = new TrainGraph(9);
    g.schedule(0);
    const before = g.trains.length;
    g.prune(-500);
    expect(g.trains.length).toBeLessThan(before);
  });
});
