import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import SummarizeApp from "./components/SummarizeApp";
import WebSummaries from "./pages/WebSummaries";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

const AuthNav = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {/* Navigation Links Group */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
        <Link
          to="/web-summaries"
          className="px-4 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-all rounded-full hover:bg-white/10"
        >
          Web Summaries
        </Link>
        <Link
          to="/summarize"
          className="px-4 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-all rounded-full hover:bg-white/10"
        >
          Summarizer
        </Link>
        {user && (
          <Link
            to="/create-post"
            className="px-5 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10 relative overflow-hidden group ml-1"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            <span className="text-xl leading-none relative z-10">+</span>
            <span className="relative z-10">Create</span>
          </Link>
        )}
      </div>

      {/* User Actions Group */}
      {user ? (
        <div className="flex items-center gap-3 pl-2 sm:border-l border-white/10">
          <div className="flex items-center gap-3 order-1">
            <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white border border-white/20 shadow-inner ring-2 ring-black/20 hover:scale-105 transition-transform">
              {user.username[0].toUpperCase()}
            </Link>
            <button onClick={logout} className="hidden sm:block text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors">Logout</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 pl-2 sm:border-l border-white/10">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Login</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-bold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">Sign Up</Link>
        </div>
      )}
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-slow object-right-bottom"></div>
          </div>

          {/* Glossy Header */}
          <header className="fixed top-0 left-0 w-full flex justify-between items-center bg-black/20 backdrop-blur-md z-50 sm:px-8 px-4 py-4 border-b border-white/10 shadow-lg shadow-cyan-500/5 transition-all duration-300">
            <Link to="/" className="flex items-center gap-2 group">
              <h1 className="font-extrabold text-2xl tracking-tighter group-hover:scale-105 transition-transform">
                <span className="text-gradient-minimal tracking-tighter">NeuroView</span>
              </h1>
            </Link>

            <div className="flex gap-3">
              {/* Auth-aware Navigation will be handled by a sub-component or inline logic */}
              <AuthNav />
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-32 pt-40">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/summarize" element={<SummarizeApp />} />
              <Route path="/web-summaries" element={<WebSummaries />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>

          {/* Antigravity Footer (Static Floating Capsule) */}
          <footer className="w-full max-w-fit mx-auto mb-6 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-900/20 z-40 flex items-center gap-6 animate-fade-in-up">
            <p className="text-zinc-400 font-inter text-xs sm:text-sm whitespace-nowrap">
              &copy; 2026 NeuroView. <span className="mx-2 text-zinc-600">|</span> Engineered by <span className="text-zinc-200 font-medium hover:text-cyan-400 transition-colors cursor-pointer">Mukesh Chowdary & Team</span>
            </p>
            <div className="hidden sm:flex items-center gap-4 border-l border-white/10 pl-4">
              <a href="#" className="text-zinc-500 hover:text-white text-xs transition-colors">Privacy</a>
              <a href="#" className="text-zinc-500 hover:text-white text-xs transition-colors">Terms</a>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
