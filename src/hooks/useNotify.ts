import { useNotifyContext } from '../providers/NotifyProvider';

export const useNotify = () => useNotifyContext();

export type { NotifyHandle } from '../providers/NotifyProvider';
