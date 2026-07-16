import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { OrganizerSignupForm } from '../components/auth/OrganizerSignupForm';
import { authService } from '../services/authService';

export const SignupOrganizerPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (data: any, documents: File[]) => {
    try {
      setError(null);
      setIsLoading(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        // Skip confirm password
        if (key !== 'confirm_password') {
          formData.append(key, value as string);
        }
      });
      
      documents.forEach(doc => {
        formData.append('documents', doc);
      });

      await authService.signupOrganizer(formData);
      setIsSuccess(true);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="bg-primary/10 p-3 rounded-2xl ring-1 ring-primary/20">
            <Shield className="w-10 h-10 text-primary" />
          </div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-center text-3xl font-extrabold text-text tracking-tight"
        >
          Become an Organizer
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-center text-sm text-muted"
        >
          Submit your application to manage players and teams. <br className="hidden sm:block" />
          Already approved? <Link to="/login" className="font-medium text-primary hover:text-primary-hover hover:underline transition-all">Sign in here</Link>
        </motion.p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 border border-border/50"
        >
          {isSuccess ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">Application Submitted!</h3>
              <p className="text-muted mb-6">
                Your application has been received and is pending admin approval. You will be able to log in once approved.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <OrganizerSignupForm 
              onSubmit={handleSignup} 
              isLoading={isLoading} 
              error={error} 
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};
