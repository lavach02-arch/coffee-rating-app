import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <CheckCircle2 size={20} />;
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'warning':
        return 'toast-info';
      case 'error':
        return 'toast-error';
      default:
        return 'toast-info';
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${getToastClass(toast.type)}`}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            {getIcon(toast.type)}
          </div>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
