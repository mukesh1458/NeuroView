import React from 'react';

const SkeletonCard = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl bg-zinc-900/50 border border-white/5">
                    {/* Image Skeleton */}
                    <div className="skeleton-card w-full aspect-square" />

                    {/* Content Skeleton */}
                    <div className="p-4 space-y-3">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3">
                            <div className="skeleton w-8 h-8 rounded-full" />
                            <div className="skeleton h-3 w-24 rounded" />
                        </div>

                        {/* Prompt lines */}
                        <div className="space-y-2">
                            <div className="skeleton h-2 w-full rounded" />
                            <div className="skeleton h-2 w-3/4 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default SkeletonCard;
