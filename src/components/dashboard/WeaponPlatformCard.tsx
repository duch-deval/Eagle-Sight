import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileBarChart } from "lucide-react";
import { CorporateCard } from "@/components/ui/TacticalComponents";

interface WeaponPlatformCardProps {
    id: string;
    name: string;
    category: string;
    description?: string;
    contractors?: string[];
    imagePath?: string;
}

export const WeaponPlatformCard: React.FC<WeaponPlatformCardProps> = ({
    id,
    name,
    category,
    description,
    contractors,
    imagePath,
}) => {
    const navigate = useNavigate();

    return (
        <CorporateCard className="group h-full border-t-4 border-t-border hover:border-t-corporate-blue flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <div
                className="h-48 bg-slate-200 relative overflow-hidden cursor-pointer"
                onClick={() => navigate(`/platforms/${id}`)}
            >
                <img
                    src={imagePath || `${import.meta.env.BASE_URL}${id}.jpg`}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                />
                <div className="absolute inset-0 bg-muted flex items-center justify-center hidden">
                    <div className="text-muted-foreground opacity-10 text-8xl font-bold tracking-tighter select-none">
                        {name.substring(0, 2)}
                    </div>
                </div>
                <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-sm">
                    {category}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3
                            className="text-xl font-bold text-corporate-navy group-hover:text-corporate-blue transition-colors cursor-pointer"
                            onClick={() => navigate(`/platforms/${id}`)}
                        >
                            {name}
                        </h3>
                        <FileBarChart className="h-5 w-5 text-slate-300 group-hover:text-corporate-blue transition-colors" />
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-3">
                        Prime: {contractors?.[0] || "Unknown"}
                    </div>
                    {description && (
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                            {description}
                        </p>
                    )}
                </div>

                <div className="mt-auto pt-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate(`/platforms/${id}`)}
                        className="text-corporate-blue font-bold text-xs flex items-center group-hover:underline"
                    >
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                </div>
            </div>
        </CorporateCard>
    );
};
