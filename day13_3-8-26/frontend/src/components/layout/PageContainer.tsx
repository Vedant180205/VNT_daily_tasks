import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden text-text">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[260px] overflow-hidden">
        <TopNavbar />
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-y-auto px-8 pt-5 pb-8"
        >
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};
