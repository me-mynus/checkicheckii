// Simple in-memory key-value store for Supabase Edge Functions
// In production, you might want to use Supabase Database or Redis

const store = new Map<string, any>();

export const kvStore = {
  async get(key: string): Promise<any> {
    return store.get(key) || null;
  },

  async set(key: string, value: any): Promise<void> {
    store.set(key, value);
  },

  async delete(key: string): Promise<void> {
    store.delete(key);
  },

  async clear(): Promise<void> {
    store.clear();
  }
};