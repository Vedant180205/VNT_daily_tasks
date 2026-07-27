import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { motion } from 'framer-motion';
import { CreatePlayerDialog } from '../components/players/CreatePlayerDialog';
import { BulkUploadDialog } from '../components/players/BulkUploadDialog';
import { UserPlus, UploadCloud } from 'lucide-react';

export const UploadPlayersPage: React.FC = () => {
  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none stack-sans-headline-unique mb-2">Upload Players</h1>
        <p className="text-muted text-base">Add new players to your system individually or in bulk.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <UserPlus size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Single Player</h2>
          <p className="text-muted mb-8 leading-relaxed">
            Manually create a single player profile, upload an avatar, and assign them to a team right away.
          </p>
          <div className="w-full flex justify-center">
            <CreatePlayerDialog />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
            <UploadCloud size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Bulk Upload</h2>
          <p className="text-muted mb-8 leading-relaxed">
            Import hundreds of players at once using an Excel or CSV file to populate your database quickly.
          </p>
          <div className="w-full flex justify-center">
            <BulkUploadDialog />
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};
