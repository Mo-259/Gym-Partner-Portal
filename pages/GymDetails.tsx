import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Building2, MapPin, Phone, Mail, CheckCircle, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';

const GymDetails: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    facilities: [] as string[],
  });
  const [facilityInput, setFacilityInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    const checkExistingGym = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      try {
        // Verify session is still valid
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('Session expired, redirecting to sign in');
          navigate('/signin');
          return;
        }

        // Use .maybeSingle() instead of .single() to handle cases where no gym exists
        const { data, error } = await supabase
          .from('gyms')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) {
          // Handle specific error codes
          if (error.code === 'PGRST116' || error.code === '406') {
            // No gym found - this is expected for new users, allow them to create one
            setCheckingExisting(false);
          } else if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
            // Authentication error
            console.error('Authentication error checking existing gym:', error.message);
            navigate('/signin');
          } else {
            // Other errors - log but allow user to continue
            console.error('Error checking existing gym:', error.message, error);
            setCheckingExisting(false);
          }
          return;
        }

        if (data) {
          // Gym already exists, redirect to dashboard
          navigate('/');
        } else {
          // No gym found, allow user to create one
          setCheckingExisting(false);
        }
      } catch (err: any) {
        console.error('Unexpected error checking existing gym:', err);
        setCheckingExisting(false);
      }
    };

    checkExistingGym();
  }, [user, navigate]);

  const handleAddFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facilityInput.trim()],
      });
      setFacilityInput('');
    }
  };

  const handleRemoveFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((f) => f !== facility),
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.city || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a gym');
      return;
    }

    setLoading(true);

    try {
      // Verify session is still valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please sign in again.');
        setLoading(false);
        navigate('/signin');
        return;
      }

      let avatarUrl: string | null = null;

      // Upload avatar to Supabase Storage if file is selected
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `gym-avatars/${fileName}`;

          console.log('Attempting to upload avatar to bucket: gym-assets');
          console.log('File path:', filePath);

          // Upload file to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('gym-assets')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Storage upload error details:');
            console.error('Error message:', uploadError.message);
            console.error('Error status code:', uploadError.statusCode);
            console.error('Full error object:', uploadError);
            
            if (uploadError.message?.includes('Bucket not found') || uploadError.statusCode === '404') {
              throw new Error(
                `Storage bucket 'gym-assets' not found. Please create this bucket in your Supabase Dashboard:\n` +
                `1. Go to Storage in Supabase Dashboard\n` +
                `2. Click "New bucket"\n` +
                `3. Name it: gym-assets\n` +
                `4. Make it public (or set appropriate RLS policies)\n` +
                `5. Click "Create bucket"`
              );
            }
            throw new Error(`Failed to upload avatar: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('gym-assets')
            .getPublicUrl(filePath);

          avatarUrl = urlData.publicUrl;
          console.log('Avatar uploaded successfully:', avatarUrl);
        } catch (storageErr: any) {
          console.error('Storage error:', storageErr.message);
          throw storageErr;
        }
      }

      // Prepare gym data - ensure facilities is properly formatted as array
      const gymData = {
        owner_id: user.id,
        name: formData.name.trim(),
        brand_name: formData.name.trim(), // Use gym name as brand name
        city: formData.city.trim(),
        address: formData.address.trim(),
        contact_email: formData.contactEmail?.trim() || profile?.email || null,
        contact_phone: formData.contactPhone?.trim() || null,
        facilities: Array.isArray(formData.facilities) ? formData.facilities : [],
        avatar_url: avatarUrl,
        tier: 'standard' as const, // Default tier
        supports_bundles: false, // Default
      };

      console.log('Attempting to create gym with data:', {
        ...gymData,
        facilities: gymData.facilities, // Log facilities array
        facilities_type: typeof gymData.facilities,
        facilities_length: gymData.facilities.length,
      });

      // Create gym record
      const { data, error: gymError } = await supabase
        .from('gyms')
        .insert(gymData)
        .select()
        .single();

      if (gymError) {
        console.error('Database insert error details:');
        console.error('Error message:', gymError.message);
        console.error('Error code:', gymError.code);
        console.error('Error details:', gymError.details);
        console.error('Error hint:', gymError.hint);
        console.error('Full error object:', gymError);
        
        if (gymError.code === 'PGRST301' || gymError.message?.includes('JWT')) {
          setError('Authentication error. Please sign in again.');
          navigate('/signin');
        } else if (gymError.code === '23505') {
          // Unique constraint violation - gym already exists
          setError('A gym already exists for this account.');
        } else if (gymError.code === '23502') {
          // Not null violation - missing required field
          setError(`Missing required field: ${gymError.message}`);
        } else if (gymError.code === '42703') {
          // Undefined column
          setError(`Database column error: ${gymError.message}. Please check your database schema.`);
        } else {
          setError(`Failed to create gym: ${gymError.message}`);
        }
        setLoading(false);
        return;
      }

      console.log('Gym created successfully:', data);
      // Redirect to dashboard on success
      navigate('/');
    } catch (err: any) {
      console.error('Unexpected error creating gym:');
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Full error object:', err);
      setError(err.message || 'Failed to create gym. Please try again.');
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005CFF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gym Information</h1>
          <p className="text-gray-400">Tell us about your gym</p>
        </div>

        <Card className="bg-[#121212] border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Gym Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="Roma Fit Gym"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Gym Avatar
                </label>
                <div className="space-y-3">
                  {avatarPreview ? (
                    <div className="relative">
                      <div className="relative w-full h-32 bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden group">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-full transition-colors"
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <Upload size={18} />
                            <span>Change image</span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Hover to change image</p>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg bg-[#0A0A0A] cursor-pointer hover:border-[#005CFF] transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon size={32} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400 mb-1">
                          <span className="font-semibold text-[#005CFF]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                City <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                  placeholder="New York"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Address <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none resize-none"
                rows={3}
                placeholder="123 Main Street, Suite 100"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder={profile?.email || 'contact@gym.com'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Contact Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Facilities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFacility();
                    }
                  }}
                  className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#005CFF] focus:outline-none"
                  placeholder="e.g., Pool, Sauna, Yoga Studio"
                />
                <button
                  type="button"
                  onClick={handleAddFacility}
                  className="bg-[#005CFF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.facilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white flex items-center gap-2"
                    >
                      {facility}
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(facility)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005CFF] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Gym...' : 'Complete Registration'}
              {!loading && <CheckCircle size={18} />}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default GymDetails;
