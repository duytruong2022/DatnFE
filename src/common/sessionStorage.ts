import { isJson } from './helpers';

export class SessionStorage {
    getSessionStorage(key: string): string {
        if (!sessionStorage) {
            return '';
        }
        return sessionStorage.getItem(key) || '';
    }

    setSessionStorage(key: string, value: string): void {
        if (!sessionStorage) {
            return;
        }
        sessionStorage.setItem(key, value);
    }

    getObjectFromKey<T>(key: string): T | Record<string, unknown> {
        const jsonString = this.getSessionStorage(key);
        if (isJson(jsonString)) {
            return JSON.parse(jsonString) as T;
        }
        return {};
    }
}

export const authSessionStorage = new SessionStorage();
