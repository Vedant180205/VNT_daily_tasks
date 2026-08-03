import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/axios';

interface LocationState {
  id: number;
  name: string;
}

interface LocationCity {
  id: number;
  name: string;
}

// Static State-to-DB-ID mapping so state selection immediately resolves state ID
const STATE_NAME_TO_ID_MAP: Record<string, number> = {
  "Andaman and Nicobar Islands": 4023,
  "Andhra Pradesh": 4017,
  "Arunachal Pradesh": 4024,
  "Assam": 4027,
  "Bihar": 4037,
  "Chandigarh": 4031,
  "Chhattisgarh": 4040,
  "Dadra and Nagar Haveli and Daman and Diu": 4033,
  "Delhi": 4021,
  "Goa": 4009,
  "Gujarat": 4030,
  "Haryana": 4007,
  "Himachal Pradesh": 4020,
  "Jammu and Kashmir": 4029,
  "Jharkhand": 4025,
  "Karnataka": 4026,
  "Kerala": 4028,
  "Ladakh": 4852,
  "Lakshadweep": 4019,
  "Madhya Pradesh": 4039,
  "Maharashtra": 4008,
  "Manipur": 4010,
  "Meghalaya": 4006,
  "Mizoram": 4036,
  "Nagaland": 4018,
  "Odisha": 4013,
  "Puducherry": 4011,
  "Punjab": 4015,
  "Rajasthan": 4014,
  "Sikkim": 4034,
  "Tamil Nadu": 4035,
  "Telangana": 4012,
  "Tripura": 4038,
  "Uttar Pradesh": 4022,
  "Uttarakhand": 4016,
  "West Bengal": 4853
};

const ALL_INDIAN_STATES = Object.keys(STATE_NAME_TO_ID_MAP);

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  org_name: z.string().min(1, 'Organization name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian phone number required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
});

type FormData = z.infer<typeof schema>;

interface OrganizerSignupFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  error: string | null;
}

export const OrganizerSignupForm: React.FC<OrganizerSignupFormProps> = ({ onSubmit, isLoading, error }) => {
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
  const [isLoadingStates, setIsLoadingStates] = useState(true);

  // Fetch Indian states from Database on mount (India Country ID = 101)
  useEffect(() => {
    let isMounted = true;
    setIsLoadingStates(true);
    
    apiClient.get('/api/locations/countries/101/states')
      .then(res => {
        if (isMounted && res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setDbStates(res.data.data);
        }
      })
      .catch(err => console.error("Failed to load states from database", err))
      .finally(() => {
        if (isMounted) setIsLoadingStates(false);
      });

    return () => { isMounted = false };
  }, []);

  // Directly fetch cities when state selection changes
  const fetchCitiesForState = async (selectedStateName: string) => {
    setValue('city', ''); // Reset city selection
    if (!selectedStateName) {
      setDbCities([]);
      return;
    }

    // Determine state ID from DB states or static map
    let stateId: number | undefined;
    if (dbStates.length > 0) {
      const match = dbStates.find(s => s.name.toLowerCase() === selectedStateName.toLowerCase());
      if (match) stateId = match.id;
    }
    if (!stateId) {
      const foundKey = Object.keys(STATE_NAME_TO_ID_MAP).find(k => k.toLowerCase() === selectedStateName.toLowerCase());
      if (foundKey) {
        stateId = STATE_NAME_TO_ID_MAP[foundKey];
      }
    }

    if (stateId) {
      try {
        const res = await apiClient.get(`/api/locations/states/${stateId}/cities`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDbCities(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch cities from database", err);
      }
    } else {
      setDbCities([]);
    }
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  const inputClass = "w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-text mb-1";

  const stateOptions = dbStates.length > 0 
    ? dbStates.map(s => s.name) 
    : ALL_INDIAN_STATES;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input type="text" {...register('full_name')} className={inputClass} placeholder="John Doe" disabled={isLoading} />
          {errors.full_name && <p className="text-xs text-danger mt-1">{errors.full_name.message}</p>}
        </div>
        
        <div>
          <label className={labelClass}>Organization Name *</label>
          <input type="text" {...register('org_name')} className={inputClass} placeholder="Sports Club XYZ" disabled={isLoading} />
          {errors.org_name && <p className="text-xs text-danger mt-1">{errors.org_name.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" {...register('email')} className={inputClass} placeholder="john@example.com" disabled={isLoading} />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Phone Number *</label>
          <input type="text" {...register('phone')} className={inputClass} placeholder="9876543210" disabled={isLoading} maxLength={10} />
          {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
        </div>

        {/* State Selection Dropdown */}
        <div>
          <label className={labelClass}>State *</label>
          <select 
            {...register('state', {
              onChange: (e) => fetchCitiesForState(e.target.value)
            })}
            className={inputClass} 
            disabled={isLoading}
          >
            <option value="" className="text-gray-900 bg-white">
              {isLoadingStates ? "Loading states..." : "Select State"}
            </option>
            {stateOptions.map(stateName => (
              <option key={stateName} value={stateName} className="text-gray-900 bg-white">
                {stateName}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-xs text-danger mt-1">{errors.state.message}</p>}
        </div>

        {/* City Selection Dropdown */}
        <div>
          <label className={labelClass}>City *</label>
          <select 
            {...register('city')} 
            className={inputClass} 
            disabled={isLoading || !watchedState}
          >
            <option value="" className="text-gray-900 bg-white">
              {!watchedState ? "Select a State first" : "Select City"}
            </option>
            {dbCities.map(city => (
              <option key={city.id} value={city.name} className="text-gray-900 bg-white">
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-xs text-danger mt-1">{errors.city.message}</p>}
        </div>
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
