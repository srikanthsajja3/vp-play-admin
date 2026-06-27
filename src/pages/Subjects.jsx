import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Image, 
  AlertCircle, 
  Filter,
  ToggleLeft, 
  ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const Subjects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    image_url: '',
    is_active: 1
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjRes, catRes] = await Promise.all([
        api.get('/education_subject.php'),
        api.get('/education_category.php')
      ]);
      setSubjects(subjRes.data?.subjects || []);
      setCategories(catRes.data?.categories || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subjects or categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check query params to open add modal
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      openAddModal();
      // Clean up search param
      navigate('/subjects', { replace: true });
    }
  }, [location.search]);

  const openAddModal = () => {
    setSelectedSubject(null);
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      name: '',
      image_url: '',
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setSelectedSubject(sub);
    setFormData({
      id: sub.id,
      category_id: sub.category_id,
      name: sub.name,
      image_url: sub.image_url || '',
      is_active: Number(sub.is_active)
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (sub) => {
    setSelectedSubject(sub);
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
      toast.error('Subject name is required');
      return;
    }
    if (!formData.category_id) {
      toast.error('Please assign a category');
      return;
    }

    try {
      if (selectedSubject) {
        // Edit Mode
        const res = await api.put('/education_subject.php', {
          id: Number(selectedSubject.id),
          category_id: Number(formData.category_id),
          name: formData.name,
          image_url: formData.image_url,
          is_active: Number(formData.is_active)
        });
        if (res.data?.success) {
          toast.success(res.data.message || 'Subject updated successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to update subject');
        }
      } else {
        // Add Mode
        const res = await api.post('/education_subject.php', {
          category_id: Number(formData.category_id),
          name: formData.name,
          image_url: formData.image_url
        });
        if (res.data?.success) {
          toast.success(res.data.message || 'Subject added successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to add subject');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(selectedSubject ? 'Error updating subject' : 'Error adding subject');
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    try {
      const res = await api.delete(`/education_subject.php?id=${selectedSubject.id}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Subject deleted successfully');
        setIsDeleteOpen(false);
        fetchData();
      } else {
        toast.error(res.data?.message || 'Failed to delete subject');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting subject');
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || 
      Number(sub.category_id) === Number(selectedCategoryFilter);
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && Number(sub.is_active) === 1) || 
      (filterActive === 'inactive' && Number(sub.is_active) === 0);
    return matchesSearch && matchesCategory && matchesActive;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Subject Modules</h2>
          <p className="text-slate-400 mt-1">Manage secondary-level courses and educational branches.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-violet-650 hover:bg-violet-750 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg text-sm"
        >
          <Plus className="h-5 w-5" /> Add Subject
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/20 border border-slate-800">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search subjects by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
        
        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none transition-all appearance-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
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
      ) : filteredSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
          <BookOpen className="h-12 w-12 text-slate-650 mb-3 animate-pulse" />
          <p className="font-semibold text-slate-300">No subjects found</p>
          <p className="text-sm text-slate-500 mt-1">Try resetting your filters or creating a new subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSubjects.map((sub) => (
            <div 
              key={sub.id} 
              className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl transition-all duration-350 flex flex-col justify-between group"
            >
              {/* Subject Image Header */}
              <div className="relative aspect-video bg-slate-950/80 overflow-hidden flex items-center justify-center border-b border-slate-850">
                {sub.image_url ? (
                  <img
                    src={sub.image_url}
                    alt={sub.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-650 gap-1">
                    <Image className="h-10 w-10" />
                    <span className="text-[10px] font-semibold">No Image</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    Number(sub.is_active) === 1
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {Number(sub.is_active) === 1 ? 'Active' : 'Inactive'}
                  </span>
                  
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                    {sub.category_name || 'Classroom'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                    {sub.name}
                  </h4>
                  <p className="text-slate-500 text-xs mt-1.5">
                    Category ID: {sub.category_id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-850">
                  <button
                    onClick={() => openEditModal(sub)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-slate-350 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(sub)}
                    className="flex items-center justify-center bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-450 hover:text-rose-400 p-2 rounded-xl text-xs transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-bold text-white">
                {selectedSubject ? 'Edit Subject' : 'Create Subject'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Assignment</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Algebra"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/algebra.png"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-655 focus:outline-none"
                />
                {formData.image_url && (
                  <div className="mt-2 relative aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status Toggle (only in Edit mode) */}
              {selectedSubject && (
                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl pt-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Active Status</p>
                    <p className="text-xs text-slate-500">Enable or disable this subject globally</p>
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
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-855 text-slate-350 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-650 hover:bg-violet-750 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  {selectedSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Subject?</h3>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-200">"{selectedSubject?.name}"</span>? 
              This action cannot be undone and may affect associated video lectures and class modules.
            </p>
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-350 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
