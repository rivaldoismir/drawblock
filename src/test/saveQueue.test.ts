import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SaveConflictError, SaveQueue } from "../services/saveQueue";
import type { SaveStatus } from "../types";

interface Harness {
  queue: SaveQueue;
  writes: Array<{ path: string; text: string; expected: number }>;
  statuses: SaveStatus[];
  conflicts: string[];
}

function createHarness(
  writeImpl?: (path: string, text: string, expected: number) => Promise<number>,
): Harness {
  const writes: Harness["writes"] = [];
  const statuses: SaveStatus[] = [];
  const conflicts: string[] = [];
  let clock = 1;
  const queue = new SaveQueue({
    write: async (path, text, expected) => {
      writes.push({ path, text, expected });
      if (writeImpl) {
        return writeImpl(path, text, expected);
      }
      clock += 1;
      return clock;
    },
    forceWrite: async (path, text) => {
      writes.push({ path, text, expected: -1 });
      clock += 1;
      return clock;
    },
    onStatus: (status) => statuses.push(status),
    onConflict: (path) => conflicts.push(path),
  });
  return { queue, writes, statuses, conflicts };
}

describe("SaveQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces rapid changes into one write", async () => {
    const harness = createHarness();
    harness.queue.setBaseline("a.md", 1);
    harness.queue.schedule("a.md", "one", 1200);
    harness.queue.schedule("a.md", "two", 1200);
    await vi.advanceTimersByTimeAsync(1200);
    await harness.queue.flush("a.md");
    expect(harness.writes).toHaveLength(1);
    expect(harness.writes[0]?.text).toBe("two");
  });

  it("serializes writes for the same path and keeps the newest text", async () => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const harness = createHarness(async () => {
      await gate;
      return 99;
    });
    harness.queue.setBaseline("a.md", 1);
    harness.queue.schedule("a.md", "first", 0);
    await vi.advanceTimersByTimeAsync(0);
    harness.queue.schedule("a.md", "second", 0);
    await vi.advanceTimersByTimeAsync(0);
    expect(harness.writes).toHaveLength(1);
    release();
    await harness.queue.flush("a.md");
    expect(harness.writes.map((write) => write.text)).toEqual(["first", "second"]);
  });

  it("writes different paths in parallel", async () => {
    const harness = createHarness();
    harness.queue.setBaseline("a.md", 1);
    harness.queue.setBaseline("b.md", 2);
    harness.queue.schedule("a.md", "a", 0);
    harness.queue.schedule("b.md", "b", 0);
    await vi.advanceTimersByTimeAsync(0);
    await harness.queue.flush();
    expect(harness.writes.map((write) => write.path).sort()).toEqual(["a.md", "b.md"]);
  });

  it("raises a conflict instead of overwriting", async () => {
    const harness = createHarness(async () => {
      throw new SaveConflictError("a.md");
    });
    harness.queue.setBaseline("a.md", 1);
    harness.queue.schedule("a.md", "draft", 0);
    await vi.advanceTimersByTimeAsync(0);
    await harness.queue.flush("a.md");
    expect(harness.conflicts).toEqual(["a.md"]);
    expect(harness.queue.hasConflict("a.md")).toBe(true);
    expect(harness.statuses).toContain("error");
  });

  it("force writes the conflicted payload", async () => {
    const harness = createHarness(async () => {
      throw new SaveConflictError("a.md");
    });
    harness.queue.setBaseline("a.md", 1);
    harness.queue.schedule("a.md", "draft", 0);
    await vi.advanceTimersByTimeAsync(0);
    await harness.queue.flush("a.md");
    await harness.queue.forceWrite("a.md");
    expect(harness.writes).toHaveLength(2);
    expect(harness.writes[1]).toEqual({ path: "a.md", text: "draft", expected: -1 });
  });

  it("discard drops pending changes", async () => {
    const harness = createHarness();
    harness.queue.setBaseline("a.md", 1);
    harness.queue.schedule("a.md", "draft", 1200);
    harness.queue.discard("a.md");
    await vi.advanceTimersByTimeAsync(2000);
    await harness.queue.flush();
    expect(harness.writes).toHaveLength(0);
    expect(harness.queue.hasPending()).toBe(false);
  });
});
