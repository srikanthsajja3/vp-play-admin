import React, { useEffect, useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FolderPlus, 
  ChevronRight, 
  Home, 
  FileText, 
  Video as VideoIcon, 
  Play, 
  Plus, 
  Search, 
  ArrowLeft,
  HardDrive,
  Grid,
  List as ListIcon,
  Clock,
  Layers,
  BookOpen,
  FolderKanban,
  X,
  Trash2,
  Edit2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  FilePlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { getStoredClasses, saveStoredClasses } from './Classes';
import { getCategoryClassMap, setCategoryClass } from '../utils/classMapping';

const FileSystem = () => {
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation path: [ { type: 'root', id: 'root', name: 'File System Root' }, ... ]
  const [currentPath, setCurrentPath] = useState([
    { type: 'root', id: 'root', name: 'File System Root' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Player Modal
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    title: '',
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    duration: '',
    description: '',
    has_subjects: 1
  });

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const currentFolder = currentPath[currentPath.length - 1];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, subjRes, vidRes] = await Promise.all([
        api.get('/education_category.php'),
        api.get('/education_subject.php'),
        api.get('/education_video.php')
      ]);

      setCategories(catRes.data?.categories || []);
      setSubjects(subjRes.data?.subjects || []);
      setVideos(vidRes.data?.videos || []);

      // Load classes
      try {
        const clsRes = await api.get('/education_class.php');
        if (clsRes.data?.classes && Array.isArray(clsRes.data.classes)) {
          setClasses(clsRes.data.classes);
        } else {
          setClasses(getStoredClasses());
        }
      } catch (e) {
        setClasses(getStoredClasses());
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load file system hierarchy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  // Folder navigation
  const handleOpenFolder = (folder) => {
    setCurrentPath(prev => [...prev, folder]);
    setSearchQuery('');
  };

  const handleNavigateToBreadcrumb = (index) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSearchQuery('');
  };

  const handleGoBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, currentPath.length - 1));
      setSearchQuery('');
    }
  };

  const handleOpenAddModal = () => {
    setAddForm({
      name: '',
      title: '',
      image_url: '',
      video_url: '',
      video_type: 'youtube',
      duration: '',
      description: '',
      has_subjects: 1
    });
    setIsAddModalOpen(true);
  };

  // Submit Handler for Add Modal
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (currentFolder.type === 'root') {
      // Create Class Folder
      if (!addForm.name.trim()) {
        toast.error('Class folder name is required');
        return;
      }
      try {
        try {
          const res = await api.post('/education_class.php', {
            name: addForm.name,
            description: addForm.description,
            is_active: 1
          });
          if (res.data?.success) {
            toast.success('Class folder created');
            setIsAddModalOpen(false);
            fetchData();
            return;
          }
        } catch (e) {}

        const current = getStoredClasses();
        const newClass = {
          id: String(Date.now()),
          name: addForm.name,
          description: addForm.description,
          is_active: 1,
          created_at: new Date().toISOString()
        };
        const updated = [...current, newClass];
        saveStoredClasses(updated);
        setClasses(updated);
        toast.success('Class folder added');
        setIsAddModalOpen(false);
      } catch (err) {
        toast.error('Failed to create class folder');
      }

    } else if (currentFolder.type === 'class') {
      // Create Category Subfolder under this specific Class
      if (!addForm.name.trim()) {
        toast.error('Category folder name is required');
        return;
      }
      try {
        const res = await api.post('/education_category.php', {
          name: addForm.name,
          image_url: addForm.image_url,
          has_subjects: Number(addForm.has_subjects),
          class_id: Number(currentFolder.id)
        });
        
        const createdCatId = res.data?.id || res.data?.category_id || String(Date.now());
        setCategoryClass(createdCatId, currentFolder.id);

        if (res.data?.success || res.data) {
          toast.success(`Category "${addForm.name}" created for ${currentFolder.name}`);
          setIsAddModalOpen(false);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to create category');
        }
      } catch (err) {
        toast.error('Error creating category folder');
      }

    } else if (currentFolder.type === 'category') {
      // Create Subject Subfolder
      if (!addForm.name.trim()) {
        toast.error('Subject folder name is required');
        return;
      }
      try {
        const res = await api.post('/education_subject.php', {
          category_id: Number(currentFolder.id),
          name: addForm.name,
          image_url: addForm.image_url
        });
        if (res.data?.success) {
          toast.success('Subject folder created');
          setIsAddModalOpen(false);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to create subject');
        }
      } catch (err) {
        toast.error('Error creating subject folder');
      }

    } else if (currentFolder.type === 'subject') {
      // Create Video File inside Subject
      if (!addForm.title.trim()) {
        toast.error('Video title is required');
        return;
      }
      if (!addForm.video_url.trim()) {
        toast.error('Video URL is required');
        return;
      }

      const subjectObj = subjects.find(s => String(s.id) === String(currentFolder.id));
      const categoryId = subjectObj ? subjectObj.category_id : 0;

      try {
        const res = await api.post('/education_video.php', {
          category_id: Number(categoryId),
          subject_id: Number(currentFolder.id),
          title: addForm.title,
          image_url: addForm.image_url,
          video_url: addForm.video_url,
          video_type: addForm.video_type,
          duration: addForm.duration,
          description: addForm.description
        });

        if (res.data?.success) {
          toast.success('Video lecture file added successfully');
          setIsAddModalOpen(false);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to add video file');
        }
      } catch (err) {
        toast.error('Error adding video file');
      }
    }
  };

  const handlePromptDelete = (e, type, rawItem) => {
    e.stopPropagation();
    setItemToDelete({ type, item: rawItem });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, item } = itemToDelete;

    try {
      if (type === 'class') {
        try {
          await api.delete(`/education_class.php?id=${item.id}`);
        } catch (e) {}
        const current = getStoredClasses();
        const updated = current.filter(c => String(c.id) !== String(item.id));
        saveStoredClasses(updated);
        setClasses(updated);
        toast.success(`Class folder "${item.name}" deleted`);

      } else if (type === 'category') {
        const res = await api.delete(`/education_category.php?id=${item.id}`);
        if (res.data?.success) {
          toast.success(`Category folder "${item.name}" deleted`);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to delete category');
        }

      } else if (type === 'subject') {
        const res = await api.delete(`/education_subject.php?id=${item.id}`);
        if (res.data?.success) {
          toast.success(`Subject folder "${item.name}" deleted`);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to delete subject');
        }

      } else if (type === 'video') {
        const res = await api.delete(`/education_video.php?id=${item.id}`);
        if (res.data?.success) {
          toast.success(`Video file "${item.title}" deleted`);
          fetchData();
        } else {
          toast.error(res.data?.message || 'Failed to delete video file');
        }
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error('Error deleting item');
    }
  };

  // Determine current folder items
  let folderItems = [];
  let fileItems = [];

  const classMap = getCategoryClassMap();

  if (currentFolder.type === 'root') {
    // Level 0: Show Classes
    folderItems = classes.map(c => ({
      type: 'class',
      id: String(c.id),
      name: c.name,
      subtitle: c.description || 'Parent Class Folder',
      icon: Layers,
      color: 'from-violet-600/20 to-purple-600/10 border-violet-500/30',
      raw: c
    }));
  } else if (currentFolder.type === 'class') {
    // Level 1: Show Categories specific to this Class
    const classCategories = categories.filter((cat, idx) => {
      const mappedClassId = cat.class_id || classMap[String(cat.id)];
      if (mappedClassId) {
        return String(mappedClassId) === String(currentFolder.id);
      }
      // Default initial mapping distribution for sample categories so classes don't look identical
      if (String(currentFolder.id) === '2') { // Class 10 default
        return idx % 2 === 0;
      }
      if (String(currentFolder.id) === '1') { // Class 9 default
        return idx % 2 === 1;
      }
      return false;
    });

    folderItems = classCategories.map(cat => ({
      type: 'category',
      id: String(cat.id),
      name: cat.name,
      subtitle: Number(cat.has_subjects) === 1 ? 'Has Subjects' : 'Direct Videos',
      icon: FolderKanban,
      color: 'from-indigo-600/20 to-blue-600/10 border-indigo-500/30',
      raw: cat
    }));
  } else if (currentFolder.type === 'category') {
    // Level 2: Show Subjects in this Category
    const categoryObj = categories.find(c => String(c.id) === String(currentFolder.id));
    const hasSubjects = categoryObj ? Number(categoryObj.has_subjects) === 1 : true;

    if (hasSubjects) {
      folderItems = subjects
        .filter(s => String(s.category_id) === String(currentFolder.id))
        .map(s => ({
          type: 'subject',
          id: String(s.id),
          name: s.name,
          subtitle: `Subject Folder in ${currentFolder.name}`,
          icon: BookOpen,
          color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30',
          raw: s
        }));
    } else {
      fileItems = videos.filter(v => String(v.category_id) === String(currentFolder.id));
    }
  } else if (currentFolder.type === 'subject') {
    // Level 3: Show Videos in this Subject
    fileItems = videos.filter(v => String(v.subject_id) === String(currentFolder.id));
  }

  const filteredFolders = folderItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = fileItems.filter(file => 
    file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getAddButtonText = () => {
    if (currentFolder.type === 'root') return 'Add Class Folder';
    if (currentFolder.type === 'class') return 'Add Category Folder';
    if (currentFolder.type === 'category') return 'Add Subject Folder';
    if (currentFolder.type === 'subject') return 'Add Video Lecture File';
    return 'Add New Item';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HardDrive className="h-4 w-4" /> Hierarchical Folder Structure
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">File System Explorer</h2>
          <p className="text-slate-400 mt-1">Class-specific hierarchy: Class ➔ Categories ➔ Subjects ➔ Videos.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
            title="Toggle View Mode"
          >
            {viewMode === 'grid' ? <ListIcon className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-violet-650 hover:bg-violet-750 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg text-sm"
          >
            {currentFolder.type === 'subject' ? <FilePlus className="h-4.5 w-4.5" /> : <FolderPlus className="h-4.5 w-4.5" />}
            {getAddButtonText()}
          </button>
        </div>
      </div>

      {/* Path Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 text-sm overflow-x-auto py-1">
          {currentPath.length > 1 && (
            <button
              onClick={handleGoBack}
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors mr-1 shrink-0"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {currentPath.map((folder, idx) => (
            <React.Fragment key={folder.id + idx}>
              {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />}
              <button
                onClick={() => handleNavigateToBreadcrumb(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  idx === currentPath.length - 1
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {idx === 0 ? <Home className="h-3.5 w-3.5" /> : <Folder className="h-3.5 w-3.5" />}
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search current directory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Directory Contents View */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Folders</h3>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => {
                    const FolderIcon = folder.icon;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleOpenFolder(folder)}
                        className={`bg-gradient-to-br ${folder.color} border rounded-2xl p-4 cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-200 group flex items-start justify-between relative`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 bg-slate-950/80 rounded-xl text-violet-400 group-hover:text-white transition-colors">
                            <FolderIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-100 group-hover:text-violet-300 transition-colors">
                              {folder.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{folder.subtitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handlePromptDelete(e, folder.type, folder.raw)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900/80 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Folder"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-950/30 border border-slate-800 rounded-2xl divide-y divide-slate-850">
                  {filteredFolders.map((folder) => {
                    const FolderIcon = folder.icon;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleOpenFolder(folder)}
                        className="flex items-center justify-between p-4 hover:bg-slate-900/60 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <FolderIcon className="h-5 w-5 text-violet-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-200">{folder.name}</p>
                            <p className="text-xs text-slate-500">{folder.subtitle}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handlePromptDelete(e, folder.type, folder.raw)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                            title="Delete Folder"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Video Files Section */}
          {filteredFiles.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Content Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/40 hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-950 flex items-center justify-center border-b border-slate-850">
                        {file.image_url ? (
                          <img src={file.image_url} alt={file.title} className="w-full h-full object-cover" />
                        ) : (
                          <VideoIcon className="h-10 w-10 text-slate-650" />
                        )}
                        
                        <button
                          onClick={() => setActivePlayerVideo(file)}
                          className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-lg">
                            <Play className="h-6 w-6 fill-current ml-0.5" />
                          </div>
                        </button>

                        <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-950/90 text-white flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {file.duration || 'N/A'}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-violet-400">
                            {file.video_type} File
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {file.category_name}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 line-clamp-1 group-hover:text-white">
                          {file.title}
                        </h4>
                        {file.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {file.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-2 border-t border-slate-850 flex items-center justify-between">
                      <button
                        onClick={() => setActivePlayerVideo(file)}
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Preview Video
                      </button>

                      <button
                        onClick={(e) => handlePromptDelete(e, 'video', file)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                        title="Delete Video File"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
              <FolderOpen className="h-12 w-12 text-slate-650 mb-3 animate-pulse" />
              <p className="font-semibold text-slate-300">Folder is empty</p>
              <p className="text-sm text-slate-500 mt-1">
                {currentFolder.type === 'class'
                  ? `No categories have been created for "${currentFolder.name}" yet. Click "${getAddButtonText()}" to create a category for this class.`
                  : `Click the "${getAddButtonText()}" button above to add items to this folder.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {currentFolder.type === 'root' && 'Create New Class Folder'}
                {currentFolder.type === 'class' && `Create Category Folder in "${currentFolder.name}"`}
                {currentFolder.type === 'category' && `Create Subject Folder in "${currentFolder.name}"`}
                {currentFolder.type === 'subject' && `Add Video Lecture in "${currentFolder.name}"`}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {currentFolder.type !== 'subject' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder={
                        currentFolder.type === 'root' ? 'e.g. Class 10' :
                        currentFolder.type === 'class' ? 'e.g. Mathematics' : 'e.g. Algebra'
                      }
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                      required
                    />
                  </div>

                  {currentFolder.type === 'root' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea
                        value={addForm.description}
                        onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                        rows="3"
                        placeholder="Class or grade standard details..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none resize-none"
                      />
                    </div>
                  )}

                  {currentFolder.type !== 'root' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Folder Cover Image URL (Optional)</label>
                      <input
                        type="url"
                        value={addForm.image_url}
                        onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
                        placeholder="https://example.com/cover.png"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video Lecture Title</label>
                    <input
                      type="text"
                      value={addForm.title}
                      onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                      placeholder="e.g. Quadratic Equations Lecture 1"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Video URL</label>
                      <input
                        type="text"
                        value={addForm.video_url}
                        onChange={(e) => setAddForm({ ...addForm, video_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-655 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                      <select
                        value={addForm.video_type}
                        onChange={(e) => setAddForm({ ...addForm, video_type: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="mp4">Direct MP4</option>
                        <option value="file_system">File System</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thumbnail URL (Optional)</label>
                      <input
                        type="url"
                        value={addForm.image_url}
                        onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (e.g. 12:45)</label>
                      <input
                        type="text"
                        value={addForm.duration}
                        onChange={(e) => setAddForm({ ...addForm, duration: e.target.value })}
                        placeholder="12:45"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-655 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      rows="2"
                      placeholder="Brief lesson notes..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-650 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-855 text-slate-350 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-650 hover:bg-violet-750 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">
                Delete {itemToDelete.type.toUpperCase()}?
              </h3>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-200">
                "{itemToDelete.item.name || itemToDelete.item.title}"
              </span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-355 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activePlayerVideo && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-855 bg-slate-950">
              <div>
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">
                  File: {activePlayerVideo.title}
                </span>
                <h4 className="text-base font-bold text-white leading-tight">
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

            <div className="relative aspect-video w-full bg-black">
              {activePlayerVideo.video_type === 'youtube' ? (
                <iframe
                  src={getYouTubeEmbedUrl(activePlayerVideo.video_url)}
                  title={activePlayerVideo.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSystem;
