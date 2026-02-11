import { DepotLocation } from "@/data/weaponsPlatforms";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DepotMapProps {
  depots: DepotLocation[];
}

// US TopoJSON - Albers USA projection handles all 50 states correctly
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const DepotMap = ({ depots }: DepotMapProps) => {
  const [hoveredDepot, setHoveredDepot] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
        Sustainment & Maintenance Network
      </h3>

      {/* Map Container */}
      <div className="relative w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded overflow-hidden">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          {/* State boundaries */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e2e8f0"
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  className="dark:fill-slate-700 dark:stroke-slate-600"
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#cbd5e1" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Depot Markers */}
          {depots.map((depot, idx) => {
            if (!depot.coordinates?.lat || !depot.coordinates?.lon) return null;

            const isHovered = hoveredDepot === depot.name;

            return (
              <Marker
                key={idx}
                coordinates={[depot.coordinates.lon, depot.coordinates.lat]}
                onMouseEnter={() => setHoveredDepot(depot.name)}
                onMouseLeave={() => setHoveredDepot(null)}
                onClick={() => {
                  if (depot.id) navigate(`/depots/${depot.id}`);
                }}
                style={{
                  default: { cursor: "pointer" },
                  hover: { cursor: "pointer" },
                  pressed: { cursor: "pointer" },
                }}
              >
                {/* Pulse ring animation */}
                <circle
                  r={14}
                  fill="rgba(59, 130, 246, 0.3)"
                  opacity={isHovered ? 1 : 0.5}
                >
                  <animate
                    attributeName="r"
                    from="8"
                    to="18"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Main marker dot */}
                <circle
                  r={6}
                  fill={isHovered ? "#2563eb" : "#1e293b"}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: "pointer", transition: "fill 0.2s" }}
                />

                {/* Tooltip card on hover */}
                {isHovered && (
                  <g style={{ pointerEvents: "none" }}>
                    {/* Card background */}
                    <rect
                      x={12}
                      y={-50}
                      width={150}
                      height={46}
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      rx={4}
                      filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))"
                    />

                    {/* Depot name (small label) */}
                    <text
                      x={20}
                      y={-32}
                      fontSize={8}
                      fontWeight="700"
                      fill="#94a3b8"
                      style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                    >
                      {depot.name.length > 28
                        ? depot.name.substring(0, 28) + "..."
                        : depot.name}
                    </text>

                    {/* Base name (prominent) */}
                    <text x={20} y={-14} fontSize={12} fontWeight="700" fill="#1e293b">
                      {depot.base}
                    </text>
                  </g>
                )}
              </Marker>
            );
          })}
        </ComposableMap>

      </div>

      <div className="mt-3 text-[10px] text-slate-400 italic text-right flex justify-end items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Source: GAO analysis of Department of Defense and contractor data
      </div>
    </div>
  );
};

export default DepotMap;