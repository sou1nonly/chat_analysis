"use client";

import { Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

interface DetailsWrapperProps {
    children: React.ReactNode;
    onExpand: () => void;
    className?: string;
    colSpan?: string;
    rowSpan?: string;
}

export default function DetailsWrapper({ children, onExpand, className = "", colSpan = "col-span-1", rowSpan = "row-span-1" }: DetailsWrapperProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative group ${colSpan} ${rowSpan} ${className}`}
        >
            {/* The Card Content */}
            <div className="h-full w-full" onClick={onExpand}>
                {children}
            </div>

            {/* Hover Overlay Trigger */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onExpand();
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 z-20 border border-white/10"
                title="Expand for details"
            >
                <Maximize2 className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
