import React, { useState } from "react";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "icon" | "app" | "adaptive" | "splash";
}

export function BrandLogo({ size = "md", className = "", variant = "icon" }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeMap = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-10 h-10 rounded-2xl",
    lg: "w-16 h-16 rounded-3xl",
    xl: "w-24 h-24 rounded-3xl",
  };

  const srcMap = {
    icon: "/icon.png",
    app: "/app-image.png",
    adaptive: "/adaptive-icon.png",
    splash: "/splash-image.png",
  };

  const imageSrc = srcMap[variant] || "/icon.png";

  if (!imgFailed) {
    return (
      <img
        src={imageSrc}
        alt="HabitLoop"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${sizeMap[size]} object-cover shadow-md border border-white/10 ${className}`}
      />
    );
  }

  // High-fidelity fallback SVG representing the HabitLoop infinity gradient logo
  return (
    <div
      className={`${sizeMap[size]} bg-[#11141B] flex items-center justify-center p-1.5 shadow-md border border-[#334155] ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="habitLoopGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="25%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="75%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="habitLoopGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Glow infinity path */}
        <path
          d="M32 35 C 18 35, 12 45, 12 52 C 12 60, 20 68, 32 68 C 42 68, 48 58, 50 52 C 52 46, 58 35, 68 35 C 80 35, 88 43, 88 52 C 88 61, 80 68, 68 68 C 58 68, 52 58, 50 52 C 48 46, 42 35, 32 35 Z"
          stroke="url(#habitLoopGrad1)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        <path
          d="M32 35 C 18 35, 12 45, 12 52 C 12 60, 20 68, 32 68 C 42 68, 48 58, 50 52 C 52 46, 58 35, 68 35 C 80 35, 88 43, 88 52 C 88 61, 80 68, 68 68 C 58 68, 52 58, 50 52 C 48 46, 42 35, 32 35 Z"
          stroke="url(#habitLoopGrad2)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
