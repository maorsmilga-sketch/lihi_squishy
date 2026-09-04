const STORAGE_KEY = "squishy-admin-password";

export function getStoredAdminPassword() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

export function setStoredAdminPassword(password: string) {
  sessionStorage.setItem(STORAGE_KEY, password);
}

export function clearStoredAdminPassword() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function adminFetch(input: string, init: RequestInit = {}) {
  const password = getStoredAdminPassword();
  const headers = new Headers(init.headers);
  headers.set("x-admin-password", password);

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
