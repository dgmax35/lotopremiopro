"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";

interface FrequencyChartProps {
    data: { number: string; count: number }[];
}

export function FrequencyChart({ data }: FrequencyChartProps) {
    // Sort by number for the chart? Or frequency?
    // Frequency is better for "Top", but for "Distribution" usually Number order is better.
    // Let's sort by Number (parsed as int) for the main distribution chart.

    const sortedData = [...data].sort((a, b) => parseInt(a.number) - parseInt(b.number));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sortedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
        </ResponsiveContainer>
    );
}
