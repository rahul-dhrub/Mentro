// Base64 encoded simple video placeholder (gray background with play icon)
export const VIDEO_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHBhdGggZD0iTTE2MCAxMDBMMjYwIDE1MEwxNjAgMjAwWiIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';

// Add other media-related constants here
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_VIDEO_DURATION = 10 * 60; // 10 minutes in seconds 