import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  BookOpen, 
  Video, 
  ArrowRight, 
  Plus, 
  Clock, 
  Activity, 
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    activeCategories: 0,
    subjects: 0,
    activeSubjects: 0,
    videos: 0,
    activeVideos: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [catRes, subjRes, vidRes] = await Promise.all([
          api.get('/education_category.php'),
          api.get('/education_subject.php'),
          api.get('/education_video.php')
        ]);

        const categories = catRes.data?.categories || [];
        const subjects = subjRes.data?.subjects || [];
        const videos = vidRes.data?.videos || [];

        setStats({
          categories: categories.length,
          activeCategories: categories.filter(c => Number(c.is_active) === 1).length,
          subjects: subjects.length,
          activeSubjects: subjects.filter(s => Number(s.is_active) === 1).length,
          videos: videos.length,
          activeVideos: videos.filter(v => Number(v.is_active) === 1).length,
        });

        // Get 4 most recent videos
        const sortedVideos = [...videos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentVideos(sortedVideos.slice(0, 4));
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not connect to the API. Please ensure the backend is running and the URL is correct.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Overview Dashboard</h2>
        <p className="text-slate-400 mt-1">Manage educational categories, courses, subjects, and digital lectures.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories Card */}
        <div className="relative overflow-hidden group bg-slate-950/40 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-violet-950/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/15 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Categories</p>
              <h3 className="text-4xl font-black text-white mt-2">{stats.categories}</h3>
              <p className="text-xs text-violet-400 mt-2 flex items-center gap-1 font-semibold">
                <Activity className="h-3 w-3" /> {stats.activeCategories} Active
              </p>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
              <FolderKanban className="h-6 w-6" />
            </div>
          </div>
          <Link to="/categories" className="mt-4 flex items-center justify-between text-xs text-slate-400 hover:text-white font-medium group/btn pt-4 border-t border-slate-850">
            Manage Categories
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Subjects Card */}
        <div className="relative overflow-hidden group bg-slate-950/40 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-cyan-950/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/15 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Subjects</p>
              <h3 className="text-4xl font-black text-white mt-2">{stats.subjects}</h3>
              <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1 font-semibold">
                <Activity className="h-3 w-3" /> {stats.activeSubjects} Active
              </p>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <Link to="/subjects" className="mt-4 flex items-center justify-between text-xs text-slate-400 hover:text-white font-medium group/btn pt-4 border-t border-slate-850">
            Manage Subjects
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Videos Card */}
        <div className="relative overflow-hidden group bg-slate-950/40 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-emerald-950/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/15 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Videos</p>
              <h3 className="text-4xl font-black text-white mt-2">{stats.videos}</h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                <Activity className="h-3 w-3" /> {stats.activeVideos} Active
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Video className="h-6 w-6" />
            </div>
          </div>
          <Link to="/videos" className="mt-4 flex items-center justify-between text-xs text-slate-400 hover:text-white font-medium group/btn pt-4 border-t border-slate-850">
            Manage Videos
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Add Actions */}
        <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4">Quick Setup</h4>
          <div className="space-y-4">
            <Link 
              to="/categories?add=true" 
              className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/35 hover:bg-slate-850 transition-all text-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-650/15 text-violet-400 rounded-lg">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">New Category</p>
                  <p className="text-xs text-slate-400">e.g. Mathematics, GK</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link 
              to="/subjects?add=true" 
              className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/35 hover:bg-slate-850 transition-all text-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-lg">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">New Subject</p>
                  <p className="text-xs text-slate-400">e.g. Algebra, Geometry</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link 
              to="/videos?add=true" 
              className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/35 hover:bg-slate-850 transition-all text-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Upload Video</p>
                  <p className="text-xs text-slate-400">Add lecture, playlist links</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Recently Uploaded Videos */}
        <div className="lg:col-span-2 bg-slate-950/30 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-white">Recent Educational Videos</h4>
            <Link to="/videos" className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Video className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-sm">No videos found. Upload a video to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    {video.image_url ? (
                      <img 
                        src={video.image_url} 
                        alt={video.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-500 bg-slate-950">
                        <Video className="h-8 w-8" />
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/85 text-white flex items-center gap-1 border border-white/10">
                      <Clock className="h-2.5 w-2.5" /> {video.duration || 'N/A'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                        {video.category_name || 'Category'}
                      </span>
                      <h5 className="font-bold text-sm text-slate-200 mt-1 line-clamp-1 group-hover:text-white transition-colors">
                        {video.title}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-850">
                      <span className="text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {video.subject_name || 'Subject'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        Number(video.is_active) === 1 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {Number(video.is_active) === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
