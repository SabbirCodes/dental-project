import { useInView } from "motion/react";
import { useRef } from "react";
import { useCountUp } from "./count-up";

export function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useCountUp(value, inView);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <p className="text-3xl font-semibold tabular-nums sm:text-4xl">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
