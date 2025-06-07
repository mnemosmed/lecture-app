import React, { useState, useRef, useEffect } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  useEffect(() => {
    if (!videoId) return;

    // Clean up previous player
    if (player) {
      player.destroy();
    }

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      if (playerRef.current) {
        const newPlayer = new window.YT.Player(playerRef.current, {
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
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
            },
          },
        });
      }
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="w-full h-48 sm:h-64 lg:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
      <div className="relative w-full h-48 sm:h-64 lg:h-96">
        {/* YouTube Player */}
        <div ref={playerRef} className="w-full h-full" />
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
