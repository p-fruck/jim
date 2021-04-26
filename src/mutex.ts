export default class Mutex {
  private current = Promise.resolve();

  async acquire(): Promise<() => void> {
    let release: () => void;
    const next = new Promise<void>(resolve => {
      release = () => { resolve(); };
    });
    const waiter = this.current.then(() => release);
    this.current = next;
    return await waiter;
  }
}
