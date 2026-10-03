import { useSyncExternalStore } from 'react';
import { subscribe } from '../utils/localStorage';

/**
 * Subscribes a component to a Local Storage collection, e.g. useStore(getDonors).
 * The component re-renders whenever that collection is saved anywhere in the app.
 */
export const useStore = (getter) => useSyncExternalStore(subscribe, getter);
