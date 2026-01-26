import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import FormField from '../components/FormField'
import FilterBar from '../components/FilterBar'
import Loader from '../components/Loader'
import { toast } from 'react-hot-toast'
import { FiGrid, FiBookmark, FiZap, FiMaximize2, FiX } from 'react-icons/fi'; // Removed FiFilter since it's in FilterBar

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

  // State for Filters
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filterModel, setFilterModel] = useState('All');
  const [filterColor, setFilterColor] = useState('All');

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'trending'

  const [lightboxImage, setLightboxImage] = useState(null);

  const BASE_URL = process.env.REACT_APP_BASE_URL
  const POST_DATA_API = BASE_URL + "/post"

  // Debouce Search Text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchPosts = async () => {
    setLoading(true)

    try {
      // Build query string
      const searchParams = new URLSearchParams();
      if (debouncedSearchText) searchParams.append('search', debouncedSearchText);
      if (filterModel && filterModel !== "All") searchParams.append('model', filterModel);
      if (filterColor && filterColor !== "All") searchParams.append('color', filterColor);

      const response = await fetch(`${POST_DATA_API}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json();
        // Backend returns result.data
        // We can still sort/shuffle locally for "Trending" if needed
        let posts = result.data.reverse();

        if (activeTab === 'trending') {
          posts = posts.sort(() => Math.random() - 0.5);
        }

        setAllPosts(posts);
      }

    } catch (error) {
      toast.error("Error while getting posts")
    }
    finally {
      setLoading(false)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    fetchPosts();
  }, [debouncedSearchText, filterModel, filterColor, activeTab]);

  // Welcome Alert (Run once per session)
  // Welcome Alert (Run once per session)
  useEffect(() => {
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
  }, []);

  // Derived State for Display
  const getDisplayData = () => {
    return allPosts || [];
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
      <FilterBar
        searchText={searchText}
        setSearchText={setSearchText}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        filterColor={filterColor}
        setFilterColor={setFilterColor}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
              <RenderCards
                data={displayData}
                title={activeTab === 'feed' ? "No Posts Found" : "No Saved Posts"}
                openLightbox={setLightboxImage}
                user={user}
              />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Home