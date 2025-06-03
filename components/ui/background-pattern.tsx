"use client";

import React from 'react';

interface BackgroundPatternProps {
  className?: string;
}

export function BackgroundPattern({ className = "" }: BackgroundPatternProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="60" height="60" className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-black rounded-full opacity-10 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-20 w-3 h-3 bg-gray-600 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-black rounded-full opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-60 left-1/3 w-1 h-1 bg-gray-700 rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-60 right-1/3 w-2 h-2 bg-gray-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '3s' }}></div>
      
      {/* Subtle light beams */}
      <div className="absolute top-0 left-1/4 w-px h-40 bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-20 animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-0 right-1/3 w-px h-32 bg-gradient-to-b from-transparent via-gray-400 to-transparent opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

export default BackgroundPattern;
