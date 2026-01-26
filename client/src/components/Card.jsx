
import React, { useState, useEffect } from 'react'
import { download } from '../assets';
import { downloadImage } from '../utils';
import { FiHeart, FiShare2, FiBookmark, FiCopy, FiZap, FiMaximize, FiTrash2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import CollectionModal from './CollectionModal';
import RemixTreeModal from './RemixTreeModal';

const Card = ({ _id, name, prompt, model, photo, openLightbox, parentId, colors, user, authUser }) => {
  const navigate = useNavigate();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Safe helpers
  const safeName = name || "Anonymous";
  const safeInitial = safeName.length > 0 ? safeName[0].toUpperCase() : "?";
  const safeColors = Array.isArray(colors) ? colors : [];

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
    <div className="group relative rounded-xl hover:shadow-xl hover:shadow-cardhover card w-full h-auto object-cover rounded-xl transition-all duration-300">
      <img
        className="w-full h-auto object-cover rounded-xl"
        src={photo}
        alt={prompt}
        onClick={() => openLightbox && openLightbox(photo)}
      />

      {/* Top Right: Genealogy Button (Pop out) */}
      <div className="absolute top-3 right-3 hidden group-hover:flex flex-col gap-2 animate-fade-in-up z-20">
        {/* Genealogy Tree */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowTreeModal(true); }}
          className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-400 transition-all shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:scale-110 hover:shadow-cyan-500/50"
          title="View Remix Family"
        >
          <FiZap className="w-5 h-5 text-white/90" />
        </button>
      </div>

      {/* Bottom Action Bar (Insta-style Glossy) */}
      <div className="hidden group-hover:flex flex-col max-h-[94.5%] absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent m-2 p-3 rounded-xl border border-white/10 animate-slide-in-up z-20 backdrop-blur-xl shadow-lg">

        {/* User Info & Actions Row */}
        <div className="flex justify-between items-center w-full">

          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full object-cover bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm flex justify-center items-center text-white text-xs font-bold shadow-inner">
              {safeInitial}
            </div>
            <div className="flex flex-col">
              <p className="text-white text-sm font-bold leading-none drop-shadow-md tracking-wide">{safeName}</p>
              <span className="text-[10px] text-zinc-300 font-medium opacity-80">@{safeName.toLowerCase().replace(/\s/g, '')}</span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {/* Bookmark */}
            <button type="button" onClick={handleBookmark} className="hover:scale-110 transition-transform p-1" title="Save">
              <FiBookmark className="w-5 h-5 text-zinc-300 hover:text-purple-400 transition-colors drop-shadow-sm" />
            </button>

            {/* Remix */}
            <button type="button" onClick={handleRemix} className="hover:scale-110 transition-transform p-1" title="Remix This">
              <FiZap className="w-5 h-5 text-zinc-300 hover:text-yellow-400 transition-colors drop-shadow-sm" />
            </button>

            {/* Share */}
            <button type="button" onClick={handleShare} className="hover:scale-110 transition-transform p-1" title="Share">
              <FiShare2 className="w-5 h-5 text-zinc-300 hover:text-green-400 transition-colors drop-shadow-sm" />
            </button>

            {/* Download */}
            <button type="button" onClick={(e) => { e.stopPropagation(); downloadImage(_id, photo); }} className="hover:scale-110 transition-transform p-1" title="Download">
              <img src={download} alt="download" className="w-5 h-5 object-contain invert opacity-70 hover:opacity-100 transition-opacity drop-shadow-sm" />
            </button>

            {/* Delete (Owner only) */}
            {authUser && user === authUser.id && (
              <button type="button" onClick={handleDelete} className="hover:scale-110 transition-transform p-1" title="Delete">
                <FiTrash2 className="w-4 h-4 text-red-400/80 hover:text-red-500 transition-colors drop-shadow-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Prompt Preview (Mini) */}
        {prompt && (
          <div className="mt-3 bg-black/20 rounded-lg p-2 border border-white/5 backdrop-blur-sm">
            <p className="text-zinc-200 text-xs line-clamp-2 leading-relaxed font-light">
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
  )
}

export default Card
