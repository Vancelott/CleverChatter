"use client";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

interface CounterProps {
  from: number;
  to: number;
}

const AnimatedCounter = ({ from, to }: CounterProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  // const animateCount = animate(count, to, { duration: 2 });

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration: 2 });
    }
  }, [count, isInView, to]);

  return (
    <motion.span ref={ref} whileInView="animate">
      {rounded}
    </motion.span>
  );
};

export default AnimatedCounter;
