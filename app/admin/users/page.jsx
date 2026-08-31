'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { portalLabel } from '@/utils/permissions'
import {
    Page, PageHeader, Card, Btn, SearchBar, Select,
    Table, Th, Td, Badge, Modal, LoadingCenter, EmptyState, T
} from '@/components/admin/ui'

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const UsersPage = () => {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    useEffect(() => { fetchUsers() }, [])

    useEffect(() => {
        let filtered = [...users]
        if (searchTerm) {
            const s = searchTerm.toLowerCase()
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(s) ||
                u.surname?.toLowerCase().includes(s) ||
                u.email?.toLowerCase().includes(s) ||
                u.company?.toLowerCase().includes(s)
            )
        }
        if (roleFilter !== 'all') filtered = filtered.filter(u => u.role === roleFilter)
        if (statusFilter !== 'all') filtered = filtered.filter(u => u.verified === (statusFilter === 'active'))
        setFilteredUsers(filtered)
    }, [users, searchTerm, roleFilter, statusFilter])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users')
            if (res.ok) setUsers(await res.json())
            else setError('Failed to fetch users')
        } catch { setError('Error loading users') }
        finally { setLoading(false) }
    }

    const handleDelete = async (userId) => {
        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
            if (res.ok) { setUsers(users.filter(u => u._id !== userId)); setDeleteConfirm(null) }
            else alert('Failed to delete user')
        } catch { alert('Error deleting user') }
    }

    const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))]
    const hasFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all'

    const addIcon = <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>

    return (
        <Page>
            <PageHeader
                title="Users"
                subtitle={`${users.length} total`}
                actions={
                    <Link href="/setupUser">
                        <Btn variant="primary" icon={addIcon}>Add User</Btn>
                    </Link>
                }
            />

            {/* Filters */}
            <Card style={{ marginBottom: 16, padding: '14px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search name, email, company…" />
                    <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                    <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                    </Select>
                    {hasFilters && (
                        <Btn variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all') }}>
                            Clear
                        </Btn>
                    )}
                </div>
                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 8 }}>
                    Showing {filteredUsers.length} of {users.length}
                </p>
            </Card>

            {/* Table */}
            <Card noPad>
                {loading ? <LoadingCenter /> : error ? (
                    <div style={{ padding: 40, textAlign: 'center', color: T.red, fontSize: 13 }}>{error}</div>
                ) : filteredUsers.length === 0 ? (
                    <EmptyState
                        message={hasFilters ? 'No users match your filters.' : 'No users yet.'}
                        action={!hasFilters && (
                            <Link href="/setupUser"><Btn variant="primary" icon={addIcon}>Add First User</Btn></Link>
                        )}
                    />
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>User</Th>
                                <Th>Role</Th>
                                <Th>Access</Th>
                                <Th>Status</Th>
                                <Th>Created</Th>
                                <Th center>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id} style={{ transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <Td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 30, height: 30, borderRadius: 6, background: T.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                                {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>{user.name || 'N/A'} {user.surname || ''}</p>
                                                <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Badge label={user.role || 'User'} variant="approved" />
                                            {user.viewOnly && <Badge label="View Only" variant="inactive" />}
                                        </div>
                                    </Td>
                                    <Td>
                                        {String(user.role || '').toLowerCase() === 'admin' ? (
                                            <Badge label="All" variant="active" />
                                        ) : (user.permissions || []).length === 0 ? (
                                            <Badge label="Home only" variant="inactive" />
                                        ) : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {(user.permissions || []).map(p => (
                                                    <Badge key={p} label={portalLabel(p)} variant="approved" />
                                                ))}
                                            </div>
                                        )}
                                    </Td>
                                    <Td>
                                        <Badge label={user.verified ? 'Active' : 'Pending'} variant={user.verified ? 'active' : 'inactive'} />
                                    </Td>
                                    <Td muted>{fmtDate(user.createdAt)}</Td>
                                    <Td center>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                            <Link href={`/admin/users/edit/${user._id}`}>
                                                <Btn variant="ghost" size="sm" icon={<svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}>
                                                    Edit
                                                </Btn>
                                            </Link>
                                            <Btn variant="danger" size="sm" onClick={() => setDeleteConfirm(user._id)}
                                                icon={<svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}>
                                                Delete
                                            </Btn>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            {/* Delete confirmation modal */}
            {deleteConfirm && (
                <Modal
                    title="Delete User"
                    onClose={() => setDeleteConfirm(null)}
                    footer={<>
                        <Btn variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
                        <Btn variant="danger" onClick={() => handleDelete(deleteConfirm)}>Delete</Btn>
                    </>}
                >
                    <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                        Are you sure? This user will be permanently deleted and cannot be recovered.
                    </p>
                </Modal>
            )}
        </Page>
    )
}

export default UsersPage
