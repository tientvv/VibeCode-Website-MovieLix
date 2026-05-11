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
  episodes?: any[];
  currentEpisode?: any;
  isTvSeries?: boolean;
}>();

const emit = defineEmits(['episode-change']);

const playerContainer = ref<HTMLElement | null>(null);
let player: Artplayer | null = null;

onMounted(async () => {

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
    theme: '#3b82f6',
    lang: 'en',
    subtitleOffset: true,
    fastForward: false, // Disables sliding left/right to seek on mobile
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
            videoEl.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {

            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {

                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {

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

  // --- Episode Selector Feature ---
  if (props.isTvSeries && props.episodes?.length) {
    const seasons = new Map<number, any[]>();
    for (const ep of props.episodes) {
      if (!seasons.has(ep.season)) seasons.set(ep.season, []);
      seasons.get(ep.season)!.push(ep);
    }

    const seasonNums = Array.from(seasons.keys()).sort((a, b) => a - b);
    
    let episodesHtml = '';
    for (const s of seasonNums) {
      episodesHtml += `<div class="art-ep-season-title">Season ${s}</div>`;
      const eps = seasons.get(s)!.sort((a, b) => a.episode - b.episode);
      for (const ep of eps) {
        const isActive = props.currentEpisode?.id === ep.id;
        episodesHtml += `
          <button class="art-episode-item ${isActive ? 'is-active' : ''}" data-ep-id="${ep.id}">
            <span class="art-ep-num">${ep.episode}</span>
            <div class="art-ep-info">
              <span class="art-ep-name">${ep.title || `Episode ${ep.episode}`}</span>
              ${isActive ? '<span class="art-ep-playing">Playing</span>' : ''}
            </div>
          </button>
        `;
      }
    }

    const layerHtml = `
      <div class="art-episodes-panel" style="display: none;">
        <div class="art-episodes-header">
          <span>Episodes</span>
          <button class="art-ep-close">×</button>
        </div>
        <div class="art-episodes-body">
          ${episodesHtml}
        </div>
      </div>
    `;

    options.layers = [
      ...(options.layers || []),
      {
        name: 'episodesPanel',
        html: layerHtml,
        click: function (layer: HTMLElement, e: Event) {
          const target = e.target as HTMLElement;
          
          const epEl = target.closest('.art-episode-item');
          if (epEl) {
            const epIdStr = epEl.getAttribute('data-ep-id');
            if (epIdStr) {
              const epId = parseInt(epIdStr, 10);
              const selectedEp = props.episodes?.find((ep: any) => ep.id === epId);
              if (selectedEp && selectedEp.id !== props.currentEpisode?.id) {
                emit('episode-change', selectedEp);
                const panel = player?.template.$player.querySelector('.art-episodes-panel') as HTMLElement;
                if (panel) panel.style.display = 'none';
              }
            }
            return;
          }

          const closeBtn = target.closest('.art-ep-close');
          if (closeBtn) {
            const panel = player?.template.$player.querySelector('.art-episodes-panel') as HTMLElement;
            if (panel) panel.style.display = 'none';
          }
        }
      }
    ];

    options.controls = [
      ...(options.controls || []),
      {
        position: 'right',
        html: '<span class="art-control-btn">Episodes</span>',
        tooltip: 'Episodes',
        click: function () {
          const panel = player?.template.$player.querySelector('.art-episodes-panel') as HTMLElement;
          if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
          }
        },
      }
    ];
  }


  try {
    player = new Artplayer(options);

  } catch (initErr) {

    return;
  }

  player.on('ready', () => {

    player?.play().catch(() => {});
  });

  player.on('error', (err: any) => {

  });

  player.on('error', (err: any) => {

  });
});

// Watch for src changes (from polling — stream becomes ready after initial render)
watch(
  () => props.src,
  (newSrc) => {
    if (!player || !newSrc) return;

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

// Watch for episode change to update active state in UI
watch(
  () => props.currentEpisode,
  (newEp) => {
    if (!player || !newEp) return;
    const { $player } = player.template;
    const items = $player.querySelectorAll('.art-episode-item');
    items.forEach(el => {
      if (el.getAttribute('data-ep-id') === newEp.id.toString()) {
        el.classList.add('is-active');
        const info = el.querySelector('.art-ep-info');
        if (info && !info.querySelector('.art-ep-playing')) {
          info.insertAdjacentHTML('beforeend', '<span class="art-ep-playing">Playing</span>');
        }
      } else {
        el.classList.remove('is-active');
        const playingStr = el.querySelector('.art-ep-playing');
        if (playingStr) playingStr.remove();
      }
    });
  }
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

/* Custom Episode Selector Styles */
:deep(.art-control-btn) {
  padding: 0 10px;
  font-family: var(--font-body);
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.art-episodes-panel) {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 50px; /* Above control bar */
  width: 320px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.art-episodes-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

:deep(.art-ep-close) {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

:deep(.art-ep-close:hover) {
  color: #fff;
}

:deep(.art-episodes-body) {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

:deep(.art-ep-season-title) {
  padding: 8px 20px;
  font-size: 14px;
  color: rgba(59, 130, 246, 1);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.art-episode-item) {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  gap: 16px;
}

:deep(.art-episode-item:hover) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

:deep(.art-episode-item.is-active) {
  background: rgba(59, 130, 246, 0.1);
  color: rgba(59, 130, 246, 1);
  border-left: 3px solid rgba(59, 130, 246, 1);
}

:deep(.art-ep-num) {
  font-size: 18px;
  font-weight: 600;
  min-width: 24px;
}

:deep(.art-ep-info) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.art-ep-name) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.art-ep-playing) {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 600px) {
  :deep(.art-episodes-panel) {
    width: 100%;
    border-left: none;
  }
}
</style>
