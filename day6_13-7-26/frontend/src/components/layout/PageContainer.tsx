import React from 'react';
import { motion } from 'framer-motion';

export const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-text p-6 md:p-12 font-sans"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        {children}
      </div>
    </motion.main>
  );
};
