"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface DetailsWrapperProps {
    children: ReactNode;
    onExpand?: () => void;
    colSpan?: string;
    className?: string;
}

export default function DetailsWrapper({
    children,
    onExpand,
    colSpan = "col-span-1",
    className,
}: DetailsWrapperProps) {
    return (
        <motion.div
            layout
            onClick={onExpand}
            className={clsx(
                // Base card styles
                "relative rounded-[20px] overflow-hidden",
                "bg-[#1C1C1E] border border-white/[0.06]",
                // Interactive styles
                "cursor-pointer transition-all duration-200 ease-out",
                "hover:bg-[#2C2C2E] hover:border-white/[0.1]",
                "hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
                "active:scale-[0.995]",
                // Grid placement
                colSpan,
                className
            )}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            {/* Expand hint - appears on hover */}
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-[#636366] bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                    Click to expand
                </span>
            </div>

            {/* Card content */}
            <div className="h-full group">
                {children}
            </div>
        </motion.div>
    );
}
