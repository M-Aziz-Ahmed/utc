export const WISHLIST_KEY = 'utc_wishlist'

const listeners = new Set()

const getStored = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

let cached = null

export const getWishlistSnapshot = () => {
  if (cached === null) cached = getStored()
  return cached
}

const setStored = (list) => {
  cached = list
  try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)) } catch {}
  listeners.forEach(l => l())
}

export const subscribeWishlist = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const idOf = (v) => v.vehicleId || v._id

export const isInWishlist = (id) => {
  if (!id) return false
  return getWishlistSnapshot().some(v => idOf(v) === id)
}

export const toggleWishlist = (vehicle) => {
  const id = idOf(vehicle)
  if (!id) return false
  const list = getWishlistSnapshot()
  const exists = list.some(v => idOf(v) === id)
  setStored(exists ? list.filter(v => idOf(v) !== id) : [...list, vehicle])
  return !exists
}

export const removeFromWishlist = (id) => {
  if (!id) return
  setStored(getWishlistSnapshot().filter(v => idOf(v) !== id))
}
