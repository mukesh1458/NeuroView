import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AVATAR_STYLES = [
    'https://api.dicebear.com/9.x/notionists/svg?seed=Felix',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Milo',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Bella',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Leo',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Sora',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Kiki',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Luna',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Max',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Zoe',
    'https://api.dicebear.com/9.x/notionists/svg?seed=Bibi'
];

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdate }) => {
    const [username, setUsername] = useState(currentUser?.username || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth(); // getting auth context in case we need update local storage logic here or just rely on onUpdate

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/user/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    bio,
                    avatar: selectedAvatar
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Profile updated successfully!');
                onUpdate(data.user); // Update parent state
                // Update local storage to reflect changes immediately across app
                localStorage.setItem('user', JSON.stringify(data.user));
                onClose();
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scale-in">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Avatar Selection */}
                    <div>
                        <label className="text-sm font-medium text-zinc-400 block mb-3">Choose Avatar</label>
                        <div className="grid grid-cols-4 gap-3">
                            {AVATAR_STYLES.map((avatarUrl, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setSelectedAvatar(avatarUrl)}
                                    className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all ${selectedAvatar === avatarUrl ? 'border-cyan-500 scale-105 shadow-glow-sm' : 'border-transparent hover:border-white/20'}`}
                                >
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    {selectedAvatar === avatarUrl && (
                                        <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                            <FiCheck className="text-white drop-shadow-md" size={16} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-400 block mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-zinc-400 block mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="3"
                                placeholder="Tell us about yourself..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
