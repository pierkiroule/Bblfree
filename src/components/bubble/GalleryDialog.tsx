import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Download, Pencil, Check, X, Image as ImageIcon } from 'lucide-react';
import { GalleryItem } from '@/hooks/useGallery';

interface GalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GalleryItem[];
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export default function GalleryDialog({
  open,
  onOpenChange,
  items,
  onDelete,
  onRename,
}: GalleryDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const handleStartEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDownload = (item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = item.dataUrl;
    link.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.webp`;
    link.click();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Galerie
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aucune création sauvegardée</p>
            <p className="text-sm mt-1">Exporte une vidéo pour la retrouver ici</p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            {selectedItem ? (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ← Retour
                </Button>
                <div className="rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center p-4">
                  <video
                    src={selectedItem.dataUrl}
                    poster={selectedItem.thumbnail}
                    loop
                    autoPlay
                    muted
                    playsInline
                    controls
                    className="max-w-full max-h-[40vh] rounded bg-black"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{selectedItem.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedItem.date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(selectedItem)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        onDelete(selectedItem.id);
                        setSelectedItem(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="group relative rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <button
                      className="w-full aspect-square bg-muted/30 flex items-center justify-center"
                      onClick={() => setSelectedItem(item)}
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </button>
                    
                    <div className="p-2 space-y-1">
                      {editingId === item.id ? (
                        <div className="flex gap-1">
                          <Input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit(item.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSaveEdit(item.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <button
                            className="text-sm font-medium truncate hover:text-primary text-left flex-1"
                            onClick={() => handleStartEdit(item)}
                          >
                            {item.title}
                          </button>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleStartEdit(item)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive"
                              onClick={() => onDelete(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
