import React, { useState, useEffect } from 'react'
import { download } from '../assets';
import { downloadImage } from '../utils';
import { FiHeart, FiShare2, FiBookmark, FiCopy, FiZap, FiMaximize } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Card = ({ _id, name, prompt, model, photo, openLightbox }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if bookmarked on load
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    setIsBookmarked(saved.some(p => p._id === _id));
  }, [_id]);

  const handleBookmark = (e) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');

    if (isBookmarked) {
      const newSaved = saved.filter(p => p._id !== _id);
      localStorage.setItem('savedPosts', JSON.stringify(newSaved));
      setIsBookmarked(false);
      toast.success("Removed from collection");
    } else {
      localStorage.setItem('savedPosts', JSON.stringify([...saved, { _id, name, prompt, model, photo }]));
      setIsBookmarked(true);
      toast.success("Saved to collection");
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied!");
  };

  const handleRemix = (e) => {
    e.stopPropagation();
    navigate('/create-post', { state: { prompt, model } });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // Open share menu or simple twitter intent
    const text = `Check out this AI art generated with MERN-AI! "${prompt}"`;
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
        <p className="text-zinc-200 text-sm overflow-y-auto prompt leading-relaxed mb-3 scrollbar-thin scrollbar-thumb-zinc-600 max-h-24">
          {prompt}
          <button onClick={handleCopy} className="ml-2 text-zinc-400 hover:text-white transition-colors" title="Copy Prompt">
            <FiCopy className="inline w-3 h-3" />
          </button>
        </p>

        {/* User Info & Actions */}
        <div className="flex justify-between items-center gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm object-cover bg-zinc-800 flex justify-center items-center text-white text-xs font-bold border border-white/10">
              {name[0]}
            </div>
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium leading-none">{name}</p>
              <span className="text-[10px] text-zinc-400">{model}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Bookmark */}
            <button type="button" onClick={handleBookmark} className="p-2 hover:bg-white/10 rounded-full transition-colors" title={isBookmarked ? "Unsave" : "Save"}>
              <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
            </button>

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
    </div>
  )
}

export default Card