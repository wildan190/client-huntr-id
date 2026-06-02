import React from "react";
import { CheckCircle2 } from "lucide-react";

interface StepTrackerProps {
  steps: any[];
  currentSlide: number;
}

/**
 * StepTracker Component
 * 
 * Menampilkan progress langkah onboarding.
 */
export const StepTracker: React.FC<StepTrackerProps> = ({ steps, currentSlide }) => {
  return (
    <div className="mb-6 md:mb-10 px-1">
      <div className="flex items-center justify-between relative">
        {steps.map((step, i) => {
          const isDone = currentSlide > step.id;
          const isActive = currentSlide === step.id;
          const Icon = step.icon;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1 relative z-1">
                <div 
                  className={`
                    w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-500
                    ${isDone 
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-500/40 shadow-[0_0_16px_rgba(52,211,153,0.25)]" 
                      : isActive 
                        ? "bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.4)]" 
                        : "bg-[var(--ui-bg-input)] border-2 border-[var(--ui-border-subtle)]"
                    }
                  `}
                >
                  {isDone ? <CheckCircle2 size={18} className="text-white" /> : <Icon size={16} className={isActive ? "text-white" : "text-[var(--ui-text-muted)]"} />}
                </div>
                <div className="mt-2 text-center">
                  <div className={`
                    text-[9px] md:text-[10px] font-bold tracking-wide transition-colors duration-300 whitespace-nowrap hidden md:block
                    ${isDone ? "text-emerald-400" : isActive ? "text-[var(--ui-text-primary)]" : "text-[var(--ui-text-muted)]"}
                  `}>
                    {step.label}
                  </div>
                  {/* Mobile minimal label */}
                  {isActive && (
                    <div className="text-[8px] font-black text-orange-400 uppercase tracking-tighter md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      {step.label}
                    </div>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`
                  flex-1 h-[2px] -mt-4 transition-all duration-700
                  ${currentSlide > step.id ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-[var(--ui-border-subtle)]"}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
