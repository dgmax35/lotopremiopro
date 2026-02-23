import { cn } from "@/lib/utils";

interface LotteryBallProps {
    number: string | number;
    color?: string;
    textColor?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function LotteryBall({
    number,
    color = "#ffffff",
    textColor = "#333333",
    className,
    size = "md"
}: LotteryBallProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-xl font-bold"
    };

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center border-2 border-transparent shadow-sm transition-transform hover:scale-105",
                sizeClasses[size],
                className
            )}
            style={{
                backgroundColor: color,
                color: textColor,
                boxShadow: color === "#ffffff" ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
            }}
        >
            {number}
        </div>
    );
}

export function LotteryClover({
    number,
    className
}: {
    number: string | number;
    className?: string
}) {
    return (
        <div className={cn("relative w-12 h-12 flex items-center justify-center", className)}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-white drop-shadow-sm">
                <path d="M50 20c-10 0-15 5-15 15s5 15 15 15 15-5 15-15-5-15-15-15zm-30 30c0-10 5-15 15-15s15 5 15 15-5 15-15 15-15-5-15-15zm30 30c-10 0-15-5-15-15s5-15 15-15 15 5 15 15-5 15-15 15zm30-30c0 10-5 15-15 15s-15-5-15-15 5-15 15-15 15 5 15 15z" />
            </svg>
            <span className="relative z-10 font-bold text-[#005ca9] text-xl pb-1">{number}</span>
        </div>
    );
}
