import type { RecentlyViewedItem } from '../types/dashboard-ux';

const MAX_ITEMS = 20;
const DISPLAY_LIMIT = 5;
const STORAGE_KEY_PREFIX = 'dluznik_recently_viewed_';

/**
 * Tracks recently viewed loans and obligations.
 * Persists to localStorage scoped per user, with in-memory session tracking.
 */
class RecentlyViewedServiceImpl {
  private sessionItems: Set<string> = new Set();

  private getStorageKey(userId: string): string {
    return `${STORAGE_KEY_PREFIX}${userId}`;
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__ls_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private loadItems(userId: string): RecentlyViewedItem[] {
    if (!this.isLocalStorageAvailable()) {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return [];

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        this.clearCorruptedData(userId);
        return [];
      }

      // Validate each item has required fields
      const valid = parsed.filter(
        (item: unknown): item is RecentlyViewedItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as RecentlyViewedItem).id === 'string' &&
          ((item as RecentlyViewedItem).type === 'loan' || (item as RecentlyViewedItem).type === 'obligation') &&
          typeof (item as RecentlyViewedItem).name === 'string' &&
          typeof (item as RecentlyViewedItem).balance === 'number' &&
          typeof (item as RecentlyViewedItem).currency === 'string' &&
          typeof (item as RecentlyViewedItem).viewedAt === 'string'
      );

      if (valid.length !== parsed.length) {
        // Some items were corrupted, save only valid ones
        this.saveItems(userId, valid);
      }

      return valid;
    } catch {
      this.clearCorruptedData(userId);
      return [];
    }
  }

  private saveItems(userId: string, items: RecentlyViewedItem[]): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(items));
    } catch {
      // localStorage full or unavailable — graceful degradation
    }
  }

  private clearCorruptedData(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
    } catch {
      // Cannot clear — ignore
    }
  }

  /**
   * Records a view of a loan or obligation.
   * Deduplicates by id, moves existing items to the top, enforces max 20 items.
   */
  recordView(userId: string, item: RecentlyViewedItem): void {
    // Track in session
    this.sessionItems.add(item.id);

    const items = this.loadItems(userId);

    // Remove existing entry with same id (deduplication)
    const filtered = items.filter((existing) => existing.id !== item.id);

    // Add to the front (most recent)
    filtered.unshift(item);

    // Enforce max limit
    const trimmed = filtered.slice(0, MAX_ITEMS);

    this.saveItems(userId, trimmed);
  }

  /**
   * Returns all recently viewed items for a user.
   * Ordered by viewedAt descending (newest first).
   */
  getRecentItems(userId: string): RecentlyViewedItem[] {
    const items = this.loadItems(userId);
    return items.sort(
      (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
    );
  }

  /**
   * Returns the top 5 most recently viewed items, ordered by viewedAt descending.
   * Used for the dashboard display section.
   */
  getDisplayItems(userId: string): RecentlyViewedItem[] {
    return this.getRecentItems(userId).slice(0, DISPLAY_LIMIT);
  }

  /**
   * Returns items viewed in the current session (in-memory tracking).
   * Filters the persisted list to only include items viewed this session.
   */
  getSessionItems(userId: string): RecentlyViewedItem[] {
    const items = this.getRecentItems(userId);
    return items.filter((item) => this.sessionItems.has(item.id));
  }

  /**
   * Removes a specific item from the recently viewed list by id.
   * Also removes from session tracking.
   */
  removeItem(userId: string, id: string): void {
    this.sessionItems.delete(id);

    const items = this.loadItems(userId);
    const filtered = items.filter((item) => item.id !== id);
    this.saveItems(userId, filtered);
  }

  /**
   * Clears all recently viewed items for a user.
   * Also clears session tracking.
   */
  clear(userId: string): void {
    this.sessionItems.clear();

    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(this.getStorageKey(userId));
    } catch {
      // Cannot clear — ignore
    }
  }

  /**
   * Resets session tracking (e.g., on new session start).
   */
  resetSession(): void {
    this.sessionItems.clear();
  }

  /**
   * Checks if any items have been viewed in the current session.
   */
  hasSessionItems(): boolean {
    return this.sessionItems.size > 0;
  }
}

// Export singleton instance
export const RecentlyViewedService = new RecentlyViewedServiceImpl();
export type { RecentlyViewedItem };
