import { useEffect, useCallback } from 'react';
import Button from './Button';

export const Modal = ({ isOpen, onClose, title, size = 'md', children, footer }) => {
  const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose?.(); }, [onClose]);
  useEffect(() => {
    if (isOpen) { document.addEventListener('keydown', handleKey); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${modalSizes[size] ?? modalSizes.md} bg-surface-850 border border-white/12 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] animate-slide-up overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <h3 className="text-base font-semibold text-white font-display">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-white/8 bg-white/2 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={<>
      <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={() => { onConfirm?.(); onClose?.(); }}>{confirmLabel}</Button>
    </>}
  >
    <p className="text-sm text-white/70 font-body">{message}</p>
  </Modal>
);

export const Toast = ({ id, type = 'info', message, onRemove }) => {
  const toastVariants = {
    success: { icon: '✓', cls: 'border-emerald-500/30 bg-emerald-500/10', icon_cls: 'text-emerald-400 bg-emerald-500/20' },
    error:   { icon: '✕', cls: 'border-red-500/30 bg-red-500/10',         icon_cls: 'text-red-400 bg-red-500/20'         },
    warning: { icon: '!', cls: 'border-amber-500/30 bg-amber-500/10',     icon_cls: 'text-amber-400 bg-amber-500/20'     },
    info:    { icon: 'i', cls: 'border-brand-400/30 bg-brand-400/10',     icon_cls: 'text-brand-400 bg-brand-400/20'     },
  };
  const v = toastVariants[type] ?? toastVariants.info;
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 3500);
    return () => clearTimeout(t);
  }, [id, onRemove]);
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-card-dark animate-slide-up ${v.cls}`}>
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 ${v.icon_cls}`}>{v.icon}</span>
      <p className="text-sm text-white/90 font-body">{message}</p>
      <button onClick={() => onRemove(id)} className="ml-auto text-white/30 hover:text-white/70 transition-colors text-xs">✕</button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 min-w-[300px] max-w-xs">
    {toasts.map(t => <Toast key={t.id} {...t} onRemove={removeToast} />)}
  </div>
);

export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-4xl mb-4 opacity-60">{icon}</div>
    <h3 className="text-base font-semibold text-white/70 font-display mb-1">{title}</h3>
    {description && <p className="text-sm text-white/40 font-body max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ProgressBar = ({ value = 0, max = 100, color = 'brand', showLabel = false, size = 'md' }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors  = { brand: 'from-brand-400 to-purple-400', teal: 'from-teal-400 to-emerald-400', danger: 'from-red-400 to-orange-400', warning: 'from-amber-400 to-yellow-300', success: 'from-emerald-400 to-teal-400' };
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-white/50 font-body">{value}/{max}</span>
          <span className="text-xs font-medium text-white/70 font-body">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-white/8 rounded-full overflow-hidden ${heights[size]}`}>
        <div className={`${heights[size]} rounded-full bg-gradient-to-r ${colors[color] ?? colors.brand} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default Modal;