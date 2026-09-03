import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Video, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Image, 
  AlertCircle, 
  Clock,
  Play,
  FileText,
  ToggleLeft, 
  ToggleRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const Videos = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]); // All subjects (for list filter)
  const [formSubjects, setFormSubjects] = useState([]); // Subject options for form (filtered by category)
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Video Player Modal
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    subject_id: '',
    title: '',
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    duration: '',
    description: '',
    is_active: 1
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vidRes, catRes, subjRes] = await Promise.all([
        api.get('/education_video.php'),
        api.get('/education_category.php'),
        api.get('/education_subject.php')
      ]);
      setVideos(vidRes.data?.videos || []);
      setCategories(catRes.data?.categories || []);
      setSubjects(subjRes.data?.subjects || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load portal library data');
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
      navigate('/videos', { replace: true });
    }
  }, [location.search]);

  // Load subjects for the form when selected category changes
  useEffect(() => {
    if (!formData.category_id) {
      setFormSubjects([]);
      return;
    }
    const fetchFormSubjects = async () => {
      try {
        const res = await api.get(`/education_subject.php?category_id=${formData.category_id}`);
        setFormSubjects(res.data?.subjects || []);
      } catch (err) {
        console.error(err);
        // Fallback to client-side filtering if API fails
        const filtered = subjects.filter(s => Number(s.category_id) === Number(formData.category_id));
        setFormSubjects(filtered);
      }
    };
    fetchFormSubjects();
  }, [formData.category_id, subjects]);

  const openAddModal = () => {
    setSelectedVideo(null);
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      subject_id: '',
      title: '',
      image_url: '',
      video_url: '',
      video_type: 'youtube',
      duration: '',
      description: '',
      is_active: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (vid) => {
    setSelectedVideo(vid);
    setFormData({
      id: vid.id,
      category_id: vid.category_id,
      subject_id: vid.subject_id,
      title: vid.title,
      image_url: vid.image_url || '',
      video_url: vid.video_url || '',
      video_type: vid.video_type || 'youtube',
      duration: vid.duration || '',
      description: vid.description || '',
      is_active: Number(vid.is_active)
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (vid) => {
    setSelectedVideo(vid);
    setIsDeleteOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Reset subject if category changes
      if (name === 'category_id') {
        updated.subject_id = '';
      }
      return updated;
    });
  };

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      is_active: prev.is_active === 1 ? 0 : 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Video title is required');
      return;
    }
    if (!formData.category_id) {
      toast.error('Category assignment is required');
      return;
    }

    const selectedCategory = categories.find(c => Number(c.id) === Number(formData.category_id));
    const categoryHasSubjects = selectedCategory ? Number(selectedCategory.has_subjects) === 1 : false;

    if (categoryHasSubjects && !formData.subject_id) {
      toast.error('Subject assignment is required for this category');
      return;
    }
    if (!formData.video_url.trim()) {
      toast.error('Video source URL is required');
      return;
    }

    const payload = {
      category_id: Number(formData.category_id),
      subject_id: categoryHasSubjects ? Number(formData.subject_id) : 0,
      title: formData.title,
      image_url: formData.image_url,
      video_url: formData.video_url,
      video_type: formData.video_type,
      duration: formData.duration,
      description: formData.description,
    };

    try {
      if (selectedVideo) {
        // Edit Mode
        const res = await api.put('/education_video.php', {
          ...payload,
          id: Number(selectedVideo.id),
          is_active: Number(formData.is_active)
        });
        if (res.data?.success) {
          toast.success(res.data.message || 'Video details updated successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to update video');
        }
      } else {
        // Add Mode
        const res = await api.post('/education_video.php', payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Video added to catalog successfully');
          setIsModalOpen(false);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to add video');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(selectedVideo ? 'Error updating video' : 'Error adding video');
    }
  };

  const handleDelete = async () => {
    if (!selectedVideo) return;
    try {
      const res = await api.delete(`/education_video.php?id=${selectedVideo.id}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Video removed from database');
        setIsDeleteOpen(false);
        fetchData();
      } else {
        toast.error(res.data?.message || 'Failed to delete video');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting video');
    }
  };

  // Helper to extract YouTube Video ID
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    return url; // fallback to raw url
  };

  const filteredVideos = videos.filter(vid => {
    const matchesSearch = vid.title.toLowerCase().includes(search.toLowerCase()) || 
      (vid.description && vid.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || 
      Number(vid.category_id) === Number(categoryFilter);
      
    const matchesSubject = subjectFilter === 'all' || 
      Number(vid.subject_id) === Number(subjectFilter);
      
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && Number(vid.is_active) === 1) || 
      (filterActive === 'inactive' && Number(vid.is_active) === 0);
      
    return matchesSearch && matchesCategory && matchesSubject && matchesActive;
  });

  // Filter subjects based on Category filter selection for dropdown
  const filteredFilterSubjects = categoryFilter === 'all' 
    ? subjects 
    : subjects.filter(s => Number(s.category_id) === Number(categoryFilter));

  const selectedCategoryObj = categories.find(c => Number(c.id) === Number(formData.category_id));
  const categoryHasSubjects = selectedCategoryObj ? Number(selectedCategoryObj.has_subjects) === 1 : false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Video Lectures</h2>
          <p className="text-slate-400 mt-1">Host online webinars, tutorials, and class syllabus videos.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-violet-650 hover:bg-violet-750 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg text-sm"
        >
          <Plus className="h-5 w-5" /> Add Video
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/20 border border-slate-800">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title/desc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>
        
        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubjectFilter('all'); // reset subject filter
            }}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none transition-all"
          >
            <option value="all">All Subjects</option>
            {filteredFilterSubjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
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
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
          <Video className="h-12 w-12 text-slate-650 mb-3 animate-pulse" />
          <p className="font-semibold text-slate-300">No videos found</p>
          <p className="text-sm text-slate-500 mt-1">Try resetting your filters or adding a new lecture video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((vid) => (
            <div 
              key={vid.id} 
              className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl transition-all duration-350 flex flex-col justify-between group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-850">
                {vid.image_url ? (
                  <img
                    src={vid.image_url}
                    alt={vid.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-650 gap-1">
                    <Image className="h-10 w-10" />
                    <span className="text-[10px] font-semibold">No Thumbnail</span>
                  </div>
                )}

                {/* Duration Badge */}
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-950/85 text-white border border-white/5 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {vid.duration || 'N/A'}
                </span>

                {/* Hover Play Button */}
                <button
                  onClick={() => setActivePlayerVideo(vid)}
                  className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-600 hover:scale-110 flex items-center justify-center text-white transition-all shadow-lg shadow-violet-650/40">
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </div>
                </button>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    Number(vid.is_active) === 1
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {Number(vid.is_active) === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                    {vid.category_name}
                  </span>
                  <h4 className="font-bold text-base text-slate-200 mt-1 line-clamp-2 group-hover:text-white transition-colors">
                    {vid.title}
                  </h4>
                  {vid.description && (
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-850">
                    <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800/80">
                      {vid.subject_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize">
                      {vid.video_type} Player
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(vid)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-violet-500/40 text-slate-350 hover:text-white py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(vid)}
                      className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-450 hover:text-rose-450 p-2 rounded-xl text-xs transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-bold text-white">
                {selectedVideo ? 'Edit Video Lecture' : 'Upload Video Lecture'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
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

                {/* Subject Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none disabled:opacity-50"
                    required={categoryHasSubjects}
                    disabled={!formData.category_id || !categoryHasSubjects}
                  >
                    <option value="">
                      {!formData.category_id 
                        ? 'Select Category First' 
                        : !categoryHasSubjects 
                          ? 'No subjects required' 
                          : 'Select Subject'}
                    </option>
                    {formSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {!formData.category_id && (
                    <span className="text-[10px] text-slate-500 mt-1 block">Select a category first</span>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Introduction to Quadratic Equations"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                  required
                />
              </div>

              {/* Video URL & Video Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video URL</label>
                  <input
                    type="text"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-655 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video Player Type</label>
                  <select
                    name="video_type"
                    value={formData.video_type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="mp4">Direct MP4 URL</option>
                    <option value="file_system">File System / Local File</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Thumbnail Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/thumbnail.png"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                  />
                </div>
                
                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (e.g. MM:SS)</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 15:45"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-655 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter a brief summary or lesson plan description..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none resize-none"
                />
              </div>

              {/* Status Toggle (only in Edit mode) */}
              {selectedVideo && (
                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl pt-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Active Status</p>
                    <p className="text-xs text-slate-500">Enable or disable this video globally</p>
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

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 shrink-0">
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
                  {selectedVideo ? 'Save Changes' : 'Create Video'}
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
              <h3 className="text-lg font-bold text-white">Delete Video Lecture?</h3>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-200">"{selectedVideo?.title}"</span>? 
              This action cannot be undone and will remove the lecture from student video libraries.
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
                Delete Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Video Player Overlay Modal */}
      {activePlayerVideo && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header / Title */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-850 bg-slate-950">
              <div>
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">
                  Playing: {activePlayerVideo.subject_name} ({activePlayerVideo.category_name})
                </span>
                <h4 className="text-base font-bold text-white leading-tight truncate max-w-lg mt-0.5">
                  {activePlayerVideo.title}
                </h4>
              </div>
              <button 
                onClick={() => setActivePlayerVideo(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Video Player Embed */}
            <div className="relative aspect-video w-full bg-black">
              {activePlayerVideo.video_type === 'youtube' ? (
                <iframe
                  src={getYouTubeEmbedUrl(activePlayerVideo.video_url)}
                  title={activePlayerVideo.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : activePlayerVideo.video_type === 'vimeo' ? (
                <iframe
                  src={`https://player.vimeo.com/video/${activePlayerVideo.video_url.split('/').pop()}?autoplay=1`}
                  title={activePlayerVideo.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={activePlayerVideo.video_url}
                  className="absolute inset-0 w-full h-full"
                  controls
                  autoPlay
                ></video>
              )}
            </div>

            {/* Video Metadata / Description */}
            {activePlayerVideo.description && (
              <div className="p-6 bg-slate-900 border-t border-slate-850">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <FileText className="h-4 w-4" /> Lesson Description
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                  {activePlayerVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
