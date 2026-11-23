"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/** True once the element has entered the viewport (stays true). */
export function useInView<T extends Element>(threshold = 0.2): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

/** True while the element is on screen; used to pause canvas loops off-screen. */
export function useOnScreen<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, on];
}

/** Adds `is-visible` to every `.reveal` child of the returned ref when it scrolls in. */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    root.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
}

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(cb: () => void): () => void {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

function subscribeScroll(cb: () => void): () => void {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

/** True once the page is scrolled past `offset` pixels. */
export function useScrolledPast(offset: number): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > offset,
    () => false,
  );
}
