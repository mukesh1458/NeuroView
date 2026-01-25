import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import FormField from '../components/FormField'
import Loader from '../components/Loader'
import { toast } from 'react-hot-toast'
import { FiGrid, FiBookmark, FiFilter, FiMaximize2, FiX } from 'react-icons/fi';
import { FiZap } from 'react-icons/fi';

import { useAuth } from '../contexts/AuthContext';

const RenderCards = ({ data, title, openLightbox, user }) => {
  if (data?.length > 0) {
    return (
      data.map((post, index) => (
        <div key={post._id} className={`animate-fade-in-up`} style={{ animationDelay: `${index * 50}ms` }}>
          <Card {...post} openLightbox={openLightbox} authUser={user} />
        </div>
      ))
    );
  }

  return (
    <h2 className="mt-5 font-bold text-[#6469ff] text-xl uppercase">{title}</h2>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState(null);

  // Dashboard & Filtering State
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'saved'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [filterModel, setFilterModel] = useState('all'); // 'all' | 'stable-diffusion-2-1' | 'sdxl-wrong-lora'
  const [lightboxImage, setLightboxImage] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL
  const POST_DATA_API = BASE_URL + "/post"

  const fetchPosts = async () => {
    setLoading(true)

    try {
      const response = await fetch(POST_DATA_API, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json();
        // Default to newest first
        setAllPosts(result.data.reverse());
      }

    } catch (error) {
      toast.error("Error while getting posts")
    }
    finally {
      setLoading(false)
    }
  }



  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    setSearchTimeout(
      setTimeout(() => {
        const sourceData = activeTab === 'feed' ? allPosts : savedPosts;
        if (!sourceData) return;

        const searchResult = sourceData.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.prompt.toLowerCase().includes(searchText.toLowerCase()) ||
          item.model.toLowerCase().includes(searchText.toLowerCase()));
        setSearchedResults(searchResult);
      }, 500),
    );
  };

  useEffect(() => {
    fetchPosts();

    // Welcome Alert (Run once per session)
    const hasWelcomed = sessionStorage.getItem('hasWelcomed');
    if (!hasWelcomed) {
      setTimeout(() => {
        toast((t) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              M
            </div>
            <div>
              <p className="font-bold text-sm">Welcome to NeuroView!</p>
              <p className="text-xs text-zinc-400">Crafted by Mukesh Chowdary & Team</p>
            </div>
          </div>
        ), {
          duration: 5000,
          style: {
            borderRadius: '12px',
            background: '#18181b', // zinc-900
            color: '#fff',
            border: '1px solid #3f3f46', // zinc-700
          },
        });
        sessionStorage.setItem('hasWelcomed', 'true');
      }, 1500);
    }
  }, [])

  // Derived State for Display
  const getDisplayData = () => {
    let data = searchText ? searchedResults : allPosts;
    if (!data) return [];

    // Filter
    if (filterModel !== 'all') {
      data = data.filter(post => post.model === filterModel);
    }

    // Sort / Tabs
    // For 'feed', we use standard sort. For 'trending', we shuffle or show random selection.
    // Since shuffle on every render is bad, we validly just use a memoized or simple reverse for Feed.
    // Ideally Trending needs backend support, but for now we'll simulate with a deterministic shuffle or just a different sort.

    let finalData = [...data];

    if (activeTab === 'trending') {
      // Simple client-side shuffle for "Trending" simulation
      finalData = finalData.sort(() => Math.random() - 0.5);
    } else {
      // Feed: Newest First (Sort by createdAt converted to ID or Date)
      if (sortBy === 'oldest') {
        finalData = finalData.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      } else {
        // Default newest
        // finalData is already reversed from fetch? fetch reversed it.
        // If we want to be sure:
        // finalData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }
    }

    return finalData;
  }

  const displayData = getDisplayData();

  return (
    <section className="max-w-7xl mx-auto mt-4 mb-20 relative">

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex justify-center items-center p-4" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors">
            <FiX size={32} />
          </button>
          <img src={lightboxImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Hero & Dashboard */}
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="heading-hero text-[40px] sm:text-[60px] leading-[0.9] mb-6">
          Summarize the World. <br className="hidden sm:block" /> <span className="text-gradient-minimal">Visualize Your Dreams.</span>
        </h1>
        <p className="text-zinc-400 text-[18px] max-w-[600px] mx-auto delay-100 leading-relaxed font-light mb-8">
          The ultimate tool for students and creators. Turn text into insights and ideas into art.
        </p>

        {/* Stats Dashboard */}
        <div className="flex justify-center gap-4 sm:gap-12 flex-wrap">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{allPosts?.length || 0}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Total Posts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">2</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">AI Models</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-y border-white/5 py-4 mb-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between px-4">

          {/* Tabs */}
          <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <FiGrid className="inline mr-2" /> Community Feed
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'trending' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <FiZap className="inline mr-2" /> Trending
            </button>
          </div>

          {/* Search */}
          <div className="w-full md:max-w-md">
            <FormField
              labelName=""
              type="text"
              name="text"
              placeholder="Search posts..."
              value={searchText}
              handleChange={handleSearchChange}
              isCompact // Ensure FormField can handle this or just styles work
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-zinc-300 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
            >
              <option value="all">All Models</option>
              <option value="stable-diffusion-2-1">Stable Diffusion</option>
              <option value="sdxl-wrong-lora">SDXL</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-zinc-300 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {searchText && (
              <h2 className="font-medium text-gray-400 text-xl mb-3">
                Showing Results for <span className="text-white font-bold">{searchText}</span>:
              </h2>
            )}
            <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
              {searchText ? (
                <RenderCards
                  data={searchedResults}
                  title="No Search Results Found"
                  openLightbox={setLightboxImage}
                />
              ) : (
                <RenderCards
                  data={displayData}
                  title={activeTab === 'feed' ? "No Posts Yet" : "No Saved Posts"}
                  openLightbox={setLightboxImage}
                  user={user}
                />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Home