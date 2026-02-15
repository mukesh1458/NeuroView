import React, { Suspense, lazy } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Loader from "./components/Loader";
import CustomCursor from "./components/CustomCursor";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy Load Pages
const Home = lazy(() => import("./pages/Home"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const SummarizeApp = lazy(() => import("./components/SummarizeApp"));
const WebSummaries = lazy(() => import("./pages/WebSummaries"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));

const AuthNav = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {/* Navigation Links Group */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
        <Link
          to="/web-summaries"
          className="px-4 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-all rounded-full hover:bg-white/10 hover-glow"
        >
          Web Summaries
        </Link>
        <Link
          to="/summarize"
          className="px-4 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-all rounded-full hover:bg-white/10 hover-glow"
        >
          Summarizer
        </Link>
        {user && (
          <Link
            to="/create-post"
            className="px-5 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/10 relative overflow-hidden group ml-1 hover-glow"
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
          <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white border border-white/20 shadow-inner ring-2 ring-black/20 hover:scale-105 transition-transform hover-glow overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.username[0].toUpperCase()
            )}
          </Link>
        </div>

      ) : (
        <div className="flex items-center gap-3 pl-2 sm:border-l border-white/10">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors hover-glow">Login</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-bold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 hover-glow">Sign Up</Link>
        </div>
      )
      }
    </div >
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>


        {/* Global Custom Cursor */}
        <CustomCursor />

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
              <h1 className="font-extrabold text-2xl tracking-tighter group-hover:scale-105 transition-transform animate-breathe">
                <span className="text-gradient-minimal tracking-tighter">NeuroView</span>
              </h1>
            </Link>

            <div className="flex gap-3">
              <AuthNav />
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-32 pt-40">
            <Suspense fallback={
              <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/create-post"
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/summarize"
                  element={
                    <ProtectedRoute>
                      <SummarizeApp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/web-summaries"
                  element={
                    <ProtectedRoute>
                      <WebSummaries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Suspense>
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
