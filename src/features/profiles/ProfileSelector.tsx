import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../stores/useProfileStore';
import { Plus, User, Trash2 } from 'lucide-react';

export const ProfileSelector: React.FC = () => {
    const { profiles, isLoading, fetchProfiles, setActiveProfile, deleteProfile } = useProfileStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleSelectProfile = (id: string) => {
        setActiveProfile(id);
        navigate(`/app/${id}`);
    };

    const handleCreateProfile = async () => {
        const name = `New Profile ${profiles.length + 1}`;
        await useProfileStore.getState().createProfile(name);
    };

    const handleDeleteProfile = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this profile? All local data will be lost.')) {
            await deleteProfile(id);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-8">
            <div className="max-w-4xl w-full text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Select Profile
                </h1>
                <p className="text-zinc-400">Choose a workspace to continue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
                {profiles.map((profile) => (
                    <div
                        key={profile.id}
                        onClick={() => handleSelectProfile(profile.id)}
                        className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300">
                                <User size={24} />
                            </div>
                            <button
                                onClick={(e) => handleDeleteProfile(e, profile.id)}
                                className="p-2 text-zinc-600 hover:text-red-400 transition-colors duration-200"
                                title="Delete Profile"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                            {profile.description || 'No description provided'}
                        </p>
                        <div className="text-xs text-zinc-500">
                            Created: {new Date(profile.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleCreateProfile}
                    className="flex flex-col items-center justify-center bg-zinc-900/30 border border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 group"
                >
                    <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/20 text-zinc-500 group-hover:text-emerald-400 transition-colors duration-300 mb-4">
                        <Plus size={24} />
                    </div>
                    <span className="font-semibold text-zinc-400 group-hover:text-zinc-200">New Profile</span>
                </button>
            </div>

            {isLoading && (
                <div className="mt-8 text-emerald-400 animate-pulse">
                    Loading profiles...
                </div>
            )}
        </div>
    );
};
