import React from 'react';
import { X, RefreshCw } from 'lucide-react';

type Status = 'STANDALONE' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE';

interface ConnectionModalProps {
  open: boolean;
  onClose: () => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  status: Status;
  message: string;
  onUseStandalone: () => void;
  onTest: () => void;
}

const STATUS_LABEL: Record<Status, string> = {
  STANDALONE: 'Demo mode',
  CONNECTING: 'Connecting…',
  CONNECTED: 'Connected',
  OFFLINE: 'Offline, using demo data',
};

/** Developer setting: which backend the storefront talks to. Opened from the footer. */
export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  open, onClose, backendUrl, setBackendUrl, status, message, onUseStandalone, onTest,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="conn-title" onClick={(e) => e.stopPropagation()} className="bg-white rounded-[var(--radius-panel)] max-w-lg w-full p-7 sm:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="conn-title" className="font-display font-extrabold text-[24px]">Connection settings</h3>
            <p className="text-[15px] text-muted mt-1">The store works fully in demo mode. Point it at the backend to use live inventory.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-11 h-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-full hover:bg-paper cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label htmlFor="backend-url" className="field-label">Backend API URL</label>
          <input id="backend-url" type="text" value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} placeholder="http://localhost:4000" className="field font-mono !text-[14px]" />
        </div>

        <div className="rounded-2xl bg-paper p-4">
          <div className="flex items-center justify-between text-[14px]">
            <span className="text-muted">Status</span>
            <span className="font-display font-bold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? 'bg-mint' : status === 'CONNECTING' ? 'bg-good' : 'bg-[#a8a8a8]'}`} />
              {STATUS_LABEL[status]}
            </span>
          </div>
          <p className="text-[13px] text-muted mt-2 leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-between">
          <button type="button" onClick={onUseStandalone} className="btn btn-outline btn-sm">Use demo mode</button>
          <button type="button" onClick={onTest} className="btn btn-dark btn-sm">
            <RefreshCw aria-hidden="true" className={`w-4 h-4 ${status === 'CONNECTING' ? 'animate-spin' : ''}`} />
            Test connection
          </button>
        </div>
      </div>
    </div>
  );
};
