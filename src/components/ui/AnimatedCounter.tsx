"use client";

import React, { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";

interface AnimatedCounterProps {
  valuePaise: bigint | number | null | undefined;
  className?: string;
  showSign?: boolean;
}

export function AnimatedCounter({ valuePaise, className = "", showSign = false }: AnimatedCounterProps) {
  const { formatMoney } = useCurrency();
  const target = typeof valuePaise === "bigint" ? Number(valuePaise) : Number(valuePaise || 0);
  const [displayPaise, setDisplayPaise] = useState<number>(target);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = displayPaise;
    const endVal = target;
    const duration = 750; // ms

    if (startVal === endVal) return;

    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out expo curve for snappy modern SaaS feel
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (endVal - startVal) * ease);

      setDisplayPaise(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return (
    <span className={`inline-block transition-transform duration-200 ${className}`}>
      {formatMoney(displayPaise, { showSign })}
    </span>
  );
}
