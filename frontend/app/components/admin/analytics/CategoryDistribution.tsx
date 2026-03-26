// frontend/src/components/admin/analytics/CategoryDistribution.tsx
"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface CategoryDistributionProps {
  data: Array<{
    category: string;
    count: number;
  }>;
}

const COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#6366f1", // indigo
  "#14b8a6", // teal
];

export function CategoryDistribution({ data }: CategoryDistributionProps) {
  const chartData = data.map((item) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.count,
  }));

  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Menu Category Distribution
      </h3>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No category data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
