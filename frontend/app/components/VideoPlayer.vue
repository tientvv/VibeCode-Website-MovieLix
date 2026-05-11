<template>
  <div ref="playerContainer" class="video-player" :id="playerId"></div>
</template>

<script setup lang="ts">
import Hls from 'hls.js';
import type Artplayer from 'artplayer';

interface SubtitleTrack {
  url: string;
  label: string;
  language: string;
  default?: boolean;
}

const props = defineProps<{
  src: string;
  poster?: string;
  title?: string;
  subtitles?: SubtitleTrack[];
  isHls?: boolean;
  playerId?: string;
}>();

const playerContainer = ref<HTMLElement | null>(null);
let player: Artplayer | null = null;

onMounted(async () => {
  console.log('[VideoPlayer] Component mounted, checking container...', !!playerContainer.value);
  if (!playerContainer.value) return;

  const ArtplayerModule = await import('artplayer');
  const Artplayer = ArtplayerModule.default;

  const options: any = {
    container: playerContainer.value,
    url: props.src,
    poster: props.poster || '',
    title: props.title || '',
    volume: 0.7,
    autoplay: true,
    autoSize: false,
    autoMini: false,
    loop: false,
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    setting: true,
    hotkey: true,
    pip: true,
    fullscreen: true,
    fullscreenWeb: true,
    miniProgressBar: false,
    mutex: true,
    theme: '#F5C518',
    lang: 'en',
    subtitleOffset: true, // Dynamically calculates gap above control bar and black bars
    moreVideoAttr: {
      crossOrigin: 'anonymous',
      playsInline: true,
    },
  };

  // Add subtitles if provided
  if (props.subtitles?.length) {
    const defaultSub = props.subtitles.find((s) => s.default) ?? props.subtitles[0];
    if (defaultSub)
      options.subtitle = {
        url: defaultSub?.url,
        type: 'vtt',
        encoding: 'utf-8',
        escape: false,
      };

    // Subtitle switching in settings
    if (props.subtitles.length > 1) {
      options.settings = [
        {
          width: 200,
          html: 'Subtitle',
          selector: props.subtitles.map((sub, i) => ({
            html: sub.label,
            url: sub.url,
            default: sub.default || i === 0,
          })),
          onSelect(item: any) {
            player?.subtitle.switch(item.url);
            return item.html;
          },
        },
      ];
    }
  }

  // HLS support
  if (props.isHls) {
    options.customType = {
      m3u8: (videoEl: HTMLVideoElement, url: string) => {
        console.log('[VideoPlayer] Loading HLS source:', url);
        if (Hls.isSupported()) {
          const hls = new Hls({
            startPosition: 0,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            liveSyncDurationCount: 3,
            fragLoadingTimeOut: 30000,
            fragLoadingMaxRetry: 5,
            manifestLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 5,
          });
          hls.loadSource(url);
          hls.attachMedia(videoEl);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('[VideoPlayer] HLS Manifest parsed, attempting to play');
            videoEl.play().catch((err) => console.error('Play error after manifest:', err));
          });
          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            console.error('[HLS] Error:', data.type, data.details);
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                console.log('[HLS] Fatal network error encountered, trying to recover');
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                console.log('[HLS] Fatal media error encountered, trying to recover');
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
          // Store hls instance for cleanup
          (videoEl as any).__hls = hls;
        } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
          videoEl.src = url;
          videoEl.play().catch(() => {});
        }
      },
    };
    options.type = 'm3u8';
  }

  console.log('[VideoPlayer] Initializing Artplayer with options:', { url: options.url, type: options.type });
  try {
    player = new Artplayer(options);
    console.log('[VideoPlayer] Artplayer instance created');
  } catch (initErr) {
    console.error('[VideoPlayer] Failed to create Artplayer instance:', initErr);
    return;
  }

  player.on('ready', () => {
    console.log('[VideoPlayer] Ready, attempting play...');
    player?.play().catch(() => {});
  });

  player.on('error', (err: any) => {
    console.error('[VideoPlayer] Error:', err);
  });
});

// Watch for src changes (from polling — stream becomes ready after initial render)
watch(
  () => props.src,
  (newSrc) => {
    if (!player || !newSrc) return;
    console.log('[VideoPlayer] Src changed, switching to:', newSrc);
    player
      .switchUrl(newSrc)
      .then(() => {
        player?.play().catch(() => {});
      })
      .catch(() => {
        // If switchUrl fails, recreate player
        player?.destroy(false);
        player = null;
      });
  },
);

onUnmounted(() => {
  if (player) {
    const videoEl = player.video;
    if (videoEl && (videoEl as any).__hls) {
      (videoEl as any).__hls.destroy();
    }
    player.destroy(true);
    player = null;
  }
});
</script>

<style scoped>
/* Establish container for responsive queries inside player */
.video-player {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #000;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  container-type: size;
  container-name: videoplayer;
}

/* 
  Deep target the ArtPlayer subtitle layer. 
  cqmin = responds to the video player's size directly
*/
:deep(.art-subtitle) {
  pointer-events: none !important;
  color: #fff !important;
  font-family: 'Inter', sans-serif !important;
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 1),
    0 0 5px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(0, 0, 0, 0.5) !important;
  font-size: clamp(14px, 5cqmin, 46px) !important;
  line-height: 1.3 !important;
  background-color: transparent !important;
}
:deep(.art-subtitle *) {
  pointer-events: none !important;
}

.video-player--loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player__loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
