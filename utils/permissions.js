// Portal / page-level access control for the UTC admin system.
// A user's `permissions` array (on the User model) lists the portal keys
// they are allowed to open. Admins are always allowed everywhere.

export const PORTALS = [
    { key: 'vehicles',   label: 'Vehicle Entry Form',    href: '/admin/vehicles' },
    { key: 'allocation', label: 'Vehicle Allocation',    href: '/admin/rikuso' },
    { key: 'accounts',   label: 'Vehicle Accounts',      href: '/admin/vehicles/accounts' },
    { key: 'export',     label: 'Export Cars',           href: '/admin/export' },
    { key: 'auction',    label: 'Auction Details',       href: '/admin/auctionDetails' },
    { key: 'igp',        label: 'Gate Pass (IGP/OGP)',   href: '/admin/gatePass' },
    { key: 'review',     label: 'Photo Review Portal',   href: '/admin/gatePass/review' },
    { key: 'yard',       label: 'Yard Management',       href: '/admin/yard' },
    { key: 'setup',      label: 'Vehicle Setup',         href: '/admin/setup' },
    { key: 'fields',     label: 'Dynamic Fields',        href: '/admin/fields' },
    { key: 'users',      label: 'Users',                 href: '/admin/users' },
    { key: 'manage',     label: 'Clients / Consignees',  href: '/admin/manage' },
    { key: 'website',    label: 'Website Management',    href: '/admin/website/hero' },
]

// Route prefix -> portal key. Longest / most specific entries must come first.
const RULES = [
    ['/admin/users', 'users'],
    ['/admin/vehicles/accounts', 'accounts'],
    ['/admin/vehicles', 'vehicles'],
    ['/admin/gatePass/review', 'review'],
    ['/admin/gatePass', 'igp'],
    ['/admin/rikuso', 'allocation'],
    ['/admin/auctionDetails', 'auction'],
    ['/admin/export', 'export'],
    ['/admin/manage', 'manage'],
    ['/admin/yard', 'yard'],
    ['/admin/setup', 'setup'],
    ['/admin/fields', 'fields'],
    ['/admin/website', 'website'],
]

const normalize = (p) => (p && p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p || '')

export const isAdmin = (user) => !!(user?.role && String(user.role).toLowerCase() === 'admin')

export const canAccessPortal = (user, key) =>
    isAdmin(user) || (user?.permissions || []).includes(key)

export const getPermissionForPath = (pathname) => {
    const p = normalize(pathname)
    if (p === '/admin') return 'dashboard'
    for (const [prefix, perm] of RULES) {
        if (p === prefix || p.startsWith(prefix + '/')) return perm
    }
    return null
}

export const hasAccess = (user, pathname) => {
    if (!user) return false
    if (isAdmin(user)) return true
    if (!pathname || !pathname.startsWith('/admin')) return true
    const perm = getPermissionForPath(pathname)
    if (!perm || perm === 'dashboard') return false
    return (user.permissions || []).includes(perm)
}

// Where should a logged-in user land?
export const getFirstPortalPath = (user) => {
    if (isAdmin(user)) return '/admin'
    const perms = user?.permissions || []
    for (const portal of PORTALS) {
        if (perms.includes(portal.key)) return portal.href
    }
    return '/'
}

// Build a flat map of permission key -> label for UI checkboxes / badges.
export const portalLabel = (key) => {
    const found = PORTALS.find((p) => p.key === key)
    return found ? found.label : key
}
