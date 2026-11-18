'use client';

import { useState, useRef } from 'react';

export default function MetaVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="mta-video-container" onClick={!isPlaying ? handlePlayClick : undefined}>
      <video
        ref={videoRef}
        src="/assets/videos/meta-hero.mp4"
        poster="/assets/images/meta-hero-poster.jpg"
        controls={isPlaying}
        playsInline
        preload="metadata"
        className="mta-video-element"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handlePause}
      >
        Your browser does not support the video tag.
      </video>

      {!isPlaying && (
        <div className="mta-play-overlay">
          <div className="mta-play-btn" aria-label="Play video">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#060608">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="mta-play-label">Watch video</span>
        </div>
      )}
    </div>
  );
}
