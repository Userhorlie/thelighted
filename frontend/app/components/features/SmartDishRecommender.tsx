// frontend/src/components/features/SmartDishRecommender.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, RefreshCw } from "lucide-react";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import type { MenuItem, RecommendationContext } from "@/lib/types";
import { getTimeOfDay, getDayOfWeek } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { useMenuItems } from "@/lib/hooks/useMenuItems";

export const SmartDishRecommender: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<MenuItem | null>(null);
  const [context, setContext] = useState<RecommendationContext | null>(null);
  const { totalItems } = useCartStore();

  // Use React Query hook - shares cache with menu page and explore page!
  const { data: menuItems = [], isLoading } = useMenuItems();

  // Generate recommendation when menu items are loaded
  useEffect(() => {
    if (menuItems.length > 0 && !recommendation) {
      generateRecommendation(menuItems);
    }
  }, [menuItems]);

  const generateRecommendation = (items: MenuItem[] = menuItems) => {
    if (items.length === 0) return;

    const timeOfDay = getTimeOfDay();
    const dayOfWeek = getDayOfWeek();

    const newContext: RecommendationContext = {
      timeOfDay,
      dayOfWeek,
    };

    setContext(newContext);

    let suitableItems = items.filter((item) =>
      item.timeOfDay?.includes(timeOfDay)
    );

    if (suitableItems.length === 0) {
      suitableItems = items;
    }

    if (suitableItems.length > 0) {
      const randomItem =
        suitableItems[Math.floor(Math.random() * suitableItems.length)];
      setRecommendation(randomItem);
    }
  };

  const updateRecommendation = () => {
    generateRecommendation();
  };

  const getRecommendationReason = (): string => {
    if (!context) return "";

    const { timeOfDay, dayOfWeek } = context;
    const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday";

    if (timeOfDay === "morning") {
      return "Perfect for starting your day!";
    } else if (timeOfDay === "afternoon") {
      return isWeekend
        ? "Great for a weekend lunch!"
        : "Ideal for your lunch break!";
    } else if (timeOfDay === "evening") {
      return dayOfWeek === "Friday"
        ? "Perfect for date night!"
        : "A wonderful dinner choice!";
    } else {
      return "Light and satisfying for late-night cravings!";
    }
  };

  if (!recommendation || isLoading) return null;

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={`fixed right-4 sm:right-6 z-40 flex items-center gap-3 bg-gradient-hero text-white px-5 py-3 rounded-full shadow-2xl group hover:shadow-3xl transition-all duration-300 ${
            totalItems > 0 ? "bottom-27 lg:bottom-4" : "bottom-4"
          }`}
          aria-label="Get dish recommendation"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce">
              <span className="sr-only">New recommendation</span>
            </div>
          </div>

          <span className="font-semibold text-sm hidden sm:inline whitespace-nowrap">
            What Should I Eat?
          </span>

          <span className="font-semibold text-sm sm:hidden">For You</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-full sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-hero text-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-semibold">Smart Recommendations</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-white/90">
                  {getRecommendationReason()}
                </p>
              </div>

              <div className="p-4">
                {recommendation ? (
                  <>
                    <MenuItemCard item={recommendation} showFullDetails />

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={updateRecommendation}
                      disabled={isLoading}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium text-text"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                      />
                      Show Me Another
                    </motion.button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-muted">
                      No recommendations available at the moment
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
