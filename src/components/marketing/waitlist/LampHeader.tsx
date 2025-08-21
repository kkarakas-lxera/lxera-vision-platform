import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LampHeaderProps {
  children: React.ReactNode;
  className?: string;
}

// Compact lamp-style header adapted to LXERA teal
export default function LampHeader({ children, className }: LampHeaderProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden w-full z-0',
        className,
      )}
    >
      <div className="relative flex w-full flex-1 items-center justify-center isolate z-0 ">
        {/* Left conic gradient */}
        <motion.div
          initial={{ opacity: 0.5, width: '12rem' }}
          whileInView={{ opacity: 1, width: '28rem' }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
          style={{ backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))` }}
          className="absolute inset-auto right-1/2 h-40 w-[28rem] bg-gradient-conic from-[#7AE5C6] via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-full left-0 bg-transparent h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-full left-0 bg-transparent bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Right conic gradient */}
        <motion.div
          initial={{ opacity: 0.5, width: '12rem' }}
          whileInView={{ opacity: 1, width: '28rem' }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
          style={{ backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))` }}
          className="absolute inset-auto left-1/2 h-40 w-[28rem] bg-gradient-conic from-transparent via-transparent to-[#7AE5C6] text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-40 h-full right-0 bg-transparent bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-full right-0 bg-transparent h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Soft cast and beam */}
        <div className="absolute top-1/2 h-36 w-full translate-y-10 scale-x-150 bg-transparent blur-2xl" />
        <div className="absolute inset-auto z-50 h-28 w-[26rem] -translate-y-1/2 rounded-full bg-[#7AE5C6] opacity-40 blur-3xl" />
        <motion.div
          initial={{ width: '8rem' }}
          whileInView={{ width: '16rem' }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-auto z-30 h-28 w-64 -translate-y-[5rem] rounded-full bg-[#7AE5C6] blur-2xl"
        />
        <motion.div
          initial={{ width: '12rem' }}
          whileInView={{ width: '28rem' }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-auto z-50 h-0.5 w-[28rem] -translate-y-[6rem] bg-[#7AE5C6]"
        />
      </div>

      <div className="relative z-50 -translate-y-24 flex flex-col items-center px-5 text-center">
        {children}
      </div>
    </div>
  );
}


