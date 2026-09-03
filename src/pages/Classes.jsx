import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Folder, 
  FolderPlus,
  AlertCircle, 
  ToggleLeft, 
  ToggleRight,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const STORAGE_KEY = 'vrplay_classes_data';

const DEFAULT_CLASSES = [
  { id: '1', name: 'Class 9', description: 'Ninth Grade Standard Syllabus', is_active: 1, created_at: new Date().toISOString() },
  { id: '2', name: 'Class 10', description: 'Tenth Grade Board Syllabus', is_active: 1, created_at: new Date().toISOString() },
  { id: '3', name: 'Class 11', description: 'Eleventh Grade Higher Secondary', is_active: 1, created_at: new Date().toISOString() },
  { id: '4', name: 'Class 12', description: 'Twelfth Grade Senior Secondary', is_active: 1, created_at: new Date().toISOString() }
];

export const getStoredClasses = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load local classes', e);
  }
  return DEFAULT_CLASSES;
};

export const saveStoredClasses = (classes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  } catch (e) {
    console.error('Failed to save local classes', e);
  }
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: 1
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      // Attempt API call if backend supports education_class.php, else fallback to localStorage
      try {
        const res = await api.get('/education_class.php');
        if (res.data?.classes && Array.isArray(res.data.classes)) {
          setClasses(res.data.classes);
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        // Fallback to localStorage
      }
      setClasses(getStoredClasses());
    } catch (err) {
      console.error(err);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const openAddModal = () => {
    setSelectedClass(null);
    setFormData({
      name: '',
      description: '',
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setSelectedClass(cls);
    setFormData({
      id: cls.id,
      name: cls.name,
      description: cls.description || '',
      is_active: Number(cls.is_active)
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (cls) => {
    setSelectedClass(cls);
    setIsDeleteOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      is_active: prev.is_active === 1 ? 0 : 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Class name is required');
      return;
    }

    try {
      // Check if backend API works
      try {
        const payload = {
          name: formData.name,
          description: formData.description,
          is_active: Number(formData.is_active)
        };
        if (selectedClass) {
          const res = await api.put('/education_class.php', { ...payload, id: selectedClass.id });
          if (res.data?.success) {
            toast.success(res.data.message || 'Class updated');
            setIsModalOpen(false);
            fetchClasses();
            return;
          }
        } else {
          const res = await api.post('/education_class.php', payload);
          if (res.data?.success) {
            toast.success(res.data.message || 'Class created');
            setIsModalOpen(false);
            fetchClasses();
            return;
          }
        }
      } catch (e) {
        // LocalStorage fallback
      }

      const current = getStoredClasses();
      if (selectedClass) {
        const updated = current.map(c => c.id === selectedClass.id ? {
          ...c,
          name: formData.name,
          description: formData.description,
          is_active: Number(formData.is_active)
        } : c);
        saveStoredClasses(updated);
        setClasses(updated);
        toast.success('Class updated successfully');
      } else {
        const newClass = {
          id: String(Date.now()),
          name: formData.name,
          description: formData.description,
          is_active: Number(formData.is_active),
          created_at: new Date().toISOString()
        };
        const updated = [...current, newClass];
        saveStoredClasses(updated);
        setClasses(updated);
        toast.success('New Class folder added');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error saving class');
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
      try {
        const res = await api.delete(`/education_class.php?id=${selectedClass.id}`);
        if (res.data?.success) {
          toast.success('Class deleted');
          setIsDeleteOpen(false);
          fetchClasses();
          return;
        }
      } catch (e) {}

      const current = getStoredClasses();
      const updated = current.filter(c => c.id !== selectedClass.id);
      saveStoredClasses(updated);
      setClasses(updated);
      toast.success('Class folder removed');
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error deleting class');
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(search.toLowerCase()) ||
      (cls.description && cls.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && Number(cls.is_active) === 1) || 
      (filterActive === 'inactive' && Number(cls.is_active) === 0);
      
    return matchesSearch && matchesActive;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" /> Parent Level Folders
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Classes</h2>
          <p className="text-slate-400 mt-1">Manage parent grade levels (Class 9, Class 10, Class 11, Class 12, etc.).</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-violet-650 hover:bg-violet-750 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg text-sm"
        >
          <Plus className="h-5 w-5" /> Add New Class
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/20 border border-slate-800">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
          <FolderPlus className="h-12 w-12 text-slate-650 mb-3 animate-pulse" />
          <p className="font-semibold text-slate-300">No classes found</p>
          <p className="text-sm text-slate-500 mt-1">Create a parent class folder to organize your educational content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredClasses.map((cls) => (
            <div 
              key={cls.id} 
              className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-violet-600/10 border border-violet-500/20 rounded-xl text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <Folder className="h-7 w-7" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    Number(cls.is_active) === 1
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {Number(cls.is_active) === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h4 className="font-bold text-lg text-slate-100 group-hover:text-violet-400 transition-colors">
                  {cls.name}
                </h4>
                {cls.description && (
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {cls.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-850 flex gap-2">
                <button
                  onClick={() => openEditModal(cls)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-slate-350 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => openDeleteModal(cls)}
                  className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-450 hover:text-rose-450 p-2 rounded-xl text-xs transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {selectedClass ? 'Edit Class Folder' : 'Create Class Folder'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Class 10"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter standard or description..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none resize-none"
                />
              </div>

              {selectedClass && (
                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-855 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Active Status</p>
                    <p className="text-xs text-slate-500">Enable or disable this class folder</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {formData.is_active === 1 ? (
                      <ToggleRight className="h-8 w-8 text-violet-500" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-600" />
                    )}
                  </button>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-855 text-slate-355 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-650 hover:bg-violet-750 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  {selectedClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Class Folder?</h3>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-200">"{selectedClass?.name}"</span>?
            </p>
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-355 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
