import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await register(formData.username, formData.email, formData.password);
        setLoading(false);
        if (success) navigate('/');
    };

    return (
        <section className="flex justify-center items-center min-h-[80vh] px-4 animate-slide-in">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
                {/* Decorative Blur */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px]"></div>

                <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Join NeuroView</h2>
                <p className="text-zinc-400 text-center mb-8">Unlock unlimited creativity and premium features.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                    <div>
                        <label className="text-sm font-medium text-zinc-300 block mb-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="NeonArtist"
                            value={formData.username}
                            onChange={handleChange}
                            className="input-modern"
                            required
                        />
                    </div>
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
                        className="btn-primary w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 border-none text-white hover:shadow-purple-500/25"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#18181b] px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="overflow-hidden rounded-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    const success = await googleLogin(credentialResponse.credential);
                                    if (success) navigate('/');
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                    toast.error("Google Login Failed");
                                }}
                                theme="filled_black"
                                shape="pill"
                                text="signup_with"
                            />
                        </div>
                    </div>
                </form>

                <p className="mt-6 text-center text-zinc-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                        Login
                    </Link>
                </p>
                <div className="mt-4 text-center">
                    <p className="text-xs text-zinc-500 font-light">Crafted by <span className="text-zinc-400 font-medium">Mukesh Chowdary & Team</span></p>
                </div>
            </div>
        </section>
    );
};

export default Register;
