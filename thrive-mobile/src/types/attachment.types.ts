export interface AttachmentFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'file';
  mimeType: string;
  dataUri: string; // Base64 or Blob / URL string for viewing/downloading
  createdAt?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileTypeFromName(filename: string): 'pdf' | 'image' | 'doc' | 'file' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'doc';
  return 'file';
}
