import React, { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) {
      return;
    }

    if (!videoId || !containerRef.current) return;

    initializedRef.current = true;

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      // If API is already loaded, initialize immediately
      initializePlayer();
    }

    function initializePlayer() {
      if (!containerRef.current || playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 1,
          autoplay: 0, // No autoplay
        },
        events: {
          onReady: (event: any) => {
            // Video is ready but won't autoplay
          },
        },
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="w-full h-80 sm:h-96 lg:h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
      <div className="relative w-full h-80 sm:h-96 lg:h-[600px]">
        {/* YouTube Player with API */}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Video Title */}
      <div className="p-3 lg:p-4 bg-white">
        <h2 className="text-base lg:text-lg font-semibold text-gray-800 line-clamp-2">
          {title}
        </h2>
      </div>
    </div>
  );
};

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default VideoPlayer;
