'use client';

import { Button } from '@/components/ui/button';
import { CheckSquare, Square, RefreshCw } from 'lucide-react';

interface SelectionButtonsProps {
  allIds: string[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function SelectionButtons({ 
  allIds, 
  selectedIds, 
  onSelectionChange 
}: SelectionButtonsProps) {
  const selectedCount = selectedIds.length;
  const totalCount = allIds.length;

  const handleSelectAll = () => {
    onSelectionChange([...allIds]);
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const handleInvert = () => {
    const inverted = allIds.filter(id => !selectedIds.includes(id));
    onSelectionChange(inverted);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectAll}
        disabled={selectedCount === totalCount}
      >
        <CheckSquare className="h-4 w-4 mr-1" />
        Tout
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectNone}
        disabled={selectedCount === 0}
      >
        <Square className="h-4 w-4 mr-1" />
        Aucun
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleInvert}
        disabled={totalCount === 0}
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Inverser
      </Button>

      {selectedCount > 0 && (
        <span className="text-sm text-muted-foreground ml-2">
          {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
