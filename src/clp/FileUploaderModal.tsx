import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Download1, Close, Trash1, RefreshCircle1Clockwise, CheckCircle1 } from '@tailgrids/icons';
import { Modal } from '@/components/core/modal';
import { Button } from '@/components/core/button';

type UploadState = 'idle' | 'uploading' | 'completed' | 'error';

// Small CSV file glyph used in the file row
function CsvIcon() {
  return (
    <div
      className="relative flex size-10 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: 'var(--clp-file-icon-bg)' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--clp-file-icon)' }}>
        <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded px-1 text-[8px] font-bold leading-tight text-white"
        style={{ backgroundColor: 'var(--clp-file-icon)' }}
      >
        CSV
      </span>
    </div>
  );
}

export function FileUploaderModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, setState] = useState<UploadState>('idle');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [templateDownload, setTemplateDownload] = useState<'idle' | 'downloading' | 'done'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setState('idle');
    setProgress(0);
    setDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startUpload = useCallback(() => {
    setState('uploading');
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 16 + 6;
      if (p >= 100) {
        clearInterval(interval);
        setProgress(100);
        // Demo: mostly succeeds, occasionally surfaces the error path.
        setTimeout(() => setState(Math.random() > 0.35 ? 'completed' : 'error'), 450);
      } else {
        setProgress(Math.round(p));
      }
    }, 220);
  }, []);

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) startUpload();
  };

  const handleDownloadTemplate = () => {
    if (templateDownload !== 'idle') return;
    setTemplateDownload('downloading');

    setTimeout(() => {
      const headers = ['nombre', 'tipo de ID', 'ID', 'teléfono', 'email', 'sexo', 'ID externo'];
      const blob = new Blob([headers.join(',') + '\n'], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla_clientes.csv';
      link.click();
      URL.revokeObjectURL(url);

      setTemplateDownload('done');
      setTimeout(() => setTemplateDownload('idle'), 1500);
    }, 700);
  };

  const handleContinue = () => {
    reset();
    onSuccess();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      {/* Re-establish the CLP token scope inside the portal (Modal renders to body) */}
      <div className="clp-root overflow-hidden rounded-2xl bg-background-50 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <h3 className="text-lg font-semibold text-title-50">Carga tu archivo</h3>
          <button
            onClick={handleClose}
            className="text-text-200 transition-colors hover:text-title-50"
            aria-label="Cerrar"
          >
            <Close size={20} />
          </button>
        </div>

        <div className="px-6">
          {state === 'idle' && (
            <>
              {/* Drop zone */}
              <motion.div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.[0]) startUpload(); }}
                onClick={() => inputRef.current?.click()}
                animate={{ borderColor: dragging ? '#0894c8' : '#d9e2ec' }}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed px-6 py-8 text-center"
              >
                <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onFilePicked} />
                <UploadCloud size={28} className="mb-2 text-text-200" />
                <p className="text-sm font-medium text-title-50">Arrastra tu archivo aquí</p>
                <p className="text-sm text-text-100">o haz click para seleccionar</p>
                <p className="mt-0.5 text-xs text-text-200">Solo archivos .CSV, hasta 50MB</p>
                <Button
                  appearance="outline"
                  size="sm"
                  className="mt-4"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  Buscar archivo
                </Button>
              </motion.div>

              {/* Template download */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-base-100 bg-background-soft-50 px-4 py-3">
                <CsvIcon />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-title-50">Descarga la plantilla .CSV</p>
                  <p className="text-xs leading-relaxed text-text-100">
                    <span className="font-medium text-text-50">Campos obligatorios:</span> nombre, tipo de ID, ID,
                    teléfono, email, sexo (opcional), ID externo (ID en el sistema del cliente)
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={templateDownload !== 'idle'}
                  className="shrink-0 text-text-200 transition-colors hover:text-primary-500 disabled:hover:text-text-200"
                  aria-label="Descargar plantilla"
                >
                  {templateDownload === 'downloading' && (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-flex"
                    >
                      <RefreshCircle1Clockwise size={20} />
                    </motion.span>
                  )}
                  {templateDownload === 'done' && (
                    <CheckCircle1 size={20} style={{ color: 'var(--clp-status-success)' }} />
                  )}
                  {templateDownload === 'idle' && <Download1 size={20} />}
                </button>
              </div>
            </>
          )}

          {state !== 'idle' && (
            <div className="rounded-xl border border-base-100 bg-background-50 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <CsvIcon />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-title-50">clientes_load.csv</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-text-100">
                      {state === 'uploading' ? `${Math.round(250 * (progress / 100))} KB of 250 KB` : '250 KB of 250 KB'}
                    </span>
                    {state === 'completed' && (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--clp-status-success)' }}>
                        <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: 'var(--clp-status-success)' }} />
                        Completado
                      </span>
                    )}
                    {state === 'error' && (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--clp-status-error)' }}>
                        <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: 'var(--clp-status-error)' }} />
                        Errores encontrados
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="shrink-0 text-text-200 transition-colors hover:text-title-50"
                  aria-label="Quitar archivo"
                >
                  <Trash1 size={20} />
                </button>
              </div>

              {state === 'uploading' && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-soft-50">
                    <motion.div
                      className="h-full rounded-full bg-primary-500"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2, ease: 'linear' }}
                    />
                  </div>
                  <span className="text-xs text-text-100">{progress}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 pb-6 pt-5">
          <Button appearance="outline" className="flex-1" onClick={handleClose}>
            Cancelar
          </Button>

          {state === 'uploading' && (
            <Button className="flex-1" disabled>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-flex"
              >
                <RefreshCircle1Clockwise size={18} />
              </motion.span>
              Subiendo...
            </Button>
          )}
          {state === 'completed' && (
            <Button className="flex-1" onClick={handleContinue}>
              Continuar
            </Button>
          )}
          {state === 'error' && (
            <Button className="flex-1" onClick={handleClose}>
              Descargar errores
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
