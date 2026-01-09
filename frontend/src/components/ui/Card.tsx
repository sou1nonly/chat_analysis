"use client";

import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

type CardVariant = "default" | "elevated" | "glass" | "accent";
type CardSize = "sm" | "md" | "lg" | "xl";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: ReactNode;
    variant?: CardVariant;
    size?: CardSize;
    interactive?: boolean;
    className?: string;
    noPadding?: boolean;
}

const sizeStyles: Record<CardSize, string> = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
};

const variantStyles: Record<CardVariant, string> = {
    default: "bg-[#1C1C1E] border border-white/[0.06]",
    elevated: "bg-[#242426] border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
    glass: "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
    accent: "bg-[#1C1C1E] border border-purple-500/40 shadow-[0_0_24px_rgba(139,92,246,0.15)]",
};

const interactiveStyles = `
    cursor-pointer 
    hover:bg-[#2C2C2E] 
    hover:border-white/[0.1] 
    hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] 
    active:scale-[0.995]
`;

export default function Card({
    children,
    variant = "default",
    size = "md",
    interactive = false,
    className,
    noPadding = false,
    ...motionProps
}: CardProps) {
    return (
        <motion.div
            className={clsx(
                "rounded-[20px] transition-all duration-200 ease-out",
                variantStyles[variant],
                !noPadding && sizeStyles[size],
                interactive && interactiveStyles,
                className
            )}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}

// ===== Card Sub-Components =====

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
    return (
        <div className={clsx("flex items-center justify-between mb-4", className)}>
            <div className="flex items-center gap-3">{children}</div>
            {action && <div>{action}</div>}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
    subtitle?: string;
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
    return (
        <div>
            <h3 className={clsx("text-white font-heading font-semibold text-lg", className)}>
                {children}
            </h3>
            {subtitle && (
                <p className="text-[11px] text-[#636366] uppercase tracking-widest mt-0.5">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

interface CardIconProps {
    children: ReactNode;
    color?: "purple" | "blue" | "green" | "orange" | "pink" | "default";
}

const iconColors: Record<string, string> = {
    purple: "bg-purple-500/15 text-purple-400",
    blue: "bg-blue-500/15 text-blue-400",
    green: "bg-emerald-500/15 text-emerald-400",
    orange: "bg-orange-500/15 text-orange-400",
    pink: "bg-pink-500/15 text-pink-400",
    default: "bg-white/[0.08] text-[#8E8E93]",
};

export function CardIcon({ children, color = "default" }: CardIconProps) {
    return (
        <div className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            iconColors[color]
        )}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={clsx("", className)}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={clsx(
            "mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between",
            className
        )}>
            {children}
        </div>
    );
}

// ===== Stat Card Component =====

interface StatCardProps {
    icon: ReactNode;
    iconColor?: "purple" | "blue" | "green" | "orange" | "pink";
    value: string | number;
    label: string;
    sublabel?: string;
    className?: string;
    onClick?: () => void;
}

export function StatCard({
    icon,
    iconColor = "purple",
    value,
    label,
    sublabel,
    className,
    onClick,
}: StatCardProps) {
    return (
        <Card
            interactive={!!onClick}
            onClick={onClick}
            className={clsx("flex flex-col justify-between h-full", className)}
        >
            <CardIcon color={iconColor}>{icon}</CardIcon>
            <div className="mt-4">
                <p className="text-2xl font-heading font-bold text-white">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </p>
                <p className="text-[11px] text-[#636366] uppercase tracking-widest mt-1">
                    {label}
                </p>
                {sublabel && (
                    <p className="text-[10px] text-[#48484A] mt-0.5">{sublabel}</p>
                )}
            </div>
        </Card>
    );
}

// ===== Chip Component =====

interface ChipProps {
    children: ReactNode;
    variant?: "default" | "accent" | "success" | "warm" | "danger";
    icon?: ReactNode;
    className?: string;
}

const chipVariants: Record<string, string> = {
    default: "bg-[#3A3A3C] text-[#8E8E93]",
    accent: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    warm: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    danger: "bg-red-500/15 text-red-400 border border-red-500/20",
};

export function Chip({ children, variant = "default", icon, className }: ChipProps) {
    return (
        <span className={clsx(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            chipVariants[variant],
            className
        )}>
            {icon && <span className="w-3 h-3">{icon}</span>}
            {children}
        </span>
    );
}
