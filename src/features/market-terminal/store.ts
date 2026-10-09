import { MARKET_TERMINAL_STORAGE_KEY, parsePersistedView, parseUrlView, serializeViewToSearch } from './view-state.ts';
import type { TerminalViewState } from './types.ts';

export interface MarketTerminalStoreEnvironment {
  getSearch(): string;
  replaceSearch(search: string): void;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
}

export interface MarketTerminalStore {
  getState(): TerminalViewState;
  update(patch: Partial<TerminalViewState>): void;
  reset(): void;
  subscribe(listener: (state: TerminalViewState) => void): () => void;
}

function readPersistedState(storage: Pick<Storage, 'getItem'>): unknown {
  const serialized = storage.getItem(MARKET_TERMINAL_STORAGE_KEY);
  if (serialized === null) return undefined;
  try {
    const parsed: unknown = JSON.parse(serialized);
    return parsed;
  } catch (error) {
    throw new Error('Saved market terminal settings are invalid JSON.', { cause: error });
  }
}

export function createMarketTerminalStore(environment: MarketTerminalStoreEnvironment): MarketTerminalStore {
  const stored = readPersistedState(environment.storage);
  let state = parseUrlView(environment.getSearch(), stored);
  const listeners = new Set<(nextState: TerminalViewState) => void>();

  const save = () => {
    environment.storage.setItem(MARKET_TERMINAL_STORAGE_KEY, JSON.stringify(state));
    environment.replaceSearch(serializeViewToSearch(environment.getSearch(), state));
    listeners.forEach(listener => listener({ ...state, indicators: [...state.indicators] }));
  };

  return {
    getState: () => ({ ...state, indicators: [...state.indicators] }),
    update: patch => {
      state = { ...state, ...patch };
      save();
    },
    reset: () => {
      state = parsePersistedView(undefined);
      save();
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function createBrowserMarketTerminalStore(): MarketTerminalStore {
  return createMarketTerminalStore({
    getSearch: () => window.location.search,
    replaceSearch: search => {
      window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
    },
    storage: window.localStorage,
  });
}
