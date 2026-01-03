// Bulle de message individuelle

'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from './types';
import { getFileIcon, formatFileSize } from './utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDownloadFile: (messageId: string, filename: string) => void;
}

export function MessageBubble({ message, isOwn, onDownloadFile }: MessageBubbleProps) {
  const isTeacher = message.senderRole === 'TEACHER';

  return (
    <div className={cn('flex gap-3', isOwn && 'justify-end')}>
      {!isOwn && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium">{message.senderName}</p>
            {isTeacher && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                Prof
              </Badge>
            )}
          </div>
        )}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        
        {/* Pièces jointes */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((file, idx) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 flex items-center gap-2 w-fit"
                  onClick={() => onDownloadFile(message.id, file.name)}
                >
                  <FileIcon className="h-3 w-3" />
                  <span className="text-xs">{file.name}</span>
                  <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
                </Badge>
              );
            })}
          </div>
        )}
        
        <p
          className={cn(
            'text-xs mt-1',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>
    </div>
  );
}
