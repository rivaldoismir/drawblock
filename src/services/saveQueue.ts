import type { SaveStatus } from "../types";

export class SaveConflictError extends Error {
  constructor(path: string) {
    super(`File berubah di luar DrawBlock: ${path}`);
    this.name = "SaveConflictError";
  }
}

type Payload = string | (() => string);

export interface SaveQueueOptions {
  /** Tulis teks; `expectedLastModified` < 0 berarti paksa tulis. */
  write: (path: string, text: string, expectedLastModified: number) => Promise<number>;
  forceWrite: (path: string, text: string) => Promise<number>;
  onStatus: (status: SaveStatus, error: string | null) => void;
  onConflict: (path: string) => void;
}

/**
 * Antrean simpan per path: debounce, serialisasi tulis per file, dan deteksi
 * perubahan dari luar. Path berbeda boleh menulis bersamaan.
 */
export class SaveQueue {
  private payloads = new Map<string, Payload>();
  private conflicts = new Map<string, Payload>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private chains = new Map<string, Promise<void>>();
  private baselines = new Map<string, number>();
  private disposed = false;

  constructor(private readonly options: SaveQueueOptions) {}

  setBaseline(path: string, lastModified: number): void {
    this.baselines.set(path, lastModified);
  }

  getBaseline(path: string): number {
    return this.baselines.get(path) ?? 0;
  }

  schedule(path: string, payload: Payload, delayMs = 1200): void {
    if (this.disposed) {
      return;
    }
    this.payloads.set(path, payload);
    this.conflicts.delete(path);
    const existing = this.timers.get(path);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      this.timers.delete(path);
      void this.enqueue(path);
    }, delayMs);
    this.timers.set(path, timer);
  }

  hasPending(): boolean {
    return this.payloads.size > 0 || this.conflicts.size > 0;
  }

  hasConflict(path: string): boolean {
    return this.conflicts.has(path);
  }

  private enqueue(path: string): Promise<void> {
    const previous = this.chains.get(path) ?? Promise.resolve();
    const next = previous.then(
      () => this.write(path),
      () => this.write(path),
    );
    this.chains.set(path, next);
    void next.finally(() => {
      if (this.chains.get(path) === next) {
        this.chains.delete(path);
      }
    });
    return next;
  }

  private resolvePayload(payload: Payload): string {
    return typeof payload === "function" ? payload() : payload;
  }

  private async write(path: string): Promise<void> {
    const payload = this.payloads.get(path);
    if (payload === undefined) {
      return;
    }
    this.payloads.delete(path);
    const text = this.resolvePayload(payload);
    this.options.onStatus("saving", null);
    try {
      const lastModified = await this.options.write(
        path,
        text,
        this.getBaseline(path),
      );
      this.baselines.set(path, lastModified);
      if (!this.payloads.has(path) && !this.conflicts.has(path)) {
        this.options.onStatus("saved", null);
      }
    } catch (error) {
      if (error instanceof SaveConflictError) {
        this.conflicts.set(path, payload);
        this.options.onConflict(path);
        this.options.onStatus("error", "File berubah di luar DrawBlock.");
        return;
      }
      this.payloads.set(path, payload);
      this.options.onStatus(
        "error",
        error instanceof Error ? error.message : "Gagal menyimpan file.",
      );
    }
  }

  async flush(path?: string): Promise<void> {
    if (path !== undefined) {
      const timer = this.timers.get(path);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(path);
      }
      if (this.payloads.has(path)) {
        await this.enqueue(path);
      }
      await this.chains.get(path);
      return;
    }
    const paths = new Set<string>([
      ...this.timers.keys(),
      ...this.payloads.keys(),
      ...this.chains.keys(),
    ]);
    await Promise.all([...paths].map((item) => this.flush(item)));
  }

  async flushAll(): Promise<void> {
    await this.flush();
  }

  /** Tulis paksa setelah user memilih "Timpa" pada dialog konflik. */
  async forceWrite(path: string): Promise<void> {
    const payload = this.conflicts.get(path) ?? this.payloads.get(path);
    if (payload === undefined) {
      return;
    }
    this.conflicts.delete(path);
    this.payloads.delete(path);
    const text = this.resolvePayload(payload);
    const previous = this.chains.get(path) ?? Promise.resolve();
    const next = previous.then(async () => {
      this.options.onStatus("saving", null);
      try {
        const lastModified = await this.options.forceWrite(path, text);
        this.baselines.set(path, lastModified);
        this.options.onStatus("saved", null);
      } catch (error) {
        this.options.onStatus(
          "error",
          error instanceof Error ? error.message : "Gagal menyimpan file.",
        );
      }
    });
    this.chains.set(path, next);
    await next;
    if (this.chains.get(path) === next) {
      this.chains.delete(path);
    }
  }

  /** Buang perubahan tertunda untuk path (mis. user memilih "Muat ulang"). */
  discard(path: string): void {
    const timer = this.timers.get(path);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(path);
    }
    this.payloads.delete(path);
    this.conflicts.delete(path);
    this.options.onStatus("idle", null);
  }

  dispose(): void {
    this.disposed = true;
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.payloads.clear();
    this.conflicts.clear();
  }
}
