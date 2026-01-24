import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import SummarizeApp from "./components/SummarizeApp";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a'
        },
      }} />
      <div className="min-h-screen flex flex-col bg-[#09090b]">
        <header className="w-full flex justify-between items-center bg-[#09090b]/50 backdrop-blur-md z-50 sm:px-8 px-4 py-4 border-b border-white/10 sticky top-0 animate-slide-in">
          <Link to="/" className="flex items-center gap-2 animate-float">
            <h1 className="font-extrabold text-2xl tracking-tighter">
              <span className="text-gradient-minimal tracking-tighter">NeuroView</span>
            </h1>
          </Link>

          <div className="flex gap-3">
            <Link
              to="/create-post"
              className="btn-primary text-sm shadow-lg shadow-white/5 animate-pulse-glow"
            >
              Create
            </Link>

            <Link
              to="/summarize"
              className="btn-secondary text-sm"
            >
              Summarize
            </Link>
          </div>
        </header>

        <main className="flex-1 sm:p-8 px-4 py-8 w-full max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/summarize" element={<SummarizeApp />} />
          </Routes>
        </main>

        <footer className="w-full text-center py-8 border-t border-white/10 bg-[#09090b]/50 backdrop-blur-md">
          <p className="text-zinc-500 font-inter text-sm">
            &copy; {new Date().getFullYear()} NeuroView. Project by <span className="text-zinc-300 font-medium">Mukesh Chowdary</span> & Team.
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
