'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SampleBrowser.module.css';

// ── Types ──────────────────────────────────────────────────────────

interface DoughPack {
  name: string;
  url: string;
}

interface ParsedPack {
  base: string;
  sounds: Record<string, string[]>; // soundName -> array of playable URLs
}

// ── Constants ──────────────────────────────────────────────────────

const DOUGH_PACKS: DoughPack[] = [
  { name: 'Dirt-Samples', url: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/Dirt-Samples.json' },
  { name: 'Tidal Drum Machines', url: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json' },
  { name: 'Piano', url: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json' },
  { name: 'VCSL', url: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/vcsl.json' },
  { name: 'EmuSP12', url: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/EmuSP12.json' },
  { name: 'Mridangam', url: 'https://raw.githubusercontent.com/felixroos/dough-samples/main/mridangam.json' },
];

// ── Audio playback ─────────────────────────────────────────────────

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

async function playSample(url: string): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    const res = await fetch(url);
    const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    console.warn('[SampleBrowser] Failed to play:', url, e);
  }
}

// ── Parse dough-samples JSON ───────────────────────────────────────

function parseDoughManifest(json: Record<string, unknown>): ParsedPack {
  const base = (typeof json._base === 'string' ? json._base : '').replace(/\/$/, '');
  const sounds: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(json)) {
    if (key === '_base') continue;

    if (Array.isArray(value)) {
      // Array of relative paths (or absolute URLs)
      sounds[key] = value.map((v: unknown) => {
        if (typeof v !== 'string') return '';
        return v.startsWith('http') ? v : base ? `${base}/${v}` : v;
      }).filter(Boolean);
    } else if (typeof value === 'object' && value !== null) {
      // Object: keys or values may be URLs
      const entries = Object.values(value as Record<string, unknown>);
      sounds[key] = entries.map((v: unknown) => {
        if (typeof v !== 'string') return '';
        return v.startsWith('http') ? v : base ? `${base}/${v}` : v;
      }).filter(Boolean);
    }
  }

  return { base, sounds };
}

// ── Memoized sample item ───────────────────────────────────────────

interface SampleItemProps {
  name: string;
  url: string;
  isPlaying: boolean;
  onPlay: (url: string) => void;
}

const SampleItem = React.memo(function SampleItem({ name, url, isPlaying, onPlay }: SampleItemProps) {
  return (
    <div
      className={`${styles.sample} ${isPlaying ? styles.samplePlaying : ''}`}
      onClick={() => onPlay(url)}
      title={url}
    >
      {name}
    </div>
  );
});

// ── Folder component ───────────────────────────────────────────────

interface FolderItemProps {
  name: string;
  samples: { name: string; url: string }[];
  playingUrl: string | null;
  onPlay: (url: string) => void;
}

function FolderItem({ name, samples, playingUrl, onPlay }: FolderItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.folder}>
      <div className={styles.folderHeader} onClick={() => setExpanded((e) => !e)}>
        <span className={`${styles.arrow} ${expanded ? styles.arrowExpanded : ''}`}>&#9654;</span>
        <span>{name}</span>
        <span className={styles.count}>({samples.length})</span>
      </div>
      {expanded && samples.map((s) => (
        <SampleItem
          key={s.url}
          name={s.name}
          url={s.url}
          isPlaying={playingUrl === s.url}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}

// ── Dough pack group ───────────────────────────────────────────────

interface DoughPackGroupProps {
  pack: DoughPack;
  playingUrl: string | null;
  onPlay: (url: string) => void;
  manifestCache: React.MutableRefObject<Record<string, ParsedPack>>;
}

function DoughPackGroup({ pack, playingUrl, onPlay, manifestCache }: DoughPackGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedPack | null>(null);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      if (next && !parsed && !manifestCache.current[pack.url]) {
        setLoading(true);
        fetch(pack.url)
          .then((res) => res.json())
          .then((json) => {
            const result = parseDoughManifest(json as Record<string, unknown>);
            manifestCache.current[pack.url] = result;
            setParsed(result);
          })
          .catch((e) => console.warn('[SampleBrowser] Failed to load pack:', pack.name, e))
          .finally(() => setLoading(false));
      } else if (next && manifestCache.current[pack.url]) {
        setParsed(manifestCache.current[pack.url]);
      }
      return next;
    });
  }, [parsed, pack.url, pack.name, manifestCache]);

  const soundNames = parsed ? Object.keys(parsed.sounds).sort() : [];
  const totalSamples = parsed
    ? Object.values(parsed.sounds).reduce((sum, arr) => sum + arr.length, 0)
    : null;

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader} onClick={handleToggle}>
        <span className={`${styles.arrow} ${expanded ? styles.arrowExpanded : ''}`}>&#9654;</span>
        <span>{pack.name}</span>
        {totalSamples !== null && <span className={styles.count}>({totalSamples})</span>}
      </div>
      {expanded && loading && <div className={styles.loading}>Loading...</div>}
      {expanded && parsed && soundNames.map((soundName) => {
        const urls = parsed.sounds[soundName];
        const samples = urls.map((url) => {
          const parts = url.split('/');
          return { name: parts[parts.length - 1] || url, url };
        });
        return (
          <FolderItem
            key={soundName}
            name={soundName}
            samples={samples}
            playingUrl={playingUrl}
            onPlay={onPlay}
          />
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export default function SampleBrowser() {
  const [localIndex, setLocalIndex] = useState<Record<string, string[]> | null>(null);
  const [localExpanded, setLocalExpanded] = useState(false);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const manifestCache = useRef<Record<string, ParsedPack>>({});
  const playingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch local samples index on mount
  useEffect(() => {
    fetch('/samples/index.json')
      .then((res) => res.json())
      .then((data) => setLocalIndex(data as Record<string, string[]>))
      .catch((e) => console.warn('[SampleBrowser] Failed to load local index:', e));
  }, []);

  const handlePlay = useCallback((url: string) => {
    setPlayingUrl(url);
    if (playingTimer.current) clearTimeout(playingTimer.current);
    playingTimer.current = setTimeout(() => setPlayingUrl(null), 600);
    playSample(url);
  }, []);

  const localFolders = localIndex ? Object.keys(localIndex).sort() : [];
  const totalLocal = localIndex
    ? Object.values(localIndex).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <div className={styles.container}>
      {/* Local samples */}
      <div className={styles.group}>
        <div className={styles.groupHeader} onClick={() => setLocalExpanded((e) => !e)}>
          <span className={`${styles.arrow} ${localExpanded ? styles.arrowExpanded : ''}`}>&#9654;</span>
          <span>Local Samples</span>
          {localIndex && <span className={styles.count}>({totalLocal})</span>}
        </div>
        {localExpanded && !localIndex && <div className={styles.loading}>Loading...</div>}
        {localExpanded && localIndex && localFolders.map((folder) => {
          const files = localIndex[folder];
          const samples = files.map((relativePath) => {
            const parts = relativePath.split('/');
            return {
              name: parts[parts.length - 1] || relativePath,
              url: `/samples/${relativePath}`,
            };
          });
          return (
            <FolderItem
              key={folder}
              name={folder}
              samples={samples}
              playingUrl={playingUrl}
              onPlay={handlePlay}
            />
          );
        })}
      </div>

      {/* Dough-samples packs */}
      {DOUGH_PACKS.map((pack) => (
        <DoughPackGroup
          key={pack.url}
          pack={pack}
          playingUrl={playingUrl}
          onPlay={handlePlay}
          manifestCache={manifestCache}
        />
      ))}
    </div>
  );
}
