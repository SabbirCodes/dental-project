import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";


export function SmileUnderline() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      width="220"
      height="28"
      viewBox="0 0 220 28"
      fill="none"
      className="mt-1 h-6 w-auto sm:h-7"
      aria-hidden="true"
    >
      <motion.path
        d="M4 6C34 24 100 26 140 18C168 12 194 8 216 4"
        stroke="var(--color-primary)"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1, delay: 0.5, ease: [0.65, 0, 0.35, 1] }
        }
      />
    </svg>
  );
}
