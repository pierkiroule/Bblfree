import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Save, Loader2, Check } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isExporting: boolean;
  progress: number;
  gifDataUrl: string | null;
  onExport: () => void;
  onSaveToGallery: () => void;
  onDownload: () => void;
  savedToGallery: boolean;
}

export default function ExportDialog({
  open,
  onOpenChange,
  isExporting,
  progress,
  gifDataUrl,
  onExport,
  onSaveToGallery,
  onDownload,
  savedToGallery,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter en GIF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!gifDataUrl && !isExporting && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Génère un GIF animé de ta boucle
              </p>
              <Button onClick={onExport} size="lg">
                <Download className="w-4 h-4 mr-2" />
                Générer le GIF
              </Button>
            </div>
          )}

          {isExporting && (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Génération en cours...</span>
              </div>
              <Progress value={progress * 100} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(progress * 100)}%
              </p>
            </div>
          )}

          {gifDataUrl && !isExporting && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center p-4">
                <img
                  src={gifDataUrl}
                  alt="Aperçu GIF"
                  className="max-w-full max-h-64 rounded"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onSaveToGallery}
                  variant={savedToGallery ? 'secondary' : 'default'}
                  className="flex-1"
                  disabled={savedToGallery}
                >
                  {savedToGallery ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Sauvegardé
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Sauver dans galerie
                    </>
                  )}
                </Button>
                <Button onClick={onDownload} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
