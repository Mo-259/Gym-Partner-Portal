import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Plus, Clock, Users, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useClassSchedule } from '../hooks/useGymData';
import { ClassScheduleItem } from '../types/gym';

const Schedule: React.FC = () => {
  const { data: initialSchedule, loading } = useClassSchedule();
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);
  
  // Date Filter State
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'tomorrow' | 'week'>('today');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassScheduleItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    instructorName: '',
    hour: '09:00',
    duration: 60,
    capacity: 20,
    status: 'active' as 'active' | 'cancelled'
  });

  // Sync mock data
  useEffect(() => {
    if (initialSchedule) {
      setScheduleItems(initialSchedule);
    }
  }, [initialSchedule]);

  // Filtering
  const filteredSchedule = scheduleItems.filter(item => {
    const today = new Date();
    const itemDate = new Date(item.dateTime);
    
    // Reset hours for comparison
    const todayStr = today.toDateString();
    const itemDateStr = itemDate.toDateString();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    if (selectedDateFilter === 'today') return itemDateStr === todayStr;
    if (selectedDateFilter === 'tomorrow') return itemDateStr === tomorrowStr;
    // Simple mock "week" check (next 7 days)
    if (selectedDateFilter === 'week') {
        const diffTime = itemDate.getTime() - today.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24); 
        return diffDays >= 0 && diffDays <= 7;
    }
    return true;
  }).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  // Handlers
  const handleOpenModal = (item?: ClassScheduleItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        instructorName: item.instructorName,
        hour: item.dateTime.toTimeString().slice(0, 5),
        duration: item.durationMinutes,
        capacity: item.capacity,
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        instructorName: '',
        hour: '09:00',
        duration: 60,
        capacity: 20,
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const dateBase = new Date();
    if (selectedDateFilter === 'tomorrow') {
        dateBase.setDate(dateBase.getDate() + 1);
    }
    // Set time from form
    const [h, m] = formData.hour.split(':');
    dateBase.setHours(parseInt(h), parseInt(m), 0, 0);

    if (editingItem) {
      // Update
      setScheduleItems(prev => prev.map(item => 
        item.id === editingItem.id ? {
          ...item,
          name: formData.name,
          instructorName: formData.instructorName,
          dateTime: dateBase,
          durationMinutes: formData.duration,
          capacity: formData.capacity,
          status: formData.status
        } : item
      ));
    } else {
      // Create
      const newItem: ClassScheduleItem = {
        id: `new_${Date.now()}`,
        name: formData.name,
        instructorName: formData.instructorName,
        dateTime: dateBase,
        durationMinutes: formData.duration,
        capacity: formData.capacity,
        bookedCount: 0,
        status: formData.status
      };
      setScheduleItems(prev => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <PageHeader 
        title="Schedule & Classes" 
        description="Plan and manage your classes."
        actions={
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#005CFF] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span>Add Class</span>
          </button>
        }
      />

      {/* Date Controls */}
      <div className="flex items-center gap-4 mb-8 border-b border-white/10">
        <button 
          onClick={() => setSelectedDateFilter('today')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
             selectedDateFilter === 'today' ? 'border-[#005CFF] text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Today
        </button>
        <button 
          onClick={() => setSelectedDateFilter('tomorrow')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
             selectedDateFilter === 'tomorrow' ? 'border-[#005CFF] text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Tomorrow
        </button>
        <button 
          onClick={() => setSelectedDateFilter('week')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
             selectedDateFilter === 'week' ? 'border-[#005CFF] text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          This Week
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <p className="text-gray-500 col-span-3 text-center py-10">Loading schedule...</p>}
        
        {!loading && filteredSchedule.map((item) => (
          <Card key={item.id} className="group hover:border-white/20 transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 className="text-lg font-bold text-white">{item.name}</h3>
                 <p className="text-xs text-gray-500 mt-1">{item.dateTime.toLocaleDateString()}</p>
              </div>
              <Badge variant={item.status === 'active' ? 'success' : 'error'}>
                {item.status}
              </Badge>
            </div>
            
            <div className="space-y-3 text-sm text-gray-400 flex-grow">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="text-white font-medium">
                    {item.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>• {item.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{item.bookedCount} / {item.capacity} booked</span>
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full ml-2">
                    <div 
                        className="h-full bg-[#005CFF] rounded-full" 
                        style={{ width: `${Math.min((item.bookedCount/item.capacity)*100, 100)}%`}}
                    ></div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                 <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">
                    {item.instructorName.charAt(0)}
                 </div>
                 <span>{item.instructorName}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(item)}
                  className="flex items-center gap-1 text-xs text-white bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded"
                >
                    <Edit2 size={12} /> Edit
                </button>
            </div>
          </Card>
        ))}
        
        {!loading && filteredSchedule.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-[#121212] rounded-xl border border-white/10 border-dashed">
                <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 font-medium">No classes scheduled for {selectedDateFilter}.</p>
                <button 
                   onClick={() => handleOpenModal()}
                   className="mt-4 text-[#005CFF] hover:underline text-sm"
                >
                    Add a class now
                </button>
            </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Class' : 'Add New Class'}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-sm font-medium px-4">Cancel</button>
            <button onClick={handleSave} className="bg-[#005CFF] hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              {editingItem ? 'Save Changes' : 'Create Class'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
             <label className="block text-sm text-gray-400 mb-1">Class Name</label>
             <input 
               type="text" 
               value={formData.name}
               onChange={e => setFormData({...formData, name: e.target.value})}
               className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
               placeholder="e.g. Morning Yoga"
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-400 mb-1">Time</label>
                <input 
                  type="time" 
                  value={formData.hour}
                  onChange={e => setFormData({...formData, hour: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                />
             </div>
             <div>
                <label className="block text-sm text-gray-400 mb-1">Duration (min)</label>
                <input 
                  type="number" 
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm text-gray-400 mb-1">Instructor</label>
                <input 
                  type="text" 
                  value={formData.instructorName}
                  onChange={e => setFormData({...formData, instructorName: e.target.value})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#005CFF] focus:outline-none"
                />
             </div>
             <div>
                <label className="block text-sm text-gray-400 mb-1">Capacity</label>
                <input 
                  type="number" 
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
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
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Schedule;