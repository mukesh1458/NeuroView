import React from 'react';
import { FiSearch, FiFilter, FiGrid, FiZap } from 'react-icons/fi';

const FilterBar = ({
    searchText,
    setSearchText,
    filterModel,
    setFilterModel,
    filterColor,
    setFilterColor,
    activeTab,
    setActiveTab,
}) => {
    return (
        <div className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-y border-white/5 py-4 mb-10 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between px-4">

                {/* Tabs */}
                <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5 min-w-fit">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'feed' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <FiGrid /> Feed
                    </button>
                    <button
                        onClick={() => setActiveTab('trending')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'trending' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                        <FiZap /> Trending
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:max-w-md group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                        <FiSearch className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 outline-none transition-all shadow-sm placeholder-zinc-500"
                        placeholder="Search posts by name or prompt..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium whitespace-nowrap">
                        <FiFilter /> Filters:
                    </div>

                    {/* Model Select */}
                    <select
                        value={filterModel}
                        onChange={(e) => setFilterModel(e.target.value)}
                        className="bg-zinc-900 border border-white/10 text-zinc-300 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <option value="All">All Models</option>
                        <option value="stable-diffusion-2-1">Stable Diffusion</option>
                        <option value="sdxl-wrong-lora">SDXL</option>
                        <option value="dall-e-2">DALL-E 2</option>
                    </select>

                    {/* Color Select */}
                    <select
                        value={filterColor}
                        onChange={(e) => setFilterColor(e.target.value)}
                        className="bg-zinc-900 border border-white/10 text-zinc-300 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <option value="All">All Colors</option>
                        <option value="red">Red 🔴</option>
                        <option value="orange">Orange 🟠</option>
                        <option value="yellow">Yellow 🟡</option>
                        <option value="green">Green 🟢</option>
                        <option value="blue">Blue 🔵</option>
                        <option value="purple">Purple 🟣</option>
                        <option value="pink">Pink 🌸</option>
                        <option value="black">Black ⚫</option>
                        <option value="white">White ⚪</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
