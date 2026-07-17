import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { motion } from 'framer-motion';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center h-[60vh]"
      >
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
          <span className="text-4xl">🚧</span>
        </div>
        <h1 className="text-3xl font-bold text-text mb-2">{title}</h1>
        <p className="text-muted">This page is currently under construction.</p>
      </motion.div>
    </PageContainer>
  );
};
