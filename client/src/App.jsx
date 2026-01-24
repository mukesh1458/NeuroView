import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import SummarizeApp from "./components/SummarizeApp";
import WebSummaries from "./pages/WebSummaries";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a'
        },
      }} />
      <div className="min-h-screen flex flex-col bg-[#09090b] relative overflow-hidden">

        {/* Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow object-right-bottom"></div>
        </div>

        <header className="fixed top-0 left-0 w-full flex justify-between items-center bg-[#09090b]/70 backdrop-blur-2xl z-50 sm:px-8 px-4 py-4 border-b border-white/5 transition-all duration-300">
          <Link to="/" className="flex items-center gap-2 group">
            <h1 className="font-extrabold text-2xl tracking-tighter group-hover:scale-105 transition-transform">
              <span className="text-gradient-minimal tracking-tighter">NeuroView</span>
            </h1>
          </Link>

          <div className="flex gap-3">
            <Link
              to="/web-summaries"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-lg hover:bg-white/5"
            >
              Web Summaries
            </Link>
            <Link
              to="/summarize"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-lg hover:bg-white/5"
            >
              Summarize
            </Link>
            <Link
              to="/create-post"
              className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-md flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span> Create
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-24 pt-40">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/summarize" element={<SummarizeApp />} />
            <Route path="/web-summaries" element={<WebSummaries />} />
          </Routes>
        </main>

        <footer className="fixed bottom-0 left-0 w-full text-center py-4 border-t border-white/5 bg-[#09090b]/90 backdrop-blur-xl z-40">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 font-inter text-sm">
              &copy; {new Date().getFullYear()} NeuroView. <span className="mx-2 text-zinc-700">|</span> Engineered by <span className="text-white font-medium hover:text-purple-400 transition-colors cursor-pointer">Mukesh Chowdary & Team</span>
            </p>
            <div className="flex gap-6 text-zinc-600 text-sm">
              <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Twitter</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
