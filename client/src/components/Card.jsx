
import React, { useState, useEffect } from 'react'
import { download } from '../assets';
import { downloadImage } from '../utils';
import { FiHeart, FiShare2, FiBookmark, FiCopy, FiZap, FiMaximize, FiTrash2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import CollectionModal from './CollectionModal';

const Card = ({ _id, name, prompt, model, photo, openLightbox, parentId, colors, user, authUser }) => {
  const navigate = useNavigate();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
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
    <div className="group relative overflow-hidden rounded-xl glass-card border-none card-hover-effect">
      <img
        className="w-full h-auto object-cover rounded-xl opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
        src={photo}
        alt={prompt}
        onClick={() => openLightbox && openLightbox(photo)}
      />

      {/* Overlay */}
      <div className="group-hover:flex flex-col max-h-[94.5%] hidden absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md m-2 p-4 rounded-lg border border-white/10 animate-fade-in-up">

        {/* Prompt Text */}
        <div className="flex justify-between items-start">
          <p className="text-zinc-200 text-sm overflow-y-auto prompt leading-relaxed mb-3 scrollbar-thin scrollbar-thumb-zinc-600 max-h-24 flex-1">
            {prompt}
          </p>
          <button onClick={handleCopy} className="ml-2 text-zinc-400 hover:text-white transition-colors" title="Copy Prompt">
            <FiCopy className="block w-3 h-3" />
          </button>
        </div>

        {/* Remix Lineage */}
        {parentId && (
          <div className="mb-3 flex items-center gap-1">
            <FiZap className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-300 font-medium uppercase tracking-wider">Remixed</span>
          </div>
        )}

        {/* Auto-Palette */}
        {safeColors.length > 0 && (
          <div className="flex gap-1 mb-3">
            {safeColors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              ></div>
            ))}
          </div>
        )}

        {/* User Info & Actions */}
        <div className="flex justify-between items-center gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm object-cover bg-zinc-800 flex justify-center items-center text-white text-xs font-bold border border-white/10">
              {safeInitial}
            </div>
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium leading-none">{safeName}</p>
              <span className="text-[10px] text-zinc-400">{model}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Bookmark */}
            <button type="button" onClick={handleBookmark} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Save to Board">
              <FiBookmark className="w-4 h-4 text-white group-hover:text-cyan-400 transition-colors" />
            </button>

            {/* Delete (Owner only) */}
            {authUser && user === authUser.id && (
              <button type="button" onClick={handleDelete} className="p-2 hover:bg-red-500/20 rounded-full transition-colors group/delete" title="Delete Post">
                <FiTrash2 className="w-4 h-4 text-zinc-400 group-hover/delete:text-red-400 transition-colors" />
              </button>
            )}

            {/* Remix */}
            <button type="button" onClick={handleRemix} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Remix this prompt">
              <FiZap className="w-4 h-4 text-white" />
            </button>

            {/* Share */}
            <button type="button" onClick={handleShare} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Share">
              <FiShare2 className="w-4 h-4 text-white" />
            </button>

            {/* Download */}
            <button type="button" onClick={(e) => { e.stopPropagation(); downloadImage(_id, photo); }} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Download">
              <img src={download} alt="download" className="w-4 h-4 object-contain invert" />
            </button>
          </div>
        </div>
      </div>
      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        postId={_id}
        photo={photo}
        user={authUser}
      />
    </div>
  )
}

export default Card
