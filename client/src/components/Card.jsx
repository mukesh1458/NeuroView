
import React, { useState, useEffect } from 'react'
import { download } from '../assets';
import { downloadImage } from '../utils';
import { FiHeart, FiShare2, FiBookmark, FiCopy, FiZap, FiMaximize, FiTrash2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import CollectionModal from './CollectionModal';
import RemixTreeModal from './RemixTreeModal';
import TiltCard from './TiltCard';

const Card = ({ _id, name, prompt, model, photo, openLightbox, parentId, colors, user, authUser }) => {
  const navigate = useNavigate();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Safe helpers
  const safeName = name || "Anonymous";
  const safeInitial = safeName.length > 0 ? safeName[0].toUpperCase() : "?";

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (authUser) {
      setShowCollectionModal(true);
    } else {
      toast.error("Please login to save posts");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/post/${_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Post deleted");
        window.location.reload(); // Simple refresh to update UI
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied!");
  };

  const handleRemix = (e) => {
    e.stopPropagation();
    navigate('/create-post', { state: { prompt, model, parentId: _id } });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // Open share menu or simple twitter intent
    const text = `Check out this AI art generated with MERN - AI! "${prompt}"`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <TiltCard className="rounded-xl bg-[#101010] shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-auto glass-border">
      <div className="group relative rounded-xl h-auto overflow-hidden">
        <img
          className="w-full h-auto object-cover rounded-xl shadow-lg"
          src={photo}
          alt={prompt}
          loading="lazy"
          onClick={() => openLightbox && openLightbox(photo)}
          style={{ transform: 'translateZ(20px)' }} // Push image slightly forward
        />

        {/* Top Right: Genealogy Button (Pop out) */}
        <div
          className="absolute top-3 right-3 hidden group-hover:flex flex-col gap-2 animate-fade-in-up z-20"
          style={{ transform: 'translateZ(50px)' }} // Float buttons above
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowTreeModal(true); }}
            className="w-10 h-10 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-400 transition-all shadow-lg hover:scale-110"
            title="View Remix Family"
          >
            <FiZap className="w-5 h-5 text-white/90" />
          </button>
        </div>

        {/* Bottom Action Bar */}
        <div
          className="hidden group-hover:flex flex-col max-h-[94.5%] absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl m-2 p-3 rounded-xl border border-white/10 animate-slide-in-up z-20 shadow-2xl"
          style={{ transform: 'translateZ(40px)' }} // Float panel above image
        >

          {/* User Info & Actions Row */}
          <div className="flex justify-between items-center w-full">

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex justify-center items-center text-white text-[10px] font-bold shadow-lg border border-white/20">
                {safeInitial}
              </div>
              <div className="flex flex-col">
                <p className="text-white text-xs font-bold leading-none tracking-wide">{safeName}</p>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={handleBookmark} className="p-1.5 hover:bg-white/10 rounded-full transition-colors" title="Save">
                <FiBookmark className="w-4 h-4 text-zinc-300 hover:text-purple-400 transition-colors" />
              </button>

              <button type="button" onClick={handleRemix} className="p-1.5 hover:bg-white/10 rounded-full transition-colors" title="Remix This">
                <FiZap className="w-4 h-4 text-zinc-300 hover:text-yellow-400 transition-colors" />
              </button>

              <button type="button" onClick={(e) => { e.stopPropagation(); downloadImage(_id, photo); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors" title="Download">
                <img src={download} alt="download" className="w-4 h-4 object-contain invert opacity-70 hover:opacity-100 transition-opacity" />
              </button>

              {authUser && user === authUser.id && (
                <button type="button" onClick={handleDelete} className="p-1.5 hover:bg-white/10 rounded-full transition-colors" title="Delete">
                  <FiTrash2 className="w-3.5 h-3.5 text-red-400/80 hover:text-red-500 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Prompt Preview (Mini) */}
          {prompt && (
            <div className="mt-2.5">
              <p className="text-zinc-300 text-[10px] line-clamp-2 leading-relaxed font-light opacity-80 text-reveal">
                {prompt}
              </p>
            </div>
          )}
        </div>

        <CollectionModal
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          postId={_id}
          photo={photo}
          user={authUser}
        />
        <RemixTreeModal
          isOpen={showTreeModal}
          onClose={() => setShowTreeModal(false)}
          postId={_id}
          currentPostPhoto={photo}
        />
      </div>
    </TiltCard>
  )
}

export default Card
