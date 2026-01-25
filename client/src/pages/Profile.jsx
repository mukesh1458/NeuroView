import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { FiGrid, FiLayers, FiSettings, FiUser, FiZap } from 'react-icons/fi';

const Profile = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('created'); // 'created' | 'collections'
    const [posts, setPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        if (user) {
            if (activeTab === 'created') fetchUserPosts();
            else fetchCollections();
        }
    }, [user, activeTab]);

    const fetchUserPosts = async () => {
        setLoading(true);
        try {
            // In a real app, we'd have a specific endpoint /post/user/:id
            // For now, we'll filter the main feed or assume the previously fetched 'allPosts' approach 
            // But let's verify if we need a new route. The current GET /post returns all. 
            // Let's filter client side for MVP or add a query param if needed. 
            // Ideally: GET /api/v1/post?user=ID

            const res = await fetch(`${BASE_URL}/post`);
            const data = await res.json();
            if (data.success) {
                // Filter by user ID (assuming post.user matches user.id or user.username)
                // Since we stored user object ID in post.user, we compare.
                const userPosts = data.data.filter(post => post.user === user.id || post.name === user.username);
                setPosts(userPosts.reverse());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/collections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setCollections(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-white text-center mt-20">Please login to view profile.</div>;

    return (
        <section className="max-w-7xl mx-auto pt-10 pb-20 px-4 min-h-screen">

            {/* Header */}
            <div className="flex flex-col items-center mb-12 animate-fade-in-up">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-2xl ring-4 ring-white/10">
                    {user.username[0].toUpperCase()}
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">{user.username}</h1>
                <p className="text-zinc-400 text-sm mb-6">{user.email}</p>

                <div className="flex gap-4">
                    <button onClick={logout} className="px-6 py-2 rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors text-sm">
                        Sign Out
                    </button>
                    <button className="px-6 py-2 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors text-sm">
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center border-b border-white/10 mb-8">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`pb-4 text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'created' ? 'text-white border-b-2 border-cyan-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <FiGrid /> Created <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{posts.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('collections')}
                        className={`pb-4 text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'collections' ? 'text-white border-b-2 border-cyan-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <FiLayers /> Collections <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{collections.length}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader /></div>
            ) : (
                <>
                    {activeTab === 'created' && (
                        <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-4">
                            {posts.length > 0 ? (
                                posts.map(post => <Card key={post._id} {...post} user={user} />)
                            ) : (
                                <div className="col-span-full text-center py-20 text-zinc-500">
                                    No creations yet. Go create something amazing!
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'collections' && (
                        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
                            {collections.length > 0 ? (
                                collections.map(col => (
                                    <div key={col._id} className="glass-card p-5 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiSettings className="text-zinc-400 hover:text-white" />
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2">{col.name}</h3>
                                        <p className="text-zinc-400 text-sm mb-4">{col.posts.length} posts</p>

                                        {/* Preview Grid */}
                                        <div className="grid grid-cols-2 gap-2 aspect-video rounded-xl overflow-hidden bg-black/20">
                                            {col.posts.slice(0, 4).map((post, idx) => (
                                                <img
                                                    key={idx}
                                                    src={typeof post === 'object' ? post.photo : ''}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                            ))}
                                            {col.posts.length === 0 && (
                                                <div className="col-span-2 flex items-center justify-center text-zinc-600 text-xs">Empty Board</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-zinc-500">
                                    No mood boards found. Create one by saving a post!
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

        </section>
    );
};

export default Profile;
