import React, { useState, useEffect } from "react";
import { RefreshCw, ExternalLink, Shield, FileText, AlertCircle, Clock, Rss, Lock } from "lucide-react";
import supabase from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

// ============================================
// Types
// ============================================
interface NewsArticle {
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  relevance: "high" | "medium" | "low";
}

interface PlatformNewsProps {
  platformName: string;
}

// ============================================
// Helpers
// ============================================
const cleanText = (text?: string): string => {
  if (!text) return "";
  return text.replace(/:contentReference\[.*?\]\{.*?\}/g, '').trim();
};

const getPlatformKey = (platform: string): string => {
  return platform.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

// ============================================
// Component
// ============================================
export const PlatformNews = ({ platformName }: PlatformNewsProps) => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [refreshBlocked, setRefreshBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const fetchNews = async (forceRefresh = false) => {
    setLoading(true);
    setRefreshBlocked(false);
    setBlockMessage(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-news`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ 
            platform: platformName,
            forceRefresh 
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error("Invalid response format");
      }

      setArticles(data.articles);
      setCached(data.cached || false);
      setCacheAge(data.cacheAge || null);
      setWeekStart(data.weekStart || null);

      // Check if refresh was blocked
      if (data.message && data.cached && forceRefresh) {
        setRefreshBlocked(true);
        setBlockMessage(data.message);
        toast({
          title: "Refresh Blocked",
          description: data.message,
          variant: "destructive",
        });
      } else if (!data.cached) {
        toast({
          title: "Intelligence Updated",
          description: `Fetched ${data.articles.length} fresh articles for ${platformName}`,
        });
      }

    } catch (error) {
      console.error("Error fetching news:", error);
      
      // Fallback to any cached data
      const platformKey = getPlatformKey(platformName);
      const { data: fallback } = await supabase
        .from("news_weeks")
        .select("articles, inserted_at, week_start")
        .eq("platform_key", platformKey)
        .order("week_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallback?.articles) {
        setArticles(fallback.articles);
        setCached(true);
        setWeekStart(fallback.week_start);
        
        const inserted = new Date(fallback.inserted_at);
        const hours = Math.round((Date.now() - inserted.getTime()) / (1000 * 60 * 60));
        setCacheAge(hours);
        
        toast({
          title: "Using Cached Data",
          description: "Could not fetch fresh intelligence. Showing archived data.",
          variant: "destructive",
        });
      } else {
        setArticles([]);
        toast({
          title: "No Data Available",
          description: "Could not fetch news for this platform.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [platformName]);

  // Calculate if refresh should be disabled (< 24h since last refresh)
  const canRefresh = !cacheAge || cacheAge >= 24;

  const getRelevanceStyle = (relevance: string) => {
    switch (relevance) {
      case "high":
        return { badge: "text-red-700 bg-red-50 border-red-200", strip: "bg-red-500" };
      case "medium":
        return { badge: "text-amber-700 bg-amber-50 border-amber-200", strip: "bg-amber-500" };
      case "low":
        return { badge: "text-emerald-700 bg-emerald-50 border-emerald-200", strip: "bg-emerald-500" };
      default:
        return { badge: "text-slate-600 bg-slate-50 border-slate-200", strip: "bg-slate-400" };
    }
  };

  const formatCacheAge = (hours: number): string => {
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Rss className="h-5 w-5 text-blue-600" />
            Intelligence Feed
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitoring: <span className="font-semibold text-blue-600">{platformName}</span> • 
            Updated weekly from Defense News, Breaking Defense, DoD
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Cache Status Badge */}
          {cached && cacheAge !== null && (
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded font-mono border border-slate-200 dark:border-slate-700">
              <Clock className="h-3 w-3" />
              CACHED {formatCacheAge(cacheAge)}
              {weekStart && <span className="text-slate-400 ml-1">• Week of {weekStart}</span>}
            </div>
          )}
          
          {/* Refresh Button */}
          <button 
            onClick={() => fetchNews(true)}
            disabled={loading || !canRefresh}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-sm transition-colors ${
              !canRefresh 
                ? 'text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50' 
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-slate-300 dark:border-slate-600 hover:border-blue-500'
            }`}
            title={!canRefresh ? `Refresh available in ${24 - (cacheAge || 0)}h` : 'Refresh news feed'}
          >
            {!canRefresh ? (
              <Lock className="h-3 w-3" />
            ) : (
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            )}
            {loading ? "Updating..." : !canRefresh ? `Wait ${24 - (cacheAge || 0)}h` : "Refresh"}
          </button>
        </div>
      </div>

      {/* Refresh Blocked Message */}
      {refreshBlocked && blockMessage && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <span>{blockMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && articles.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded border border-slate-200 dark:border-slate-700" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        
        /* Articles List */
        <div className="space-y-3">
          {articles.map((article, idx) => {
            const styles = getRelevanceStyle(article.relevance);
            
            return (
              <div 
                key={idx} 
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 overflow-hidden flex"
              >
                {/* Left Status Strip */}
                <div className={`w-1 flex-shrink-0 ${styles.strip}`} />
                
                {/* Content */}
                <div className="flex-1 p-4 flex flex-col md:flex-row gap-4">
                  
                  {/* Metadata Column */}
                  <div className="md:w-40 flex-shrink-0 flex flex-col gap-2">
                    <span className={`inline-flex items-center self-start px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}>
                      {article.relevance}
                    </span>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      <div className="font-bold uppercase tracking-wider mb-0.5">Date</div>
                      <div className="text-slate-600 dark:text-slate-400 font-mono">
                        {new Date(article.date).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      <div className="font-bold uppercase tracking-wider mb-0.5">Source</div>
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        {cleanText(article.source)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {cleanText(article.title)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                      {cleanText(article.summary)}
                    </p>
                    
                    {/* Actions */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <a 
                        href={article.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/link"
                      >
                        Read Full Article
                        <ExternalLink className="ml-1 h-3 w-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                      </a>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800" 
                          title="Add to Report"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800" 
                          title="Flag as Critical"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      ) : (
        /* Empty State */
        <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 rounded">
          <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">
            No intelligence reports available
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            Click refresh to fetch news for {platformName}
          </p>
          <button 
            onClick={() => fetchNews(true)}
            disabled={loading}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
          >
            Fetch Intelligence
          </button>
        </div>
      )}
      
      {/* Footer */}
      {articles.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2 text-center text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2 rounded">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          {articles.length} Articles • Refreshes Weekly • Next refresh available {canRefresh ? 'now' : `in ${24 - (cacheAge || 0)}h`}
        </div>
      )}
    </div>
  );
};

export default PlatformNews;