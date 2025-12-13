import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck, User, Plus, Edit2, Mail } from 'lucide-react';
import { useStaff } from '../hooks/useGymData';
import { StaffAccount } from '../types/gym';
import { CURRENT_USER } from '../constants';

const Staff: React.FC = () => {
  const { data: initialStaff, loading } = useStaff();
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'front_desk' as StaffAccount['role'],
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    if (initialStaff) setStaffList(initialStaff);
  }, [initialStaff]);

  // Handlers
  const handleOpenModal = (staff?: StaffAccount) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        status: staff.status
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        role: 'front_desk',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingStaff) {
      // Edit mode
      setStaffList(prev => prev.map(s => 
        s.id === editingStaff.id ? { ...s, ...formData } : s
      ));
    } else {
      // Invite mode
      const newStaff: StaffAccount = {
        id: `stf_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'active'
      };
      setStaffList(prev => [...prev, newStaff]);
    }
    setIsModalOpen(false);
  };

  // Only Owner/Manager can edit
  const canEdit = CURRENT_USER.role === 'Owner' || CURRENT_USER.role === 'Manager';

  const roleColors = {
    owner: 'purple',
    manager: 'blue',
    front_desk: 'default',
    trainer: 'warning'
  } as const;

  return (
    <div>
      <PageHeader 
        title="Staff & Access" 
        description="Control who can access this gym’s portal."
        actions={
          canEdit && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#005CFF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              <span>Invite Staff</span>
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-gray-500">Loading staff...</p> : staffList.map((staff) => (
            <Card key={staff.id} className="flex flex-col relative group">
                <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                            {staff.avatarUrl ? (
                                <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} className="text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">{staff.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                <Mail size={10} />
                                <span>{staff.email}</span>
                            </div>
                        </div>
                     </div>
                     {canEdit && (
                         <button 
                           onClick={() => handleOpenModal(staff)}
                           className="text-gray-500 hover:text-white transition-colors p-1"
                         >
                             <Edit2 size={16} />
                         </button>
                     )}
                </div>
                
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <Badge variant={roleColors[staff.role] || 'default'}>
                        {staff.role.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${staff.status === 'active' ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                        <span className="text-gray-400 capitalize">{staff.status}</span>
                    </div>
                </div>
                {staff.lastLoginAt && (
                   <p className="mt-2 text-[10px] text-gray-600 text-right">Last login: {staff.lastLoginAt.toLocaleDateString()}</p>
                )}
            </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Account' : 'Invite New Staff'}
        footer={
           <>
             <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-sm font-medium px-4">Cancel</button>
             <button onClick={handleSave} className="bg-[#005CFF] hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
               {editingStaff ? 'Save Changes' : 'Send Invite'}
             </button>
           </>
        }
      >
          <div className="space-y-4">
              <div>
                 <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                 />
              </div>
              <div>
                 <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                 <input 
                   type="email" 
                   value={formData.email}
                   disabled={!!editingStaff} // Email usually immutable or needs re-invite
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className={`w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none ${editingStaff ? 'opacity-50 cursor-not-allowed' : ''}`}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm text-gray-400 mb-1">Role</label>
                     <select 
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as any})}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                     >
                        <option value="manager">Manager</option>
                        <option value="front_desk">Front Desk</option>
                        <option value="trainer">Trainer</option>
                        {CURRENT_USER.role === 'Owner' && <option value="owner">Owner</option>}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm text-gray-400 mb-1">Status</label>
                     <select 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                     >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                     </select>
                  </div>
              </div>
              {!editingStaff && (
                  <div className="bg-blue-500/10 p-3 rounded text-xs text-blue-200">
                      An invitation email will be sent to this address with instructions to set up their password.
                  </div>
              )}
          </div>
      </Modal>
    </div>
  );
};

export default Staff;