'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TreePine, Leaf, Users, Zap } from 'lucide-react';

const HeroVisual: React.FC = () => {
  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50" />
      
      {/* Floating elements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Central tree icon */}
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6"
        >
          <TreePine className="w-24 h-24 text-green-600" />
        </motion.div>

        {/* Orbiting elements */}
        <div className="relative w-64 h-64">
          {/* Leaf elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2"
          >
            <Leaf className="absolute top-0 left-1/2 w-6 h-6 text-green-500 -translate-x-1/2" />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 right-0 w-40 h-40 -translate-y-1/2 translate-x-1/2"
          >
            <Users className="absolute top-1/2 right-0 w-6 h-6 text-blue-500 -translate-y-1/2" />
          </motion.div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-1/2 w-36 h-36 -translate-x-1/2 translate-y-1/2"
          >
            <Zap className="absolute bottom-0 left-1/2 w-6 h-6 text-purple-500 -translate-x-1/2" />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-0 w-32 h-32 -translate-y-1/2 -translate-x-1/2"
          >
            <Leaf className="absolute top-1/2 left-0 w-5 h-5 text-green-400 -translate-y-1/2" />
          </motion.div>
        </div>

        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: 1 }}
            d="M 200 200 Q 300 100 350 150"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4,4"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: 1.5 }}
            d="M 200 200 Q 100 300 50 250"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4,4"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: 2 }}
            d="M 200 200 Q 300 300 250 350"
            stroke="url(#gradient3)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4,4"
          />
          
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-300 rounded-full opacity-30"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

export default HeroVisual;
