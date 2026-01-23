'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ResultsChartsProps = {
  score: number;
  skillScores: { skill: string; score: number }[];
};

export function ResultsCharts({ score, skillScores }: ResultsChartsProps) {
  const chartData = skillScores;
  const chartConfig = {
    score: {
      label: 'Score',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;
  
  const scoreColor = score > 80 ? 'text-green-600' : score > 60 ? 'text-amber-500' : 'text-destructive';

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1 flex flex-col items-center justify-center text-center">
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>Candidate's final grade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative size-40">
            <svg className="size-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-muted" strokeWidth="2"></circle>
              <g className="origin-center -rotate-90 transform">
                <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${scoreColor}`} strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - score}></circle>
              </g>
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${scoreColor}`}>
                {score}%
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Score by Skill</CardTitle>
          <CardDescription>Performance across different skill areas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <YAxis
                  dataKey="skill"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={80}
                />
                <XAxis dataKey="score" type="number" hide />
                <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<ChartTooltipContent />} />
                <Bar dataKey="score" layout="vertical" radius={5} fill="var(--color-score)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
