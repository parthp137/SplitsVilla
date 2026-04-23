import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ProgressIndicatorProps {
  isVisible: boolean;
  progress?: number; // 0-100
  message?: string;
  variant?: "linear" | "circular";
  indeterminate?: boolean;
}

/**
 * Linear Progress Indicator for async operations
 * Shows progress along the top of the page
 */
export function LinearProgressIndicator({
  isVisible,
  progress = 0,
  message,
  indeterminate = true,
}: Omit<ProgressIndicatorProps, "variant"> & { variant?: "linear" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: isVisible ? 1 : 0, scaleX: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="origin-left"
    >
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        {indeterminate ? (
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ) : (
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <p className="text-sm font-medium text-primary">{message}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Circular Progress Indicator for operations
 * Can be used as spinner or show specific progress
 */
export function CircularProgressIndicator({
  isVisible,
  progress = 0,
  message,
  indeterminate = true,
}: Omit<ProgressIndicatorProps, "variant"> & { variant?: "circular" }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted"
          />
          {!indeterminate && (
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-primary transition-all"
            />
          )}
          {indeterminate && (
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              className="text-primary"
              animate={{
                rotate: [0, 360],
                strokeDashoffset: [0, circumference],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {!indeterminate && (
              <div className="text-xl font-bold text-primary">{progress}%</div>
            )}
            {indeterminate && (
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {message && (
        <p className="text-sm font-medium text-muted-foreground text-center max-w-xs">
          {message}
        </p>
      )}
    </motion.div>
  );
}

/**
 * Page Loading Progress for multi-step operations
 * Shows step counter like "Step 2 of 5"
 */
export interface PageProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}

export function PageProgress({ currentStep, totalSteps, stepLabel }: PageProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{stepLabel || `Step ${currentStep} of ${totalSteps}`}</span>
        <span className="font-medium text-foreground">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

/**
 * useProgressIndicator Hook
 * Convenient hook for managing progress state in async operations
 */
export function useProgressIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const showProgress = (msg?: string) => {
    setMessage(msg || "Processing...");
    setProgress(0);
    setIsVisible(true);
  };

  const updateProgress = (newProgress: number, msg?: string) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
    if (msg) setMessage(msg);
  };

  const hideProgress = () => {
    setIsVisible(false);
    setTimeout(() => {
      setProgress(0);
      setMessage("");
    }, 300);
  };

  return {
    isVisible,
    progress,
    message,
    showProgress,
    updateProgress,
    hideProgress,
  };
}

export default LinearProgressIndicator;
