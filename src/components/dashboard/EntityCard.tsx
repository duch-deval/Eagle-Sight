import React from "react";
import { CorporateCard } from "@/components/ui/TacticalComponents";

interface EntityCardProps {
    name: string;
    type?: string;
    imagePath: string;
    subtitle?: string;
    onClick?: () => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
    name,
    type,
    imagePath,
    subtitle,
    onClick,
}) => {
    return (
        <CorporateCard
            className={`group h-full border-t-4 border-t-slate-200 hover:border-t-corporate-blue flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                <img
                    src={imagePath}
                    alt={name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                        // Fallback to a placeholder style if image missing
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        e.currentTarget.parentElement?.classList.add("bg-slate-200");
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                />
                {/* Fallback Text if image fails */}
                <div className="hidden text-slate-400 font-bold text-lg text-center">
                    {name.substring(0, 2).toUpperCase()}
                </div>

                {type && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-corporate-navy text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm border border-slate-100">
                        {type}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 border-t border-slate-100">
                <h3 className="font-bold text-corporate-navy text-sm mb-1 group-hover:text-corporate-blue transition-colors">
                    {name}
                </h3>
                {subtitle && (
                    <div className="text-xs text-slate-500 mt-1">
                        {subtitle}
                    </div>
                )}
            </div>
        </CorporateCard>
    );
};
