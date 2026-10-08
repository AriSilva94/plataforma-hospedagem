import { useSyncExternalStore } from "react";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readTokenFromLocation(): string {
  const { hash, search } = window.location;
  return (
    new URLSearchParams(hash.slice(1)).get("token") ??
    new URLSearchParams(search).get("token") ??
    ""
  );
}

export function useLinkToken(): string | null {
  return useSyncExternalStore(subscribeToLocation, readTokenFromLocation, () => null);
}
