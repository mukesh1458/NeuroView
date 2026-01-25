import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { preview } from '../assets';
import { getRandomPrompt, downloadImage } from '../utils';
import FormField from '../components/FormField';
import Loader from '../components/Loader';
import { BiSolidError } from 'react-icons/bi'
import { FiZap, FiDownload, FiRefreshCw, FiSettings, FiTrash2, FiShare2 } from 'react-icons/fi';
import ColorThief from 'colorthief';
import CreatePageDropDown from '../components/CreatePageDropDown';

const STYLE_PRESETS = [
  { name: 'Realistic', prompt: 'photorealistic, 8k, highly detailed, cinematic lighting, photography' },
  { name: 'Anime', prompt: 'anime style, studio ghibli, vibrant, cel shaded, highly detailed' },
  { name: 'Cyberpunk', prompt: 'cyberpunk, neon lights, futuristic, sci-fi, dark atmosphere, highly detailed' },
  { name: 'Watercolor', prompt: 'watercolor painting, artistic, soft colors, splash art, wet on wet' },
  { name: '3D Render', prompt: '3d render, unreal engine 5, octane render, ray tracing, sharp focus' },
  { name: 'Impressionist', prompt: 'impressionist style, oil painting, van gogh style, thick brushstrokes' },
  { name: 'Pop Art', prompt: 'pop art, comic book style, bold colors, halftone pattern' },
];

const CreatePost = () => {
  // Force Rebuild
  const BASE_URL = process.env.REACT_APP_BASE_URL
  const POST_DATA_API = BASE_URL + "/post"
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photo: '',
    model: 'stable-diffusion-2-1',
    blobObj: ''
  })

  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false)
  const [errorHandler, setErrorHandler] = useState({
    isError: false,
    status: ''
  })

  // Advanced Features State
  const [sessionHistory, setSessionHistory] = useState([]);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0, hueRotate: 0 });
  const [showFilters, setShowFilters] = useState(false);


  const resetFilters = () => setFilters({ brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0, hueRotate: 0 });

  const getFilterStyle = () => ({
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) blur(${filters.blur}px) hue-rotate(${filters.hueRotate}deg)`
  });

  // Updated Download Logic to bake filters
  const handleDownload = async () => {
    if (!form.photo) return;

    // If no filters changed, simple download
    if (filters.brightness === 100 && filters.contrast === 100 && filters.saturation === 100 && filters.sepia === 0 && filters.blur === 0 && filters.hueRotate === 0) {
      downloadImage(Date.now(), form.photo);
      return;
    }

    // Bake filters using Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = form.photo;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) blur(${filters.blur}px) hue-rotate(${filters.hueRotate}deg)`;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const link = document.createElement('a');
      link.download = `neuroview-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
  };

  // Remix Logic
  useEffect(() => {
    if (location.state) {
      const { prompt, model, parentId } = location.state; // Extract parentId
      setForm(prev => ({
        ...prev,
        prompt: prompt || '',
        model: model || 'stable-diffusion-2-1',
        parentId: parentId || null
      }));
      toast.success("Remixing prompt loaded!");
    }
  }, [location.state]);

  const [models, setModels] = useState(['stable-diffusion-2-1', 'sdxl-wrong-lora'])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  }

  const handleMagicPrompt = () => {
    if (!form.prompt) return toast.error("Enter a basic prompt first!");
    const magicSuffix = ", highly detailed, 8k resolution, cinematic lighting, masterpiece, sharp focus, trending on artstation";
    setForm({ ...form, prompt: form.prompt + magicSuffix });
    toast.success("Magic applied! ✨");
  }

  const handleStyleApply = (stylePrompt) => {
    if (!form.prompt) {
      setForm({ ...form, prompt: stylePrompt });
    } else {
      setForm({ ...form, prompt: form.prompt + ", " + stylePrompt });
    }
    toast.success("Style applied!");
  }

  const generateImage = async () => {
    if (form.prompt && form.model) {
      setGeneratingImg(true);
      setErrorHandler({ isError: false, status: '' });

      let finalPrompt = form.prompt;
      if (negativePrompt) {
        finalPrompt += ` ### NOT ${negativePrompt}`;
      }

      try {
        const response = await fetch(`${BASE_URL}/dalle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            model: form.model,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || response.statusText);
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setForm(prev => ({ ...prev, photo: imageUrl }));

        setSessionHistory(prev => [imageUrl, ...prev].slice(0, 5));
        resetFilters();

        // Extract Colors
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        img.onload = () => {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(img, 5); // Get 5 dominant colors
          const hexPalette = palette.map(rgb => `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`);
          setForm(prev => ({ ...prev, colors: hexPalette }));
          toast.success("Palette Extracted! 🎨");
        }

      } catch (error) {
        console.error("Error generating image:", error);
        toast.error(`AGI Error: ${error.message}`);
        setErrorHandler({ isError: true, status: error.message });
      } finally {
        setGeneratingImg(false);
      }
    } else {
      toast.error('Please provide proper prompt');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.prompt && form.photo && form.name) {
      setLoading(true)

      try {
        fetch(form.photo)
          .then(response => response.blob())
          .then(blob => {
            const convertedFile = new File([blob], `${form.name}.jpg`, { type: 'image/*' });
            const formData = new FormData();
            formData.append('photoFile', convertedFile);
            formData.append('name', form.name);
            formData.append('prompt', form.prompt);
            formData.append('model', form.model);
            if (form.parentId) formData.append('parentId', form.parentId);
            if (form.colors) formData.append('colors', JSON.stringify(form.colors));

            const token = localStorage.getItem('token');

            fetch(POST_DATA_API, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            })
              .then(response => {
                if (response.status === 401) throw new Error("Please login to share posts!");
                if (!response.ok) throw new Error("Failed to share post");
                return response.json();
              })
              .then(() => {
                toast.success("Shared Successfully!")
                setLoading(false);
                navigate('/');
              })
              .catch(error => {
                toast.error(error.message || error);
                setLoading(false);
              });
          });
      } catch (error) {
        toast.error(error)
      }
    } else {
      alert('Please generate an image with proper details');
    }
  }

  return (
    <section className="max-w-7xl mx-auto animate-fade-in-up pb-12">
      <div className='mb-10 text-center'>
        <h1 className="heading-hero text-[32px] sm:text-[48px] leading-tight">Visualize <span className="text-gradient-minimal">Your Dreams</span></h1>
        <p className="mt-2 text-zinc-400 text-[16px] max-w-[600px] mx-auto font-light">
          Turn your imagination into reality. Create stunning masterpieces for your projects.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Left: Configuration Panel */}
        <div className="w-full lg:w-1/2 glass-panel p-6 rounded-2xl flex flex-col gap-6 order-2 lg:order-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiSettings /> Configuration
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormField
              labelName="Your Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              handleChange={handleChange}
            />

            <div className="relative group">
              <FormField
                labelName="Prompt"
                type="text"
                name="prompt"
                placeholder="Describe your imagination..."
                value={form.prompt}
                handleChange={handleChange}
                isSurpriseMe
                handleSurpriseMe={handleSurpriseMe}
              />
              <button
                type="button"
                onClick={handleMagicPrompt}
                className="absolute right-0 top-[2.3rem] mr-2 text-yellow-400 hover:text-yellow-300 bg-zinc-900/50 p-2 rounded-lg transition-all hover:scale-110"
                title="Magic Wand: Enhance Prompt"
              >
                <FiZap size={18} />
              </button>
            </div>

            {/* Style Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Style Presets</span>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => handleStyleApply(style.prompt)}
                    className="px-3 py-1.5 bg-zinc-800/50 border border-white/5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 hover:border-white/20 transition-all font-medium"
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="border border-white/5 rounded-xl p-4 bg-black/20">
              <div className="flex items-center gap-2 cursor-pointer w-fit mb-2" onClick={() => setShowAdvanced(!showAdvanced)}>
                <FiSettings className={`text-zinc-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                <span className="text-zinc-300 text-sm font-medium select-none">Advanced Settings</span>
              </div>

              {showAdvanced && (
                <div className="animate-fade-in-up pt-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Negative Prompt</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Low quality, blur, distortion..."
                    className="input-modern"
                  />
                </div>
              )}
              <div className='flex items-center gap-2 mt-4'>
                <span className="text-sm text-zinc-400">Model:</span>
                <CreatePageDropDown data={models} handleChange={handleChange} form={form} setForm={setForm} />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type='button'
                onClick={generateImage}
                className="flex-1 btn-primary"
                disabled={generatingImg}
              >
                {generatingImg ? <Loader /> : 'Generate'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Preview Panel */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 order-1 lg:order-2 sticky top-24">
          {/* Session History Strip */}
          {sessionHistory.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {sessionHistory.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition-all ${form.photo === img ? 'border-purple-500 scale-110' : 'border-white/10 hover:border-white/50'}`}
                  onClick={() => setForm(prev => ({ ...prev, photo: img }))}
                />
              ))}
            </div>
          )}

          {(form.photo || generatingImg || errorHandler.isError) && (
            <div className="aspect-square w-full rounded-2xl glass-card overflow-hidden border border-white/10 relative group flex justify-center items-center bg-black/40 animate-scale-in">
              {errorHandler.isError && (
                <div className='flex flex-col gap-4 justify-center items-center p-8 text-center'>
                  <BiSolidError className='w-16 h-16 text-red-500' />
                  <p className='text-zinc-300'>Failed to generate image.</p>
                  <p className='text-sm text-red-400 font-mono bg-red-500/10 px-2 py-1 rounded'>{errorHandler.status}</p>
                </div>
              )}

              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.photo}
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-500 transition-all"
                  style={getFilterStyle()}
                />
              ) : null}

              {generatingImg && (
                <div className="absolute inset-0 z-10 flex flex-col gap-4 justify-center items-center bg-[#09090b]/90 backdrop-blur-md animate-in fade-in duration-700">
                  <Loader />
                </div>
              )}

              {/* Filter & Download Controls Overlay */}
              {form.photo && !generatingImg && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                  {/* Filter Toggles */}
                  <div className="flex justify-between items-end">
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-xs bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10"
                    >
                      {showFilters ? 'Hide Filters' : 'Edit Image'}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform shadow-lg shadow-white/20"
                      title="Download"
                    >
                      <FiDownload size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter Sliders Panel */}
          {showFilters && form.photo && (
            <div className="glass-panel p-4 rounded-xl animate-fade-in-up flex flex-col gap-3">
              <div className="flex justify-between text-xs text-zinc-400 uppercase font-bold tracking-wider">
                <span>Adjustments</span>
                <button onClick={resetFilters} className="text-blue-400 hover:text-blue-300">Reset</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-zinc-400">Brightness</span>
                  <input type="range" min="0" max="200" value={filters.brightness} onChange={(e) => setFilters({ ...filters, brightness: e.target.value })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-zinc-400">Contrast</span>
                  <input type="range" min="0" max="200" value={filters.contrast} onChange={(e) => setFilters({ ...filters, contrast: e.target.value })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-zinc-400">Saturation</span>
                  <input type="range" min="0" max="200" value={filters.saturation} onChange={(e) => setFilters({ ...filters, saturation: e.target.value })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                {/* New Filters */}
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-zinc-400">Sepia</span>
                  <input type="range" min="0" max="100" value={filters.sepia} onChange={(e) => setFilters({ ...filters, sepia: e.target.value })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-zinc-400">Blur</span>
                  <input type="range" min="0" max="10" step="0.5" value={filters.blur} onChange={(e) => setFilters({ ...filters, blur: e.target.value })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-16 text-zinc-400">Hue</span>
                  <input type="range" min="0" max="360" value={filters.hueRotate} onChange={(e) => setFilters({ ...filters, hueRotate: e.target.value })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                </div>
              </div>
            </div>
          )}

          {/* Sharing Section - Only show if photo exists */}
          {form.photo && !generatingImg && (
            <div className="glass-panel p-4 rounded-xl flex justify-between items-center animate-slide-in">
              <div>
                <h3 className="text-white font-medium">Ready to share?</h3>
                <p className="text-zinc-500 text-xs">Publish your creation to the community feed.</p>
              </div>
              <button
                type="button"
                onClick={handleSubmit} // Trigger form submit logic for sharing
                className="btn-secondary px-6 py-2 text-sm flex items-center gap-2"
                disabled={loading}
              >
                {loading ? 'Sharing...' : <><FiShare2 /> Share</>}
              </button>
            </div>
          )}
        </div>
      </div>

    </section >
  )
}

export default CreatePost