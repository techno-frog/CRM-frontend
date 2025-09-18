import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  HelpCircle,
  Sparkles,
  X,
} from 'lucide-react';
import styles from './NotifyProvider.module.css';

type NotificationVariant = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'neutral';

interface BaseNotifyPayload {
  title?: string;
  text?: string;
  component?: React.ReactNode;
  displayTime?: number;
  dontClose?: boolean;
  className?: string;
}

type NotifyInput = string | BaseNotifyPayload;

interface ConfirmPayload extends BaseNotifyPayload {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface CustomPayload extends BaseNotifyPayload {
  tone?: NotificationVariant;
  icon?: React.ReactNode;
  className?: string;
}

interface ToastAction {
  id: string;
  label: string;
  intent: 'primary' | 'ghost';
  handler: () => void;
}

interface ShowExtras {
  actions?: ToastAction[];
  icon?: React.ReactNode;
  displayTime?: number;
  dontClose?: boolean;
  className?: string;
  onClose?: () => void;
}

interface ToastInstance extends BaseNotifyPayload {
  id: string;
  type: NotificationVariant;
  icon?: React.ReactNode;
  createdAt: number;
  displayTime: number;
  dontClose: boolean;
  state: 'enter' | 'leaving';
  actions?: ToastAction[];
  className?: string;
  onClose?: () => void;
}

export interface NotifyHandle {
  id: string;
  close: () => void;
}

interface NotifyContextValue {
  info: (payload: NotifyInput) => NotifyHandle;
  success: (payload: NotifyInput) => NotifyHandle;
  warning: (payload: NotifyInput) => NotifyHandle;
  error: (payload: NotifyInput) => NotifyHandle;
  confirm: (payload: NotifyInput | ConfirmPayload) => Promise<boolean>;
  custom: (payload: CustomPayload) => NotifyHandle;
}

const NotifyContext = createContext<NotifyContextValue | null>(null);

const DEFAULT_TIMEOUT = 4200;
const TYPE_TIMEOUT: Record<NotificationVariant, number> = {
  info: 4200,
  success: 3600,
  warning: 5200,
  error: 6200,
  confirm: 0,
  neutral: 4500,
};

const ICONS: Record<NotificationVariant, React.ReactNode> = {
  info: <Info size={20} />,
  success: <CheckCircle2 size={20} />,
  warning: <AlertTriangle size={20} />,
  error: <OctagonAlert size={20} />,
  confirm: <HelpCircle size={20} />,
  neutral: <Sparkles size={20} />,
};

const createId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

export const NotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);
  const timeoutsRef = useRef(new Map<string, number>());
  const leavingRef = useRef(new Map<string, number>());
  const [portalNode] = useState(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.setAttribute('data-notify-root', '');
    return el;
  });

  useEffect(() => {
    if (!portalNode || typeof document === 'undefined') return;
    document.body.appendChild(portalNode);
    return () => {
      portalNode.remove();
    };
  }, [portalNode]);

  const finalizeRemoval = useCallback((id: string) => {
    setToasts(prev => prev.filter(item => item.id !== id));
    leavingRef.current.delete(id);
  }, []);

  const dismiss = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    if (leavingRef.current.has(id)) return;

    setToasts(prev => {
      const target = prev.find(item => item.id === id);
      if (!target || target.state === 'leaving') return prev;
      target.onClose?.();
      return prev.map(item => (item.id === id ? { ...item, state: 'leaving' } : item));
    });
    const removalTimer = window.setTimeout(() => finalizeRemoval(id), 240);
    leavingRef.current.set(id, removalTimer);
  }, [finalizeRemoval]);

  const normalizeInput = useCallback((payload: NotifyInput): BaseNotifyPayload => (
    typeof payload === 'string'
      ? { text: payload }
      : payload ?? {}
  ), []);

  const baseShow = useCallback(
    (type: NotificationVariant, payload: NotifyInput | BaseNotifyPayload, extras?: ShowExtras): NotifyHandle => {
      const normalized = normalizeInput(payload as NotifyInput);
      const id = createId();
      const displayTimeFromType = TYPE_TIMEOUT[type] ?? DEFAULT_TIMEOUT;
      const displayTime = normalized.displayTime ?? extras?.displayTime ?? displayTimeFromType;
      const dontClose = normalized.dontClose ?? extras?.dontClose ?? type === 'confirm';

      const toast: ToastInstance = {
        id,
        type,
        title: normalized.title,
        text: normalized.text,
        component: normalized.component,
        displayTime,
        dontClose,
        icon: extras?.icon ?? (ICONS[type]),
        createdAt: Date.now(),
        state: 'enter',
        actions: extras?.actions,
        className: extras?.className ?? normalized.className,
        onClose: extras?.onClose,
      } as ToastInstance;

      setToasts(prev => [...prev, toast]);

      if (!toast.dontClose && toast.displayTime > 0) {
        const timer = window.setTimeout(() => dismiss(id), toast.displayTime);
        timeoutsRef.current.set(id, timer);
      }

      return {
        id,
        close: () => dismiss(id),
      };
    },
    [dismiss, normalizeInput],
  );

  const showTyped = useCallback((type: NotificationVariant, input: NotifyInput) => baseShow(type, input), [baseShow]);

  const confirm = useCallback((input: NotifyInput | ConfirmPayload) => {
    const normalized: ConfirmPayload = typeof input === 'string' ? { text: input } : input ?? {};
    return new Promise<boolean>((resolve) => {
      let settled = false;
      let handleRef: NotifyHandle | null = null;

      const resolveWith = (accepted: boolean) => {
        if (settled) return;
        settled = true;
        handleRef?.close();
        if (accepted) {
          normalized.onConfirm?.();
        } else {
          normalized.onCancel?.();
        }
        resolve(accepted);
      };

      const actions: ToastAction[] = [
        {
          id: 'confirm',
          label: normalized.confirmLabel ?? 'Подтвердить',
          intent: 'primary',
          handler: () => resolveWith(true),
        },
        {
          id: 'cancel',
          label: normalized.cancelLabel ?? 'Отмена',
          intent: 'ghost',
          handler: () => resolveWith(false),
        },
      ];

      handleRef = baseShow('confirm', normalized, {
        dontClose: true,
        actions,
        displayTime: normalized.displayTime ?? 0,
        icon: ICONS.confirm,
        onClose: () => {
          if (!settled) {
            settled = true;
            normalized.onCancel?.();
            resolve(false);
          }
        },
      });
    });
  }, [baseShow]);

  const custom = useCallback((input: CustomPayload) => {
    const tone: NotificationVariant = input.tone ?? 'neutral';
    return baseShow(tone, input, {
      icon: input.icon ?? ICONS[tone],
      className: input.className,
    });
  }, [baseShow]);

  const ctxValue = useMemo<NotifyContextValue>(() => ({
    info: (payload) => showTyped('info', payload),
    success: (payload) => showTyped('success', payload),
    warning: (payload) => showTyped('warning', payload),
    error: (payload) => showTyped('error', payload),
    confirm,
    custom,
  }), [confirm, custom, showTyped]);

  useEffect(() => () => {
    timeoutsRef.current.forEach(clearTimeout);
    leavingRef.current.forEach(clearTimeout);
  }, []);

  const renderTextBlock = (toast: ToastInstance): React.ReactNode => {
    if (toast.component) return toast.component;
    if (toast.text) return toast.text;
    return null;
  };

  return (
    <NotifyContext.Provider value={ctxValue}>
      {children}
      {portalNode && createPortal(
        <div className={styles.wrapper}>
          {toasts.map((toast) => {
            const textBlock = renderTextBlock(toast);
            const title = toast.title;
            const isLeaving = toast.state === 'leaving';
            const toastClassName = [
              styles.toast,
              styles[toast.type],
              isLeaving ? styles.leaving : '',
              toast.className ?? '',
            ].filter(Boolean).join(' ');

            return (
              <div key={toast.id} className={toastClassName}>
                <div className={styles.iconWrap}>{toast.icon}</div>
                <div className={styles.content}>
                  {title && <div className={styles.title}>{title}</div>}
                  {textBlock && (
                    <div className={styles.text}>
                      {textBlock}
                    </div>
                  )}
                  {toast.actions && (
                    <div className={styles.controls}>
                      {toast.actions.map(action => (
                        <button
                          key={action.id}
                          className={action.intent === 'primary' ? styles.primaryBtn : styles.ghostBtn}
                          onClick={action.handler}
                          type="button"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => dismiss(toast.id)}
                  aria-label="Закрыть уведомление"
                >
                  <X size={16} />
                </button>
                {!toast.dontClose && toast.displayTime > 0 && (
                  <div
                    className={styles.progress}
                    style={{ animationDuration: `${toast.displayTime}ms` }}
                  />
                )}
              </div>
            );
          })}
        </div>,
        portalNode,
      )}
    </NotifyContext.Provider>
  );
};

export const useNotifyContext = () => {
  const ctx = useContext(NotifyContext);
  if (!ctx) {
    throw new Error('useNotify must be used within NotifyProvider');
  }
  return ctx;
};
