import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DocumentUploader } from './DocumentUploader';
import { apiClient } from '../../api/axios';

interface LocationState {
  id: number;
  name: string;
}

interface LocationCity {
  id: number;
  name: string;
}

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Confirm password is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian phone number required'),
  org_name: z.string().min(1, 'Organization name is required'),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  zone: z.string().min(1, 'Zone is required'),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Valid 12-digit Aadhaar number required'),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Valid PAN number required'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

interface OrganizerSignupFormProps {
  onSubmit: (data: FormData, documents: File[]) => void;
  isLoading: boolean;
  error: string | null;
}

export const OrganizerSignupForm: React.FC<OrganizerSignupFormProps> = ({ onSubmit, isLoading, error }) => {
  const [documents, setDocuments] = useState<File[]>([]);
  const [docError, setDocError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedState = watch('state');
  
  const [dbStates, setDbStates] = useState<LocationState[]>([]);
  const [dbCities, setDbCities] = useState<LocationCity[]>([]);

  // Fetch Indian states on mount (India ID = 101)
  useEffect(() => {
    let isMounted = true;
    apiClient.get('/api/locations/countries/101/states')
      .then(res => {
        if (isMounted && res.data?.success) {
          setDbStates(res.data.data);
        }
      })
      .catch(err => console.error("Failed to load states", err));
    return () => { isMounted = false };
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    let isMounted = true;
    if (!watchedState) {
      setDbCities([]);
      return;
    }

    const selectedStateObj = dbStates.find(s => s.name === watchedState);
    if (selectedStateObj) {
      apiClient.get(`/api/locations/states/${selectedStateObj.id}/cities`)
        .then(res => {
          if (isMounted && res.data?.success) {
            setDbCities(res.data.data);
          }
        })
        .catch(err => console.error("Failed to load cities", err));
    } else {
      setDbCities([]);
    }
    
    return () => { isMounted = false };
  }, [watchedState, dbStates]);

  // Reset city when state changes
  useEffect(() => {
    setValue('city', '');
  }, [watchedState, setValue]);

  const handleFormSubmit = (data: FormData) => {
    if (documents.length === 0) {
      setDocError('At least one document (ID/Registration) is required');
      return;
    }
    
    // Check for duplicates
    const hasDuplicates = documents.some((file, idx) => {
      const firstIndex = documents.findIndex(f => f.name === file.name && f.size === file.size);
      return firstIndex !== -1 && firstIndex !== idx;
    });
    
    if (hasDuplicates) {
      setDocError('Duplicate documents are not allowed');
      return;
    }
    
    setDocError('');
    onSubmit(data, documents);
  };

  const inputClass = "w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-text mb-1";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input type="text" {...register('full_name')} className={inputClass} placeholder="John Doe" disabled={isLoading} />
          {errors.full_name && <p className="text-xs text-danger mt-1">{errors.full_name.message}</p>}
        </div>
        
        <div>
          <label className={labelClass}>Organization Name</label>
          <input type="text" {...register('org_name')} className={inputClass} placeholder="Sports Club XYZ" disabled={isLoading} />
          {errors.org_name && <p className="text-xs text-danger mt-1">{errors.org_name.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input type="email" {...register('email')} className={inputClass} placeholder="john@example.com" disabled={isLoading} />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input type="text" {...register('phone')} className={inputClass} placeholder="9876543210" disabled={isLoading} maxLength={10} />
          {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input type="password" {...register('password')} className={inputClass} placeholder="Min. 6 characters" disabled={isLoading} />
          {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Confirm Password</label>
          <input type="password" {...register('confirm_password')} className={inputClass} placeholder="Confirm your password" disabled={isLoading} />
          {errors.confirm_password && <p className="text-xs text-danger mt-1">{errors.confirm_password.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Aadhaar Number</label>
          <input type="text" {...register('aadhaar_number')} className={inputClass} placeholder="12 digit Aadhaar" disabled={isLoading} maxLength={12} />
          {errors.aadhaar_number && <p className="text-xs text-danger mt-1">{errors.aadhaar_number.message}</p>}
        </div>

        <div>
          <label className={labelClass}>PAN Number</label>
          <input type="text" {...register('pan_number')} className={inputClass + " uppercase"} placeholder="ABCDE1234F" disabled={isLoading} />
          {errors.pan_number && <p className="text-xs text-danger mt-1">{errors.pan_number.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className={labelClass}>Street Address</label>
          <input type="text" {...register('address')} className={inputClass} placeholder="123 Main St, Area" disabled={isLoading} />
          {errors.address && <p className="text-xs text-danger mt-1">{errors.address.message}</p>}
        </div>
        
        <div>
          <label className={labelClass}>State</label>
          <select 
            {...register('state')} 
            className={inputClass} 
            disabled={isLoading || dbStates.length === 0}
          >
            <option value="" className="text-gray-900 bg-white">Select State</option>
            {dbStates.map(state => (
              <option key={state.id} value={state.name} className="text-gray-900 bg-white">
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-xs text-danger mt-1">{errors.state.message}</p>}
        </div>

        <div>
          <label className={labelClass}>City</label>
          <select 
            {...register('city')} 
            className={inputClass} 
            disabled={isLoading || !watchedState || dbCities.length === 0}
          >
            <option value="" className="text-gray-900 bg-white">Select City</option>
            {dbCities.map(city => (
              <option key={city.id} value={city.name} className="text-gray-900 bg-white">
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-xs text-danger mt-1">{errors.city.message}</p>}
        </div>
        
        <div>
          <label className={labelClass}>Zone</label>
          <input type="text" {...register('zone')} className={inputClass} placeholder="West" disabled={isLoading} />
          {errors.zone && <p className="text-xs text-danger mt-1">{errors.zone.message}</p>}
        </div>
      </div>

      <div className="pt-2">
        <DocumentUploader
          label="Verification Documents (Max 2)"
          files={documents}
          onChange={setDocuments}
          disabled={isLoading}
        />
        {docError && (
          <p className="text-xs text-danger font-medium mt-1">{docError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting Application...
          </>
        ) : (
          'Apply as Organizer'
        )}
      </button>
    </form>
  );
};
