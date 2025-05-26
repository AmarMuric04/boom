export interface YouTubeVideoInfo {
  videoId: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  embedUrl: string;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function getYouTubeVideoInfo(url: string): YouTubeVideoInfo | null {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return {
    videoId,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

export function getVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return match ? match[1] : null;
}

export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

export function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/.test(url);
}
