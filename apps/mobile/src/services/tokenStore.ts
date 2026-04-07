/**
 * In-memory token store.
 *
 * The token is held here after login/session restore.
 * SecureStore is only used for persistence across app restarts.
 * The interceptor reads from here — synchronously, no async needed.
 */

let _token: string | null = null;

export const tokenStore = {
  set(token: string | null) {
    _token = token;
  },

  get(): string | null {
    return _token;
  },

  clear() {
    _token = null;
  },
};
