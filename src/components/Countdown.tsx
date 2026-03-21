"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  endTime: string; // ISO string
  onExpire?: () => void;
  size?: "sm" | "lg";
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function getTimeLeft(endTime: string): TimeLeft {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, expired: false };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Countdown({ endTime, onExpire, size = "sm" }: CountdownProps) {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft(endTime));

  useEffect(() => {
    const id = setInterval(() => {
      const t = getTimeLeft(endTime);
      setTime(t);
      if (t.expired) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endTime, onExpire]);

  if (time.expired) return null;

  if (size === "lg") {
    return (
      <div className="flex items-center gap-1 font-mono">
        {[
          { v: pad(time.hours), label: "h" },
          { v: pad(time.minutes), label: "m" },
          { v: pad(time.seconds), label: "s" },
        ].map(({ v, label }, i) => (
          <span key={label} className="flex items-center gap-0.5">
            {i > 0 && <span className="text-mint/60 text-lg font-bold mx-0.5">:</span>}
            <span className="bg-forest-dark text-mint text-2xl font-bold px-3 py-1.5 rounded-lg tabular-nums">
              {v}
            </span>
            <span className="text-white/50 text-xs ml-0.5">{label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <span className="font-mono text-sm font-bold tabular-nums text-mint">
      {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
    </span>
  );
}
