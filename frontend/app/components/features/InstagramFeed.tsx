// frontend/src/components/features/InstagramFeed.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, ExternalLink, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { useInstagramPosts } from "@/lib/hooks/useInstagramPosts";

const RESTAURANT_INFO = {
  name: process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Savoria Restaurant",
  socialMedia: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "savoria_restaurant",
  },
};

export const InstagramFeed: React.FC = () => {
  // Use React Query hook
  const { data: posts = [], isLoading, error, refetch } = useInstagramPosts(6);

  const instagramHandle = RESTAURANT_INFO.socialMedia.instagram;

  return (
    <Section id="instagram" background="gray">
      <Container>
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Instagram className="w-6 h-6 text-primary" />
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-xl text-primary hover:text-primary-dark transition-colors"
            >
              @{instagramHandle}
            </a>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-4"
          >
            Follow Our Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-text-muted max-w-2xl mx-auto"
          >
            Stay updated with our latest dishes, events, and behind-the-scenes
            moments
          </motion.p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📸</div>
            <h3 className="font-serif text-2xl font-bold text-secondary mb-2">
              Unable to Load Posts
            </h3>
            <p className="text-text-muted mb-6">
              {error instanceof Error
                ? error.message
                : "Failed to load Instagram posts"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Instagram Posts Grid */}
        {!isLoading && !error && posts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post, index) => (
              <InstagramPostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📸</div>
            <h3 className="font-serif text-2xl font-bold text-secondary mb-2">
              No Posts Yet
            </h3>
            <p className="text-text-muted">
              Check back soon for delicious updates!
            </p>
          </div>
        )}

        {/* Follow CTA */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Instagram className="w-5 h-5" />
              Follow Us on Instagram
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        )}
      </Container>
    </Section>
  );
};

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  permalink: string;
  timestamp: string;
}

const InstagramPostCard: React.FC<{
  post: InstagramPost;
  index: number;
}> = ({ post, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 cursor-pointer"
    >
      <Image
        src={post.imageUrl}
        alt={post.caption}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className={`object-cover transition-all duration-500 group-hover:scale-110 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadingComplete={() => setImageLoaded(true)}
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>
          <div className="flex items-center gap-2 text-xs">
            <Heart className="w-4 h-4 fill-white" />
            <span>View on Instagram</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
};
