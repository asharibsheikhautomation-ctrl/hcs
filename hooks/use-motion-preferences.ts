"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_MOTION_QUERY = "(pointer: coarse), (max-width: 767px)";

interface MediaQueryStore {
  getSnapshot: () => boolean;
  subscribe: (listener: () => void) => () => void;
}

const mediaQueryStores = new Map<string, MediaQueryStore>();

function createMediaQueryStore(query: string): MediaQueryStore {
  if (typeof window === "undefined") {
    return {
      getSnapshot: () => false,
      subscribe: () => () => {},
    };
  }

  const mediaQueryList = window.matchMedia(query);
  const listeners = new Set<() => void>();
  const notifyListeners = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getSnapshot: () => mediaQueryList.matches,
    subscribe: (listener) => {
      listeners.add(listener);

      if (listeners.size === 1) {
        mediaQueryList.addEventListener("change", notifyListeners);
      }

      return () => {
        listeners.delete(listener);

        if (listeners.size === 0) {
          mediaQueryList.removeEventListener("change", notifyListeners);
          mediaQueryStores.delete(query);
        }
      };
    },
  };
}

function getMediaQueryStore(query: string) {
  const existingStore = mediaQueryStores.get(query);

  if (existingStore) {
    return existingStore;
  }

  const store = createMediaQueryStore(query);

  if (typeof window !== "undefined") {
    mediaQueryStores.set(query, store);
  }

  return store;
}

function getMediaQueryServerSnapshot() {
  return false;
}

function useMediaQuery(query: string) {
  const store = getMediaQueryStore(query);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getMediaQueryServerSnapshot,
  );
}

export function useMotionPreferences() {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isMobileViewport = useMediaQuery(MOBILE_MOTION_QUERY);

  return {
    prefersReducedMotion,
    isMobileViewport,
    prefersSimplifiedMotion: prefersReducedMotion,
  };
}
