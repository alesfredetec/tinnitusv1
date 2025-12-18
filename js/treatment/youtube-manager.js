/**
 * YouTube Manager
 * Singleton for managing YouTube IFrame API integration
 * Handles video playback, volume control, and audio extraction for Web Audio API
 */

const YouTubeManager = (() => {
  // Private state
  let player = null;
  let isAPILoaded = false;
  let isPlayerReady = false;
  let currentVideoId = null;

  // Promise resolvers for async operations
  let apiLoadResolve = null;
  let playerReadyResolve = null;

  /**
   * Load YouTube IFrame API script
   * @returns {Promise<boolean>} Resolves when API is loaded
   */
  function loadAPI() {
    if (isAPILoaded) {
      Logger.info('youtube', 'API already loaded');
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      apiLoadResolve = resolve;

      // Check if script already exists
      if (window.YT && window.YT.Player) {
        isAPILoaded = true;
        Logger.info('youtube', 'YouTube API already present');
        resolve(true);
        return;
      }

      // Create script tag
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => {
        Logger.error('youtube', 'Failed to load YouTube IFrame API');
        resolve(false);
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      Logger.info('youtube', 'Loading YouTube IFrame API...');
    });
  }

  /**
   * Global callback required by YouTube IFrame API
   * Called when API is ready
   */
  window.onYouTubeIframeAPIReady = () => {
    isAPILoaded = true;
    Logger.info('youtube', 'YouTube IFrame API ready');
    if (apiLoadResolve) {
      apiLoadResolve(true);
      apiLoadResolve = null;
    }
  };

  /**
   * Initialize YouTube Player
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<boolean>} Resolves when player is ready
   */
  async function initPlayer(videoId) {
    if (!isAPILoaded) {
      const loaded = await loadAPI();
      if (!loaded) {
        throw new Error('YouTube API failed to load');
      }
    }

    // Wait for YT object to be available
    let retries = 0;
    while (!window.YT || !window.YT.Player) {
      if (retries++ > 50) {
        throw new Error('YouTube API timeout');
      }
      await sleep(100);
    }

    return new Promise((resolve, reject) => {
      playerReadyResolve = resolve;

      try {
        // Destroy existing player if present
        if (player) {
          try {
            player.destroy();
          } catch (e) {
            Logger.warn('youtube', 'Error destroying previous player:', e);
          }
        }

        // Create new player (minimal size but not 0x0)
        player = new YT.Player('youtube-player', {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 1,  // Changed to 1 to auto-play
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
          }
        });

        currentVideoId = videoId;
        Logger.info('youtube', `Player initialized with video: ${videoId}`);

      } catch (error) {
        Logger.error('youtube', 'Error creating player:', error);
        reject(error);
      }
    });
  }

  /**
   * Callback when player is ready
   */
  function onPlayerReady(event) {
    isPlayerReady = true;

    // CRITICAL: Unmute player and set volume (browsers mute by default)
    try {
      player.unMute();
      player.setVolume(80); // Set to 80% initially
      Logger.info('youtube', 'Player ready, unmuted, volume set to 80%');
    } catch (e) {
      Logger.warn('youtube', 'Error unmuting player:', e);
    }

    if (playerReadyResolve) {
      playerReadyResolve(true);
      playerReadyResolve = null;
    }
  }

  /**
   * Callback when player state changes
   */
  function onPlayerStateChange(event) {
    const states = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'cued'
    };

    const state = states[event.data] || 'unknown';
    Logger.info('youtube', `Player state: ${state}`);

    // Loop video when it ends
    if (event.data === YT.PlayerState.ENDED) {
      Logger.info('youtube', 'Video ended, looping...');
      try {
        player.seekTo(0);
        player.playVideo();
      } catch (error) {
        Logger.error('youtube', 'Error looping video:', error);
      }
    }

    // Warn if paused unexpectedly
    if (event.data === YT.PlayerState.PAUSED) {
      Logger.warn('youtube', 'Video paused unexpectedly');
    }
  }

  /**
   * Callback when player encounters error
   */
  function onPlayerError(event) {
    const errors = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not embeddable',
      150: 'Video not embeddable'
    };

    const errorMsg = errors[event.data] || `Unknown error (${event.data})`;
    Logger.error('youtube', `Player error: ${errorMsg}`);

    // Reject player ready promise if error during init
    if (playerReadyResolve) {
      playerReadyResolve(false);
      playerReadyResolve = null;
    }
  }

  /**
   * Play video
   */
  function play() {
    if (!player || !isPlayerReady) {
      Logger.warn('youtube', 'Player not ready');
      return Promise.resolve(false);
    }

    try {
      player.playVideo();
      Logger.info('youtube', 'Playing video');
      return Promise.resolve(true);
    } catch (error) {
      Logger.error('youtube', 'Error playing video:', error);
      return Promise.resolve(false);
    }
  }

  /**
   * Pause video
   */
  function pause() {
    if (!player || !isPlayerReady) {
      Logger.warn('youtube', 'Player not ready');
      return;
    }

    try {
      player.pauseVideo();
      Logger.info('youtube', 'Video paused');
    } catch (error) {
      Logger.error('youtube', 'Error pausing video:', error);
    }
  }

  /**
   * Stop video and reset
   */
  function stop() {
    if (!player || !isPlayerReady) {
      return;
    }

    try {
      player.stopVideo();
      Logger.info('youtube', 'Video stopped');
    } catch (error) {
      Logger.error('youtube', 'Error stopping video:', error);
    }
  }

  /**
   * Change to different video
   * @param {string} videoId - New video ID
   * @returns {Promise<boolean>} Resolves when new video is loaded
   */
  async function changeVideo(videoId) {
    if (!player || !isPlayerReady) {
      Logger.warn('youtube', 'Player not ready for video change');
      return false;
    }

    try {
      // Use cueVideoById for smoother transition
      player.loadVideoById(videoId);
      currentVideoId = videoId;

      // Wait a bit for video to load
      await sleep(500);

      Logger.info('youtube', `Changed to video: ${videoId}`);
      return true;
    } catch (error) {
      Logger.error('youtube', 'Error changing video:', error);
      return false;
    }
  }

  /**
   * Get audio element for Web Audio API
   * WARNING: May fail due to CORS restrictions
   * @returns {HTMLElement|null} Video element or null if unavailable
   */
  function getAudioElement() {
    if (!player || !isPlayerReady) {
      Logger.warn('youtube', 'Player not ready');
      return null;
    }

    try {
      // Try to get iframe
      const iframe = player.getIframe();
      if (!iframe) {
        Logger.warn('youtube', 'Iframe not found');
        return null;
      }

      // Try to access video element inside iframe (will fail with CORS)
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const videoElement = iframeDoc.querySelector('video');

        if (videoElement) {
          Logger.info('youtube', 'Video element found (CORS allowed)');
          return videoElement;
        }
      } catch (corsError) {
        Logger.warn('youtube', 'CORS blocked access to video element (expected)');
      }

      // Fallback: return iframe itself (won't work with createMediaElementSource)
      Logger.warn('youtube', 'Returning iframe (Web Audio routing will fail)');
      return iframe;

    } catch (error) {
      Logger.error('youtube', 'Error getting audio element:', error);
      return null;
    }
  }

  /**
   * Set YouTube player volume (0-100)
   * Fallback when Web Audio routing fails
   * @param {number} volume - Volume 0-100
   */
  function setVolume(volume) {
    if (!player || !isPlayerReady) {
      return;
    }

    try {
      // Always unmute before setting volume
      if (player.isMuted()) {
        player.unMute();
        Logger.info('youtube', 'Player was muted, unmuting...');
      }

      const clampedVolume = Math.max(0, Math.min(100, volume));
      player.setVolume(clampedVolume);
      Logger.info('youtube', `Volume set to ${clampedVolume}%`);
    } catch (error) {
      Logger.error('youtube', 'Error setting volume:', error);
    }
  }

  /**
   * Get current player state
   * @returns {number} Player state (-1 to 5)
   */
  function getPlayerState() {
    if (!player || !isPlayerReady) {
      return -1;
    }

    try {
      return player.getPlayerState();
    } catch (error) {
      Logger.error('youtube', 'Error getting player state:', error);
      return -1;
    }
  }

  /**
   * Check if API is ready
   * @returns {boolean}
   */
  function isReady() {
    return isAPILoaded && isPlayerReady && player !== null;
  }

  /**
   * Destroy player and cleanup
   */
  function destroy() {
    if (player) {
      try {
        player.destroy();
        Logger.info('youtube', 'Player destroyed');
      } catch (error) {
        Logger.error('youtube', 'Error destroying player:', error);
      }
    }

    player = null;
    isPlayerReady = false;
    currentVideoId = null;
  }

  /**
   * Helper: Sleep utility
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current video ID
   * @returns {string|null}
   */
  function getCurrentVideoId() {
    return currentVideoId;
  }

  // Public API
  return {
    loadAPI,
    initPlayer,
    play,
    pause,
    stop,
    changeVideo,
    getAudioElement,
    setVolume,
    getPlayerState,
    isReady,
    destroy,
    getCurrentVideoId
  };
})();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  YouTubeManager.destroy();
});
