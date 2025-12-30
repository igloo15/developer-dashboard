import type { SavedList } from '../types';

const STORAGE_KEY = 'saved-awesome-lists';

export const savedListsStorage = {
  getAll(): SavedList[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load saved lists:', error);
      return [];
    }
  },

  save(list: SavedList): void {
    try {
      const lists = this.getAll();
      const existingIndex = lists.findIndex(l => l.id === list.id);

      if (existingIndex >= 0) {
        lists[existingIndex] = list;
      } else {
        lists.push(list);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Failed to save list:', error);
      throw error;
    }
  },

  delete(id: string): void {
    try {
      const lists = this.getAll();
      const filtered = lists.filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete list:', error);
      throw error;
    }
  },

  getById(id: string): SavedList | null {
    const lists = this.getAll();
    return lists.find(l => l.id === id) || null;
  },

  update(id: string, updates: Partial<SavedList>): void {
    const lists = this.getAll();
    const index = lists.findIndex(l => l.id === id);

    if (index >= 0) {
      lists[index] = { ...lists[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    }
  }
};
