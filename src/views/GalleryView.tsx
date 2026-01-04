import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGallery } from '@/hooks/useGallery';
import { Trash2, Edit2, Download, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function GalleryView() {
  const { items, isLoading, deleteItem, renameItem, storageInfo } = useGallery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = async (id: string) => {
    if (editTitle.trim()) {
      await renameItem(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDownload = (item: { dataUrl: string; title: string }) => {
    const link = document.createElement('a');
    link.href = item.dataUrl;
    link.download = `${item.title}.gif`;
    link.click();
  };

  const storagePercent = storageInfo 
    ? Math.round((storageInfo.used / storageInfo.quota) * 100) 
    : 0;

  return (
    <section className="flex-1 flex flex-col items-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="badge mb-3">Galerie constellation</span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">
            Vos créations
          </h1>
          <p className="text-muted-foreground max-w-md">
            {items.length > 0 
              ? `${items.length} boucle${items.length > 1 ? 's' : ''} créative${items.length > 1 ? 's' : ''} sauvegardée${items.length > 1 ? 's' : ''}`
              : 'Votre galerie est vide pour le moment'
            }
          </p>
          
          {/* Storage indicator */}
          {storageInfo && (
            <div className="mt-4 w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Stockage utilisé</span>
                <span>{formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${storagePercent > 80 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(storagePercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-12 px-6 glass-panel rounded-3xl"
          >
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Aucune création pour l'instant
            </h2>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Créez votre première boucle animée dans l'atelier et sauvegardez-la ici !
            </p>
            <Link to="/atelier">
              <Button className="rounded-2xl font-bold">
                Ouvrir l'atelier
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Gallery Grid */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative group"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden glass-panel shadow-soft hover:shadow-elevated transition-all cursor-pointer">
                    {/* Show GIF on hover, thumbnail otherwise */}
                    <img
                      src={hoveredId === item.id ? item.dataUrl : item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Play indicator */}
                    {hoveredId !== item.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-10 h-10 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Item info */}
                  <div className="mt-2 px-1">
                    {editingId === item.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(item.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={() => handleStartEdit(item.id, item.title)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </section>
  );
}
