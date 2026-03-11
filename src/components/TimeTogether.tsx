"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const START_DATE = new Date("2025-09-04T00:00:00");

function calculateTime(start: Date, now: Date) {
  const diff = now.getTime() - start.getTime();
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Calculate months and remaining days
  let months = 0;
  const tempDate = new Date(start);
  while (true) {
    tempDate.setMonth(tempDate.getMonth() + 1);
    if (tempDate > now) break;
    months++;
  }
  tempDate.setMonth(tempDate.getMonth() - 1);
  const remainingDays = Math.floor((now.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));

  return { totalDays, months, days: remainingDays };
}

export function TimeTogether() {
  const [time, setTime] = useState(() => calculateTime(START_DATE, new Date()));

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTime(calculateTime(START_DATE, new Date()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const label =
    time.months > 0
      ? `${time.months} ${time.months === 1 ? "mês" : "meses"} e ${time.days} ${time.days === 1 ? "dia" : "dias"}`
      : `${time.totalDays} ${time.totalDays === 1 ? "dia" : "dias"}`;

  return (
    <div className="flex items-center justify-center gap-1.5 py-2 px-4 bg-rose-100/50 text-rose-500 text-xs font-medium">
      <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
      <span>{label} juntos</span>
      <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
    </div>
  );
}
