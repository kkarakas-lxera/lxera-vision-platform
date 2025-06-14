
import React from "react";

const HeroBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
    aria-hidden="true"
    viewBox="0 0 1440 580"
    fill="none"
    preserveAspectRatio="none"
  >
    <defs>
      <radialGradient id="bgBlob" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(30)">
        <stop offset="0%" stopColor="#7AE5C6" stopOpacity="0.4" />
        <stop offset="60%" stopColor="#EFEFE3" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse
      cx="900"
      cy="350"
      rx="600"
      ry="320"
      fill="url(#bgBlob)"
      className="animate-float-gentle"
      style={{ filter: "blur(25px)" }}
    />
    <ellipse
      cx="480"
      cy="220"
      rx="360"
      ry="180"
      fill="#7AE5C6"
      opacity="0.07"
      className="animate-float-gentle"
      style={{ animationDelay: "2s", filter: "blur(40px)" }}
    />
    <ellipse
      cx="1200"
      cy="90"
      rx="200"
      ry="90"
      fill="#029c55"
      opacity="0.04"
      className="animate-float-gentle"
      style={{ animationDelay: "1.2s", filter: "blur(20px)" }}
    />
  </svg>
);

export default HeroBackground;
