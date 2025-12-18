import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Globe,
  Tag,
  Palette,
  Info,
  X,
  Upload,
  Image as ImageIcon,
  Star,
} from 'lucide-react';

interface GymFormData {
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  tier: 'standard' | 'premium';
  status: 'pending' | 'approved' | 'rejected';
  supports_bundles: boolean;
  facilities: string[];
  contact_email: string;
  contact_phone: string;
  branding_color: string;
  image_url: string;
  rating: string;
  reviews: string;
}

const GymAdditionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshGym } = useAuth();
  const [formData, setFormData] = useState<GymFormData>({
    name: '',
    slug: '',
    description: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    tier: 'standard',
    status: 'pending',
    supports_bundles: true,
    facilities: [],
    contact_email: '',
    contact_phone: '',
    branding_color: '#005CFF',
    image_url: '',
    rating: '0.0',
    reviews: '0',
  });
  const [facilityInput, setFacilityInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(name) }));
    }
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB as per bucket configuration)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError('Gym name is required');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Slug is required');
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      setError('Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    if (!user) {
      setError('You must be logged in to add a gym');
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | null = null;
      setImageUploadFailed(false);

      // Upload image to Supabase Storage if file is selected
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = fileName;

          console.log('Attempting to upload image to bucket: gym-logos');
          console.log('File path:', filePath);
          console.log('File size:', imageFile.size, 'bytes');
          console.log('File type:', imageFile.type);

          // Upload file to Supabase Storage gym-logos bucket
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('gym-logos')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Storage upload error details:');
            console.error('Error message:', uploadError.message);
            console.error('Error status code:', uploadError.statusCode);
            console.error('Full error object:', uploadError);
            
            // Check for specific error types and provide helpful messages
            let uploadErrorMessage = 'Image upload failed';
            let needsRLS = false;
            
            if (uploadError.statusCode === '400') {
              uploadErrorMessage = `Image upload failed (400 Bad Request). The storage bucket needs RLS policies configured.`;
              needsRLS = true;
            } else if (uploadError.message?.includes('Bucket not found') || uploadError.statusCode === '404') {
              uploadErrorMessage = `Storage bucket 'gym-logos' not found. Please create this bucket in your Supabase Dashboard.`;
            } else if (uploadError.message?.includes('new row violates row-level security policy') || uploadError.message?.includes('RLS')) {
              uploadErrorMessage = `Permission denied. RLS policies need to be set up for the 'gym-logos' bucket.`;
              needsRLS = true;
            } else {
              uploadErrorMessage = `Image upload failed: ${uploadError.message || 'Unknown error'}.`;
            }
            
            // Show error but allow gym creation to continue
            console.warn('Image upload failed, continuing without image:', uploadErrorMessage);
            
            // Store upload error state (we'll show it in the UI but continue)
            if (needsRLS) {
              // For RLS errors, we'll show it but still allow gym creation
              // The error will be shown in the UI with instructions
            }
            
            // Continue without image - imageUrl stays null
            setImageUploadFailed(true);
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('gym-logos')
              .getPublicUrl(filePath);

            imageUrl = urlData.publicUrl;
            console.log('Image uploaded successfully:', imageUrl);
          }
        } catch (storageErr: any) {
          console.error('Storage error:', storageErr.message);
          // Continue without image - imageUrl stays null
          setImageUploadFailed(true);
        }
      }

      // Prepare gym data
      // Status is always 'pending' and cannot be changed by user
      const gymData: any = {
        owner_id: user.id,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        tier: formData.tier,
        status: 'pending', // Always set to pending, cannot be changed
        supports_bundles: formData.supports_bundles,
        facilities: formData.facilities.length > 0 ? formData.facilities : null,
        contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        branding_color: formData.branding_color,
        image_url: imageUrl || null,
        rating: formData.rating ? parseFloat(formData.rating) : 0.0,
        reviews: formData.reviews ? parseInt(formData.reviews, 10) : 0,
      };

      // Insert gym into database
      const { data, error: insertError } = await supabase
        .from('gyms')
        .insert(gymData)
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        let errorMessage = 'Failed to create gym. ';
        
        if (insertError.code === '23505') {
          errorMessage = 'A gym with this slug already exists. Please choose a different slug.';
        } else if (insertError.code === '23502') {
          errorMessage = `Missing required field. ${insertError.message}`;
        } else if (insertError.code === '42501') {
          errorMessage = 'Permission denied. Please check your account permissions.';
        } else if (insertError.message) {
          errorMessage = `Failed to create gym: ${insertError.message}`;
        } else {
          errorMessage = 'Failed to create gym. Please try again or contact support.';
        }
        
        setError(errorMessage);
        setSuccess(false);
        setLoading(false);
        return;
      }

      // Success - gym created
      console.log('Gym created successfully:', data);

      // Refresh gym in context
      try {
        await refreshGym();
      } catch (refreshError) {
        console.warn('Error refreshing gym context:', refreshError);
        // Don't fail the whole operation if refresh fails
      }

      // Show success message and clear any errors
      setError(null);
      setSuccess(true);
      setLoading(false);

      // Redirect to dashboard home after showing success message
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (err: any) {
      console.error('Unexpected error creating gym:', err);
      setError(err.message || 'An unexpected error occurred. Please try again or contact support.');
      setSuccess(false);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Add New Gym</h1>
          <p className="text-gray-400">Register a new gym to the platform</p>
        </div>

        <Card className="bg-[#121212] border-white/10">
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-400 font-semibold mb-1">Success!</p>
                <p className="text-green-300 text-sm">
                  {imageFile && imageUploadFailed ? (
                    <>
                      Gym created successfully! However, the image upload failed due to missing storage permissions.
                      <br />
                      <span className="text-yellow-300 mt-2 block">
                        To fix: Run the SQL in <code className="bg-black/30 px-1 py-0.5 rounded">migrations/setup_gym_logos_storage_policies.sql</code> in your Supabase SQL Editor, then update the gym to add the image.
                      </span>
                    </>
                  ) : (
                    'The gym has been registered successfully and is pending approval. Redirecting to dashboard...'
                  )}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 font-semibold mb-1">Error</p>
                  <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
                  {error.includes('RLS policies') || error.includes('400 Bad Request') ? (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-xs font-semibold mb-1">💡 To fix image upload:</p>
                      <p className="text-yellow-200 text-xs">
                        Run the SQL in <code className="bg-black/30 px-1 py-0.5 rounded">migrations/setup_gym_logos_storage_policies.sql</code> in your Supabase SQL Editor to set up storage permissions.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="border-b border-white/10 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 size={20} />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Gym Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="Roma Fit Gym"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Slug <span className="text-red-400">*</span>
                    <span className="text-xs text-gray-500 ml-2">(URL-friendly identifier)</span>
                  </label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                      placeholder="roma-fit-gym"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none resize-none"
                  rows={4}
                  placeholder="Describe your gym, its facilities, and what makes it special..."
                />
              </div>

              {/* Gym Image Upload */}
              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Gym Logo/Image
                  <span className="text-xs text-gray-500 ml-2">(Max 5MB)</span>
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-full h-64 rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={imagePreview}
                        alt="Gym preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-[#0A0A0A] hover:bg-[#0F0F0F] hover:border-[#005CFF] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon size={32} className="text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Rating and Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Star size={16} />
                    Rating (0.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="4.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 0.0</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Total Reviews</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 0</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="border-b border-white/10 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Location
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="123 Main Street, Suite 100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="40.7128"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="-74.0060"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-b border-white/10 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail size={20} />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                      placeholder="contact@gym.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Contact Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="border-b border-white/10 pb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Tag size={20} />
                Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'standard' | 'premium' })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <input
                    type="text"
                    value="Pending"
                    readOnly
                    disabled
                    className="w-full bg-[#0A0A0A]/50 border border-white/10 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Status is set to pending by default and cannot be changed</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-2">Branding Color</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Palette size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="color"
                      value={formData.branding_color}
                      onChange={(e) => setFormData({ ...formData, branding_color: e.target.value })}
                      className="w-20 h-12 bg-[#0A0A0A] border border-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.branding_color}
                    onChange={(e) => setFormData({ ...formData, branding_color: e.target.value })}
                    className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#005CFF] focus:outline-none"
                    placeholder="#005CFF"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.supports_bundles}
                    onChange={(e) => setFormData({ ...formData, supports_bundles: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-[#0A0A0A] text-[#005CFF] focus:ring-2 focus:ring-[#005CFF]"
                  />
                  <span className="text-sm text-gray-400">Supports Bundles</span>
                </label>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Info size={20} />
                Facilities
              </h2>
              
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
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#005CFF] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Gym...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={18} />
                    Gym Added Successfully!
                  </>
                ) : (
                  <>
                    Add Gym
                    <CheckCircle size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default GymAdditionPage;
