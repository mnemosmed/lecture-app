import { useState, useEffect } from "react";
import { hardcodedVideos, VideoItem } from "../data/videos";
import VideoPlayer from "../components/VideoPlayer";
import Sidebar from "../components/Sidebar";
import { Menu, X, Play } from "lucide-react";

interface CategoryGroup {
  category: string;
  videos: VideoItem[];
}

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("Neurology");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState<string>("lectures");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadHardcodedData();
  }, []);

  const loadHardcodedData = () => {
    console.log("Loading hardcoded video data...");

    // Use the hardcoded data directly
    const data = hardcodedVideos;

    setVideos(data);

    // Group videos by category
    const groups = data.reduce((acc: { [key: string]: VideoItem[] }, video) => {
      if (!acc[video.Category]) {
        acc[video.Category] = [];
      }
      acc[video.Category].push(video);
      return acc;
    }, {});

    const categoryGroups = Object.entries(groups).map(([category, videos]) => ({
      category,
      videos: videos.sort((a, b) => a.Subcategory - b.Subcategory),
    }));

    setCategoryGroups(categoryGroups);

    // Set first Neurology video as selected by default
    const neurologyGroup = categoryGroups.find(
      (group) => group.category === "Neurology"
    );
    if (neurologyGroup && neurologyGroup.videos.length > 0) {
      setSelectedVideo(neurologyGroup.videos[0]);
      setExpandedCategories(new Set(["Neurology"]));
    } else if (data.length > 0) {
      // Fallback to first video if no Neurology videos found
      setSelectedVideo(data[0]);
      setExpandedCategories(new Set([data[0].Category]));
    }

    console.log("Loaded", data.length, "videos");
    console.log(
      "Categories:",
      categoryGroups.map((g) => `${g.category} (${g.videos.length} videos)`)
    );

    setLoading(false);
  };

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryFilterChange = (category: string) => {
    setSelectedCategoryFilter(category);

    // Auto-select the first video in the filtered category
    const filteredGroup = categoryGroups.find(
      (group) => group.category === category
    );
    if (filteredGroup && filteredGroup.videos.length > 0) {
      setSelectedVideo(filteredGroup.videos[0]);
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
    if (tab !== "lectures") {
      setShowComingSoon(true);
    } else {
      setShowComingSoon(false);
    }
  };

  // Get filtered videos for mobile view
  const filteredCategoryGroups = categoryGroups.filter(
    (group) => group.category === selectedCategoryFilter
  );
  const allCategories = categoryGroups.map((group) => group.category);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0da6b8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar - Only show on desktop when in lectures tab */}
      {activeTab === "lectures" && (
        <div className="hidden lg:block">
          <Sidebar
            categoryGroups={categoryGroups}
            selectedVideo={selectedVideo}
            onVideoSelect={handleVideoSelect}
            expandedCategories={expandedCategories}
            onToggleCategory={toggleCategory}
            selectedCategoryFilter={selectedCategoryFilter}
            onCategoryFilterChange={handleCategoryFilterChange}
          />
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">MNEMOS</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => handleTabClick("lectures")}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-left ${
                  activeTab === "lectures"
                    ? "bg-[#0da6b8] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Lectures
              </button>
              <button
                onClick={() => handleTabClick("qbank")}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-left ${
                  activeTab === "qbank"
                    ? "bg-[#0da6b8] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                QBank
              </button>
              <button
                onClick={() => handleTabClick("ai-tools")}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-left ${
                  activeTab === "ai-tools"
                    ? "bg-[#0da6b8] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                AI Tools
              </button>
            </nav>
          </div>
        )}

        <div className="p-4 lg:p-6">
          {selectedVideo || activeTab !== "lectures" ? (
            <div className="max-w-4xl mx-auto">
              {/* Desktop Navigation Tabs */}
              <div className="hidden lg:block mb-6">
                <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <button
                    onClick={() => handleTabClick("lectures")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === "lectures"
                        ? "bg-[#0da6b8] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Lectures
                  </button>
                  <button
                    onClick={() => handleTabClick("qbank")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === "qbank"
                        ? "bg-[#0da6b8] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    QBank
                  </button>
                  <button
                    onClick={() => handleTabClick("ai-tools")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === "ai-tools"
                        ? "bg-[#0da6b8] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    AI Tools
                  </button>
                </nav>
              </div>

              {/* Coming Soon Message */}
              {showComingSoon && activeTab !== "lectures" && (
                <div className="mb-6 bg-gradient-to-r from-[#0da6b8]/10 to-[#0da6b8]/5 border border-[#0da6b8]/20 rounded-lg p-4 lg:p-6">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-[#0da6b8] mb-2">
                        {activeTab === "qbank" ? "QBank" : "AI Tools"} - Coming
                        Soon! 🚀
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        We're working hard to bring you this feature. Stay
                        tuned!
                      </p>
                      <p className="text-gray-500 text-xs">
                        Click on "Lectures" to return to the video player
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Player - Only show when lectures tab is active and not showing coming soon */}
              {activeTab === "lectures" && !showComingSoon && selectedVideo && (
                <>
                  <VideoPlayer
                    videoUrl={selectedVideo.URL}
                    title={selectedVideo.Title}
                  />
                  <div className="mt-4 lg:mt-6 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="bg-[#0da6b8]/20 text-[#0da6b8] px-3 py-1 rounded-full font-medium border border-[#0da6b8]/30">
                        {selectedVideo.Category}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Category Section - Below video player */}
                  <div className="lg:hidden mt-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      {/* Category Filter */}
                      <div className="p-4 border-b border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) =>
                            handleCategoryFilterChange(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da6b8] focus:border-[#0da6b8] text-sm"
                        >
                          {allCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Video List */}
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {filteredCategoryGroups.length > 0 && (
                          <div className="space-y-1">
                            {filteredCategoryGroups[0].videos.map(
                              (video, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleVideoSelect(video)}
                                  className={`w-full flex items-start p-3 text-left hover:bg-[#0da6b8]/10 rounded-lg transition-colors ${
                                    selectedVideo?.Title === video.Title
                                      ? "bg-[#0da6b8]/20 border-l-4 border-[#0da6b8]"
                                      : ""
                                  }`}
                                >
                                  <Play className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 line-clamp-2 leading-5">
                                      {video.Title}
                                    </p>
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        )}

                        {filteredCategoryGroups.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">
                              No videos found for the selected category.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-2">
                  Welcome to MNEMOS
                </h2>
                <p className="text-gray-500 text-sm lg:text-base">
                  Select a video from the sidebar to start learning
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
