import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { apiClient } from '../api/axios';
import { DocumentUploader } from '../components/auth/DocumentUploader';

interface PrefillData {
  organizer_id: number;
  full_name: string;
  org_name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
}

const schema = z.object({
  org_name: z.string().min(1, 'Organization name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Confirm password is required'),
  address: z.string().min(1, 'Street address is required'),
  zone: z.string().min(1, 'Zone is required'),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Valid 12-digit Aadhaar number required'),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Valid PAN number required'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export const CompleteRegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(true);
  const [prefill, setPrefill] = useState<PrefillData | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<File[]>([]);
  const [docError, setDocError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenError('Invitation token is missing from the link URL.');
      return;
    }

    let isMounted = true;
    apiClient.get(`/api/organizers/registration/validate?token=${token}`)
      .then(res => {
        if (isMounted && res.data?.success) {
          setPrefill(res.data.data);
          setValue('org_name', res.data.data.org_name || '');
        }
      })
      .catch(err => {
        if (isMounted) {
          setTokenError(err.response?.data?.message || 'This invitation link is invalid or has expired.');
        }
      })
      .finally(() => {
        if (isMounted) setIsValidating(false);
      });

    return () => { isMounted = false; };
  }, [token, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    if (!token) return;

    if (documents.length === 0) {
      setDocError('At least one KYC verification document (ID / Aadhaar / GST) is required');
      return;
    }

    setDocError('');
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirm_password);
      formData.append('address', data.address);
      formData.append('zone', data.zone);
      formData.append('aadhaar_number', data.aadhaar_number);
      formData.append('pan_number', data.pan_number);
      formData.append('org_name', data.org_name);

      documents.forEach(doc => {
        formData.append('documents', doc);
      });

      await apiClient.post('/api/organizers/registration/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";
  const disabledClass = "w-full bg-border/20 border border-border rounded-lg px-4 py-2.5 text-muted cursor-not-allowed font-medium";
  const labelClass = "block text-sm font-medium text-text mb-1";

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-muted font-medium">Verifying invitation link...</p>
      </div>
    );
  }

  if (tokenError || !prefill) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4">
        <div className="bg-surface p-8 max-w-md w-full rounded-2xl shadow-xl border border-border text-center">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Invalid or Expired Link</h2>
          <p className="text-muted mb-6">{tokenError}</p>
          <Link to="/signup-organizer" className="block w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors">
            Apply for Invitation Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <div className="bg-primary/10 p-3 rounded-2xl ring-1 ring-primary/20">
            <Shield className="w-10 h-10 text-primary" />
          </div>
        </motion.div>
        
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-3xl font-extrabold text-text tracking-tight">
          Complete Organizer Registration
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center text-sm text-muted">
          Phase 2 — Enter password and KYC document details to complete onboarding.
        </motion.p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-border/50">
          {isSuccess ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">Registration & Documents Submitted!</h3>
              <p className="text-muted mb-6">
                Your password and KYC verification documents have been received. <br />
                Your account is currently under **final admin document review**. You will be able to log in once activated by the Admin.
              </p>
              <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors">
                Go to Login Page
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {submitError && (
                <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
                  {submitError}
                </div>
              )}

              {/* Prefilled Locked Phase 1 Data */}
              <div className="bg-surface-alt/60 p-4 rounded-xl border border-border/60 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Approved Lead Application Info (Read-Only)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Full Name</label>
                    <input type="text" value={prefill.full_name} disabled className={disabledClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Email</label>
                    <input type="text" value={prefill.email} disabled className={disabledClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Phone</label>
                    <input type="text" value={prefill.phone} disabled className={disabledClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">State</label>
                    <input type="text" value={prefill.state} disabled className={disabledClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">City</label>
                    <input type="text" value={prefill.city} disabled className={disabledClass} />
                  </div>
                </div>
              </div>

              {/* Phase 2 Inputs */}
              <h4 className="text-sm font-semibold text-text border-b border-border pb-2">Phase 2 Account Credentials & KYC Details</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Organization Name *</label>
                  <input type="text" {...register('org_name')} className={inputClass} disabled={isSubmitting} />
                  {errors.org_name && <p className="text-xs text-danger mt-1">{errors.org_name.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Zone *</label>
                  <input type="text" {...register('zone')} className={inputClass} placeholder="e.g. West Zone" disabled={isSubmitting} />
                  {errors.zone && <p className="text-xs text-danger mt-1">{errors.zone.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Password *</label>
                  <input type="password" {...register('password')} className={inputClass} placeholder="Min. 8 characters" disabled={isSubmitting} />
                  {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <input type="password" {...register('confirm_password')} className={inputClass} placeholder="Re-enter password" disabled={isSubmitting} />
                  {errors.confirm_password && <p className="text-xs text-danger mt-1">{errors.confirm_password.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Aadhaar Number *</label>
                  <input type="text" {...register('aadhaar_number')} className={inputClass} placeholder="12 digit Aadhaar" maxLength={12} disabled={isSubmitting} />
                  {errors.aadhaar_number && <p className="text-xs text-danger mt-1">{errors.aadhaar_number.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>PAN Number *</label>
                  <input type="text" {...register('pan_number')} className={inputClass + " uppercase"} placeholder="ABCDE1234F" disabled={isSubmitting} />
                  {errors.pan_number && <p className="text-xs text-danger mt-1">{errors.pan_number.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Street Address *</label>
                  <input type="text" {...register('address')} className={inputClass} placeholder="Full Registered Address" disabled={isSubmitting} />
                  {errors.address && <p className="text-xs text-danger mt-1">{errors.address.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <DocumentUploader label="Upload Verification KYC Documents (ID / GST / Registration)" files={documents} onChange={setDocuments} disabled={isSubmitting} />
                {docError && <p className="text-xs text-danger font-medium mt-1">{docError}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6">
                {isSubmitting ? 'Submitting Registration & Uploading Documents...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
