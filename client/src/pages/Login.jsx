import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(formData.email, formData.password);
        setLoading(false);
        if (success) navigate('/');
    };

    return (
        <section className="flex justify-center items-center min-h-[80vh] px-4 animate-fade-in-up">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
                {/* Decorative Blur */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-[50px]"></div>

                <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Welcome Back</h2>
                <p className="text-zinc-400 text-center mb-8">Sign in to continue your creative journey.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                    <div>
                        <label className="text-sm font-medium text-zinc-300 block mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-modern"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-zinc-300 block mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-modern"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 border-none text-white hover:shadow-cyan-500/25"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                        Register
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default Login;
