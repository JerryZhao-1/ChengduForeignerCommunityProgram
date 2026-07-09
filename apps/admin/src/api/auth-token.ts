const TOKEN_KEY = "community-map-admin-token";

export const adminAuthToken = {
  get() {
    return window.localStorage.getItem(TOKEN_KEY) ?? undefined;
  },
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated() {
    return !!this.get();
  }
};
