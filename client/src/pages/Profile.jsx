import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EditProfileModal from '../components/EditProfileModal';
import { FiGrid, FiLayers, FiSettings, FiUser, FiZap } from 'react-icons/fi';

const Profile = () => {
    const { user, logout, loading: authLoading } = useAuth(); // Get setUser from context if available, or we update local state
    // Actually useAuth doesn't expose setUser directly usually, but we can rely on window reload or just local state for instant feedback
    // In AuthContext we see setUser is internal. 
    // Best practice: The modal updates localStorage, and we might need to reload or refetch. 
    // However, for this snippet, let's just update local display state if we want instant feedback without reload, 
    // OR we can assume AuthContext listens to Storage (it doesn't usually). 
    // Let's pass a handler to the modal that updates the user object in localStorage AND triggers a window reload or re-fetch?
    // EASIER: The modal updates localStorage. We can just modify the 'user' object in state here if we want? 
    // Wait, 'user' comes from useAuth. If we update localStorage, useAuth won't know unless we reload.
    // Let's reload to be safe and simple, OR ask useAuth to expose a refresh function.
    // For now, let's just rely on the Modal updating the "user" in localStorage, and we can force a window.location.reload() for simplicity.

    // BETTER: Let's make a local copy of user to display updates immediately? No, 'user' is from context.
    // Let's just use window.location.reload() in the onUpdate callback for now to ensure Context gets fresh data.

    const [activeTab, setActiveTab] = useState('created');
    const [posts, setPosts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            const res = await fetch(`${BASE_URL}/post`);
            const data = await res.json();
            if (data.success) {
                const userPosts = data.data.filter(post => post.user === user._id || post.name === user.username);
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

    const handleProfileUpdate = (updatedUser) => {
        // Simple reload to refresh context
        window.location.reload();
    };

    if (authLoading) return <div className="flex justify-center mt-20"><Loader /></div>;
    if (!user) return <div className="text-white text-center mt-20">Please login to view profile.</div>;

    return (
        <section className="max-w-7xl mx-auto pt-10 pb-20 px-4 min-h-screen">

            {/* Header */}
            <div className="flex flex-col items-center mb-12 animate-fade-in-up">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-2xl">
                        <div className="w-full h-full rounded-full bg-[#18181b] overflow-hidden flex items-center justify-center relative">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-5xl font-bold text-white">{user.username[0].toUpperCase()}</span>
                            )}
                        </div>
                    </div>
                    {/* Online Status / Premium Badge */}
                    <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-[#09090b]"></div>
                </div>

                <h1 className="text-3xl font-bold text-white mt-4 mb-1">{user.username}</h1>
                <p className="text-zinc-400 text-sm mb-3">{user.email}</p>

                {user.bio && (
                    <p className="text-zinc-300 text-center max-w-md mb-6 leading-relaxed italic">
                        "{user.bio}"
                    </p>
                )}

                <div className="flex gap-4 mt-2">
                    <button onClick={logout} className="px-6 py-2 rounded-full border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors text-sm font-medium">
                        Sign Out
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-6 py-2 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors text-sm shadow-lg shadow-white/10"
                    >
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
                                posts.map(post => <Card key={post._id} {...post} authUser={user} />)
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

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={user}
                onUpdate={handleProfileUpdate}
            />

        </section>
    );
};

export default Profile;
