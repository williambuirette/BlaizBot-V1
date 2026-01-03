// Composant ResourceItem

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ExternalLink, Download, Youtube } from 'lucide-react';
import type { Resource } from '../resource-dialog';
import { resourceTypeConfig } from './types';

interface ResourceItemProps {
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
}

export function ResourceItem({ resource, onEdit, onDelete }: ResourceItemProps) {
  const config = resourceTypeConfig[resource.type];
  const Icon = config.icon;

  // Extract YouTube video ID for thumbnail
  const getYouTubeThumbnail = (url: string | null) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const youtubeThumb =
    resource.type === 'YOUTUBE' ? getYouTubeThumbnail(resource.url) : null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 group">
      {/* Thumbnail for YouTube */}
      {youtubeThumb ? (
        <div className="relative w-24 h-14 rounded overflow-hidden shrink-0">
          <img
            src={youtubeThumb}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Youtube className="h-6 w-6 text-white" />
          </div>
        </div>
      ) : (
        <div className={`p-2 rounded ${config.color} shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{resource.title}</span>
          <Badge className={`text-xs ${config.color}`} variant="secondary">
            {resource.type}
          </Badge>
        </div>
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {resource.description}
          </p>
        )}
        {/* Link preview */}
        {(resource.url || resource.fileUrl) && (
          <a
            href={resource.url || resource.fileUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
          >
            {resource.type === 'PDF' || resource.type === 'IMAGE' ? (
              <>
                <Download className="h-3 w-3" />
                Télécharger
              </>
            ) : (
              <>
                <ExternalLink className="h-3 w-3" />
                {resource.url?.slice(0, 40)}
                {(resource.url?.length || 0) > 40 ? '...' : ''}
              </>
            )}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
