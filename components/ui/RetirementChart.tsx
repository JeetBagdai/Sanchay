"use client";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from "recharts";
import { formatCurrency } from "@/lib/simulation";

interface DataPoint {
    age: number;
    corpus: number;
    totalContributed: number;
}

interface RetirementChartProps {
    data: DataPoint[];
    decisionAge?: number;
    height?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass rounded-xl p-3 text-xs border border-border-subtle bg-card shadow-md">
                <p className="font-bold text-amber-400 mb-1">Age {label}</p>
                <p className="text-emerald-500">Corpus: {formatCurrency(payload[0]?.value)}</p>
                <p className="text-blue-500">Contributed: {formatCurrency(payload[1]?.value)}</p>
            </div>
        );
    }
    return null;
};

export default function RetirementChart({ data, decisionAge, height = 220 }: RetirementChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <defs>
                    <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                    dataKey="age"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: "Age", position: "insideBottomRight", fill: "#94a3b8", fontSize: 11, offset: -4 }}
                />
                <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${(v / 1000).toFixed(0)}K`}
                    width={42}
                />
                <Tooltip content={<CustomTooltip />} />
                {decisionAge && (
                    <ReferenceLine x={decisionAge} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Decision", fill: "#ef4444", fontSize: 10 }} />
                )}
                <Area type="monotone" dataKey="corpus" stroke="#f59e0b" strokeWidth={2.5} fill="url(#corpusGrad)" dot={false} name="corpus" />
                <Area type="monotone" dataKey="totalContributed" stroke="#3b82f6" strokeWidth={1.5} fill="url(#contribGrad)" dot={false} name="totalContributed" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
