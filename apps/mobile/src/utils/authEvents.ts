// @/utils/authEvents.ts

type AuthEventListener = () => void;

class AuthEventEmitter {
  private listeners: AuthEventListener[] = [];

  onUnauthorized(listener: AuthEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emitUnauthorized(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const authEvents = new AuthEventEmitter();
