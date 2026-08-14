import { env } from "@/src/config/env";

const apiBaseUrl = (env.apiBaseUrl || "http://localhost:8080/api").replace(/\/$/, "");

let refreshPromise: Promise<boolean> | null = null;

function refreshSession() {
  if (refreshPromise === null) {
    refreshPromise = fetch(`${apiBaseUrl}/auth/refresh/cookie`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function authenticatedFetch(url: string, init?: RequestInit) {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  const response = await fetch(url, requestInit);
  if (response.status !== 401) return response;

  const refreshed = await refreshSession();
  if (!refreshed) return response;

  return fetch(url, requestInit);
}
