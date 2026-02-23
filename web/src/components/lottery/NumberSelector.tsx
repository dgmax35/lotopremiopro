"use client";

import { cn } from "@/lib/utils";

interface NumberSelectorProps {
    totalNumbers: number;
    selected: number[];
    onToggle: (number: number) => void;
    maxSelect?: number;
    label?: string;
}

export function NumberSelector({
    totalNumbers,
    selected,
    onToggle,
    maxSelect,
    label
}: NumberSelectorProps) {

    const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

    return (
        <div className="space-y-3">
            {label && (
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                    <span className="text-xs text-muted-foreground">
                        {selected.length} {maxSelect ? `/ ${maxSelect}` : 'selecionados'}
                    </span>
                </div>
            )}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {numbers.map((n) => {
                    const isSelected = selected.includes(n);
                    return (
                        <button
                            key={n}
                            onClick={() => onToggle(n)}
                            className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-full text-sm font-bold transition-all",
                                isSelected
                                    ? "bg-primary text-primary-foreground scale-110 shadow-md ring-2 ring-offset-2 ring-primary"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                        >
                            {n.toString().padStart(2, '0')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
