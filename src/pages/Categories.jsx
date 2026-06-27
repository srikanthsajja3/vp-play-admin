import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Image, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    has_subjects: 1,
    is_active: 1
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/education_category.php');
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Check query params to open add modal
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      openAddModal();
      // Clean up the URL search param
      navigate('/categories', { replace: true });
    }
  }, [location.search]);

  const openAddModal = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      image_url: '',
      has_subjects: 1,
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      image_url: cat.image_url || '',
      has_subjects: Number(cat.has_subjects),
      is_active: Number(cat.is_active)
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (selectedCategory) {
        // Edit Mode
        const res = await api.put('/education_category.php', {
          id: Number(selectedCategory.id),
          name: formData.name,
          image_url: formData.image_url,
          has_subjects: Number(formData.has_subjects),
          is_active: Number(formData.is_active)
        });
        if (res.data?.success) {
          toast.success(res.data.message || 'Category updated successfully');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          toast.error(res.data?.message || 'Failed to update category');
        }
      } else {
        // Add Mode
        const res = await api.post('/education_category.php', {
          name: formData.name,
          image_url: formData.image_url,
          has_subjects: Number(formData.has_subjects)
        });
        if (res.data?.success) {
          toast.success(res.data.message || 'Category added successfully');
          setIsModalOpen(false);
          fetchCategories();
        } else {
          toast.error(res.data?.message || 'Failed to add category');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(selectedCategory ? 'Error updating category' : 'Error adding category');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      const res = await api.delete(`/education_category.php?id=${selectedCategory.id}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Category deleted successfully');
        setIsDeleteOpen(false);
        fetchCategories();
      } else {
        toast.error(res.data?.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && Number(cat.is_active) === 1) || 
      (filterActive === 'inactive' && Number(cat.is_active) === 0);
    return matchesSearch && matchesActive;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Category Catalog</h2>
          <p className="text-slate-400 mt-1">Classify your subjects and organize curriculum groupings.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-750 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-650/20 text-sm"
        >
          <Plus className="h-5 w-5" /> Add Category
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-slate-950/20 border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
        
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
          <FolderKanban className="h-12 w-12 text-slate-650 mb-3 animate-pulse" />
          <p className="font-semibold text-slate-300">No categories found</p>
          <p className="text-sm text-slate-500 mt-1">Try resetting your filters or creating a new category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl transition-all duration-350 flex flex-col justify-between group"
            >
              {/* Category Image Header */}
              <div className="relative aspect-video bg-slate-950/80 overflow-hidden flex items-center justify-center border-b border-slate-850">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&q=80';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                    <Image className="h-10 w-10" />
                    <span className="text-[10px] font-semibold">No Image</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    Number(cat.is_active) === 1
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {Number(cat.is_active) === 1 ? 'Active' : 'Inactive'}
                  </span>
                  
                  {Number(cat.has_subjects) === 1 && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Has Subjects
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-200 group-hover:text-white transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-slate-500 text-xs mt-1.5">
                    Added: {new Date(cat.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-850">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-slate-300 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(cat)}
                    className="flex items-center justify-center bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 p-2 rounded-xl text-xs transition-all"
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
                {selectedCategory ? 'Edit Category' : 'Create Category'}
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Mathematics"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
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
                  placeholder="https://example.com/image.png"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
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

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Has Subjects</p>
                    <p className="text-xs text-slate-500">Toggle whether this category nests individual courses</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('has_subjects')}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {formData.has_subjects === 1 ? (
                      <ToggleRight className="h-8 w-8 text-violet-500" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-600" />
                    )}
                  </button>
                </div>

                {selectedCategory && (
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Active Status</p>
                      <p className="text-xs text-slate-500">Enable or disable this category globally</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('is_active')}
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
              </div>

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
                  {selectedCategory ? 'Save Changes' : 'Create Category'}
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
              <h3 className="text-lg font-bold text-white">Delete Category?</h3>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-200">"{selectedCategory?.name}"</span>? 
              This action cannot be undone and may affect associated subjects and lessons.
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
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
