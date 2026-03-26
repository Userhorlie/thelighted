"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RESTAURANT_INFO } from "@/lib/constants";
import { isRestaurantOpen } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const OpeningHours: React.FC = () => {
  const isOpen = isRestaurantOpen(RESTAURANT_INFO.openingHours);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-secondary">
            Opening Hours
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {isOpen ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  Open Now
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 font-medium">Closed</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {RESTAURANT_INFO.openingHours.map((hours, index) => {
          const isToday = hours.day === today;

          return (
            <motion.div
              key={hours.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex justify-between items-center py-2 px-3 rounded-lg transition-colors",
                isToday && "bg-primary/5 border border-primary/20",
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  isToday ? "text-primary" : "text-text",
                )}
              >
                {hours.day}
              </span>
              <span
                className={cn(
                  "text-sm",
                  isToday ? "text-primary font-medium" : "text-text-muted",
                )}
              >
                {hours.isOpen
                  ? `${hours.openTime} - ${hours.closeTime}`
                  : "Closed"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
