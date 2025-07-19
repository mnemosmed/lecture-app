import React from "react";
import { Play } from "lucide-react";
import { VideoItem, CategoryGroup } from "../types";

interface SidebarProps {
  categoryGroups: CategoryGroup[];
  selectedVideo: VideoItem | null;
  onVideoSelect: (video: VideoItem) => void;
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  selectedCategoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categoryGroups,
  selectedVideo,
  onVideoSelect,
  selectedCategoryFilter,
  onCategoryFilterChange,
}) => {
  // Filter categories based on selected filter
  const filteredCategoryGroups = categoryGroups.filter(
    (group) => group.category === selectedCategoryFilter
  );

  // Get all unique categories for the dropdown (removed "All Categories")
  const allCategories = categoryGroups.map((group) => group.category);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800 mb-4">MNEMOS</h1>

        {/* Category Filter Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0da6b8] focus:border-[#0da6b8] text-sm"
          >
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Show videos directly (no collapsible header since we removed "All Categories") */}
        {filteredCategoryGroups.length > 0 && (
          <div className="space-y-1">
            {filteredCategoryGroups[0].videos.map((video, index) => (
              <button
                key={index}
                onClick={() => onVideoSelect(video)}
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
            ))}
          </div>
        )}

        {filteredCategoryGroups.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No videos found for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
