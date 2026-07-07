"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect() || {
        width: 0,
        height: 0,
      };

      let top = rect.top - tooltipRect.height - 8;
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

      if (position === "bottom") {
        top = rect.bottom + 8;
      } else if (position === "left") {
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - 8;
      } else if (position === "right") {
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + 8;
      }

      // Keep tooltip in viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < 10) top = 10;

      setCoords({ top, left });
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg"
            style={{
              top: coords.top,
              left: coords.left,
              pointerEvents: "none",
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
