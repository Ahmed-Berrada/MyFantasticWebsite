"use client";
import { useCallback, useState } from "react";
import ProximityText from "./ProximityText";
import TrainGraphCanvas from "./TrainGraphCanvas";
import { profile } from "@/src/content/profile";

interface Latency {
  last: number;
  median: number;
  count: number;
}

export default function Hero() {
  const [lat, setLat] = useState<Latency | null>(null);
  const onLatency = useCallback((last: number, median: number, count: number) => setLat({ last, median, count }), []);

  return (
    <section id="top" className="relative flex flex-col overflow-hidden pt-20 lg:block lg:min-h-[100dvh]">
      {/* The instrument: full-bleed on wide screens, fading out behind the text. */}
      <div className="relative order-2 mx-5 mb-16 h-[400px] lg:absolute lg:inset-x-0 lg:top-16 lg:m-0 lg:h-[calc(100dvh-4rem)] lg:[mask-image:linear-gradient(90deg,transparent_0%,transparent_22%,#000_52%)]">
        <TrainGraphCanvas onLatency={onLatency} />
      </div>

      <div className="pointer-events-none relative order-1 mx-auto w-full max-w-7xl px-5 pt-10 pb-12 md:px-8 lg:pt-[14vh] lg:pb-20">
        <div className="max-w-[34rem] [&_a]:pointer-events-auto">
          <p className="text-ink-2">{profile.name}, software engineer</p>

          <h1 className="mt-5 font-display text-[clamp(64px,10vw,150px)] leading-[0.86] tracking-[-0.035em]">
            <ProximityText text="Right first." className="block" />
            <ProximityText text="Then fast." className="block" />
          </h1>

          <p className="mt-8 max-w-[31rem] text-lg leading-relaxed text-ink-2 text-pretty">
            At Siemens Mobility I build the simulation and test automation behind a safety-critical 5G train radio for
            the New York City subway. On my own time I write matching engines and GPU code, and measure them in
            nanoseconds. Either way the discipline is the same: deterministic, measured, tested until it is boring.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href="#siemens"
              className="rounded-[3px] bg-ink px-5 py-3 font-medium text-ground transition-colors duration-200 hover:bg-accent hover:text-ink active:translate-y-px"
            >
              See the work
            </a>
            <a href={`mailto:${profile.email}`} className="link">
              {profile.email}
            </a>
          </div>

          <p className="mt-10 max-w-[30rem] text-sm text-muted" aria-live="polite">
            {lat
              ? `Your last key reached the screen ${lat.last.toFixed(1)} ms after you pressed it. Median over ${lat.count} ${lat.count === 1 ? "key" : "keys"}: ${lat.median.toFixed(1)} ms.`
              : profile.availability + "."}
          </p>
        </div>
      </div>
    </section>
  );
}
