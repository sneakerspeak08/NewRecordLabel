import React, { useState, useEffect, useRef } from "react";
import MatrixBackground from "./MatrixBackground";
import { Link } from "react-router-dom";

const Preview = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const loadSoundCloudAPI = async () => {
      try {
        // Wait for iframe to be available
        const iframe = iframeRef.current;
        if (!iframe) return;
  
        // Load the SoundCloud Widget API
        const SC = await loadScript('https://w.soundcloud.com/player/api.js');
        
        // Initialize the widget
        const widget = SC.Widget(iframe);
        
        // Add event listeners
        widget.bind(SC.Widget.Events.PLAY, () => {
          console.log('Playing');
          setIsPlaying(true);
        });
        
        widget.bind(SC.Widget.Events.PAUSE, () => {
          console.log('Paused');
          setIsPlaying(false);
        });
      } catch (error) {
        console.error('Error loading SoundCloud API:', error);
      }
    };
  
    // Helper function to load script
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (window.SC) {
          resolve(window.SC);
          return;
        }
  
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(window.SC);
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };
  
    loadSoundCloudAPI();
  }, []);
  return (
    <div className="relative w-full h-screen bg-black overflow-y-auto">
      <MatrixBackground isPlaying={isPlaying} />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 text-center w-full px-4">
        <Link to="/">
          <h1 className="font-mono text-2xl sm:text-5xl neon-text cursor-pointer">
            Sutakku Records
          </h1>
        </Link>
      </div>

      <div className="absolute top-32 sm:top-1/3 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center text-center w-[90%] sm:w-3/4 p-4 space-y-6">
        <p className="text-green-400 font-mono text-sm sm:text-base mb-4">
          So I see you figured out the password... lucky you!! Here's a little preview of what's to come on Sutakku Records:
        </p>
        
        <div className="w-full max-w-xl">
        <iframe
          ref={iframeRef} // Add this line
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1784050971%3Fsecret_token%3Ds-LuSKWEXKvGP&color=%2300ff5d&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&enable_api=1"
          className="mb-4"
        ></iframe>
      </div>
        <div className="text-xs sm:text-sm text-[#cccccc] font-sans break-words w-full max-w-x1 mx-auto px-2 py-1">
          <a href="https://soundcloud.com/schwalbizzy" 
            title="[schwalbizzy]" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#cccccc] hover:text-green-400 transition-colors">
            [schwalbizzy]
          </a>
          · 
          <a href="https://soundcloud.com/schwalbizzy/dance-virus-deep-within-2/s-LuSKWEXKvGP" 
            title="Dance Virus - Deep Within" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#cccccc] hover:text-green-400 transition-colors">
            Dance Virus - Deep Within
          </a>
        </div>
      </div>
    </div>
  );
};

export default Preview;