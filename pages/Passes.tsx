import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Plus, Tag, Edit2, Info } from 'lucide-react';
import { usePasses } from '../hooks/useGymData';
import { PassProduct } from '../types/gym';

const Passes: React.FC = () => {
  const { data: initialPasses, loading } = usePasses();
  const [passes, setPasses] = useState<PassProduct[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPass, setEditingPass] = useState<PassProduct | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'single_visit' as 'single_visit' | 'multi_visit' | 'monthly',
    visitsIncluded: 1,
    validityDays: 1,
    price: 0,
    status: 'active' as 'active' | 'hidden',
    description: ''
  });

  useEffect(() => {
    if (initialPasses) {
      setPasses(initialPasses);
    }
  }, [initialPasses]);

  const handleOpenModal = (pass?: PassProduct) => {
    if (pass) {
      setEditingPass(pass);
      setFormData({
        name: pass.name,
        type: pass.type,
        visitsIncluded: pass.visitsIncluded || 1,
        validityDays: pass.validityDays,
        price: pass.price,
        status: pass.status,
        description: pass.description || ''
      });
    } else {
      setEditingPass(null);
      setFormData({
        name: '',
        type: 'single_visit',
        visitsIncluded: 1,
        validityDays: 30,
        price: 0,
        status: 'active',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingPass) {
      setPasses(prev => prev.map(p => 
        p.id === editingPass.id ? {
          ...p,
          ...formData
        } : p
      ));
    } else {
      const newPass: PassProduct = {
        id: `pass_${Date.now()}`,
        ...formData,
        soldCount: 0
      };
      setPasses(prev => [...prev, newPass]);
    }
    setIsModalOpen(false);
  };

  const getStatusVariant = (status: string) => status === 'active' ? 'success' : 'neutral';

  return (
    <div>
      <PageHeader 
        title="Passes & Pricing" 
        description="Control how users pay to train at your gym (marketplace side)."
        actions={
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#005CFF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span>Create New Pass</span>
          </button>
        }
      />

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 flex gap-3 items-start">
         <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-blue-400 font-semibold text-sm">Marketplace vs Bundles</h4>
            <p className="text-blue-200/70 text-sm mt-1">These passes are sold directly to users via your gym's page. Platform bundles (e.g. "City Wide Access") are separate and managed by the platform admin, though you earn revenue when they are used here.</p>
         </div>
      </div>

      <Card className="min-h-[400px]">
        {loading ? (
           <p className="text-center text-gray-500 py-10">Loading passes...</p>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-400">
               <thead className="text-xs uppercase bg-white/5 text-gray-200">
                 <tr>
                   <th className="px-6 py-4 rounded-tl-lg">Name</th>
                   <th className="px-6 py-4">Type</th>
                   <th className="px-6 py-4">Visits</th>
                   <th className="px-6 py-4">Validity</th>
                   <th className="px-6 py-4">Price</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {passes.map(pass => (
                   <tr key={pass.id} className="hover:bg-white/5 transition-colors">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/5 rounded-lg text-[#005CFF]">
                            <Tag size={16} />
                         </div>
                         <div>
                            <p className="font-semibold text-white">{pass.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{pass.description}</p>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 capitalize">{pass.type.replace('_', ' ')}</td>
                     <td className="px-6 py-4">
                        {pass.type === 'monthly' ? 'Unlimited' : pass.visitsIncluded}
                     </td>
                     <td className="px-6 py-4">{pass.validityDays} days</td>
                     <td className="px-6 py-4 font-mono text-white font-medium">${pass.price.toFixed(2)}</td>
                     <td className="px-6 py-4">
                       <Badge variant={getStatusVariant(pass.status)}>
                         {pass.status}
                       </Badge>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleOpenModal(pass)}
                         className="text-gray-400 hover:text-white transition-colors"
                       >
                         <Edit2 size={16} />
                       </button>
                     </td>
                   </tr>
                 ))}
                 {passes.length === 0 && (
                   <tr><td colSpan={7} className="text-center py-10">No passes created yet.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPass ? 'Edit Pass' : 'Create New Pass'}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-sm font-medium px-4">Cancel</button>
            <button onClick={handleSave} className="bg-[#005CFF] hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              {editingPass ? 'Save Changes' : 'Create Pass'}
            </button>
          </>
        }
      >
         <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pass Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                placeholder="e.g. 10-Class Pack"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                >
                   <option value="single_visit">Single Visit</option>
                   <option value="multi_visit">Multi Visit</option>
                   <option value="monthly">Monthly Subscription</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Visits Included</label>
                <input 
                  type="number" 
                  value={formData.visitsIncluded}
                  disabled={formData.type === 'monthly'}
                  onChange={e => setFormData({...formData, visitsIncluded: parseInt(e.target.value)})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Validity (Days)</label>
                <input 
                  type="number" 
                  value={formData.validityDays}
                  onChange={e => setFormData({...formData, validityDays: parseInt(e.target.value)})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
              >
                 <option value="active">Active (Visible)</option>
                 <option value="hidden">Hidden (Draft)</option>
              </select>
            </div>
            <div>
               <label className="block text-sm text-gray-400 mb-1">Description</label>
               <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none h-24 resize-none"
               />
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default Passes;