const STORAGE_KEY_PREFIX = "stayhub_admin_"
const EXPIRY_DAYS = 1

interface StorageItem<T> {
  data: T
  timestamp: number
}

interface DraftItem<T> extends StorageItem<T> {
  id: string
}

export const storage = {
  save<T>(key: string, data: T): void {
    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(item))
  },

  load<T>(key: string): T | null {
    const item = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`)
    if (!item) return null

    try {
      const parsed: StorageItem<T> = JSON.parse(item)
      const daysPassed = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24)

      if (daysPassed > EXPIRY_DAYS) {
        this.remove(key)
        return null
      }

      return parsed.data
    } catch {
      return null
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`)
  },

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  },

  saveDraft<T>(key: string, data: T, draftId: string): void {
    const draftsKey = `${key}_drafts`
    const drafts = this.loadAllDrafts<T>(key) || {}
    
    drafts[draftId] = {
      data,
      timestamp: Date.now(),
      id: draftId,
    }
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${draftsKey}`, JSON.stringify(drafts))
  },

  loadDraft<T>(key: string, draftId: string): T | null {
    const drafts = this.loadAllDrafts<T>(key)
    if (!drafts || !drafts[draftId]) return null

    const draft = drafts[draftId]
    const daysPassed = (Date.now() - draft.timestamp) / (1000 * 60 * 60 * 24)

    if (daysPassed > EXPIRY_DAYS) {
      this.removeDraft(key, draftId)
      return null
    }

    return draft.data
  },

  loadAllDrafts<T>(key: string): Record<string, DraftItem<T>> | null {
    const draftsKey = `${key}_drafts`
    const item = localStorage.getItem(`${STORAGE_KEY_PREFIX}${draftsKey}`)
    if (!item) return null

    try {
      const drafts = JSON.parse(item)
      // Clean up expired drafts
      const now = Date.now()
      Object.keys(drafts).forEach((draftId) => {
        const daysPassed = (now - drafts[draftId].timestamp) / (1000 * 60 * 60 * 24)
        if (daysPassed > EXPIRY_DAYS) {
          delete drafts[draftId]
        }
      })
      
      // Save cleaned drafts
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${draftsKey}`, JSON.stringify(drafts))
      
      return drafts
    } catch {
      return null
    }
  },

  removeDraft(key: string, draftId: string): void {
    const drafts = this.loadAllDrafts(key)
    if (!drafts) return

    delete drafts[draftId]
    const draftsKey = `${key}_drafts`
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${draftsKey}`, JSON.stringify(drafts))
  },

  generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
}
