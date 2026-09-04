'use client'
import { useState, useEffect } from 'react'

const field = { padding: '8px 11px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', width: '100%' }

const ROLE_LABELS = {
    admin: 'Administrator',
    '': 'Standard User',
}

const ProfilePage = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
    const [msg, setMsg] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/public/me').then(r => r.json()).then(d => {
            if (d.user) {
                setUser(d.user)
                setForm(f => ({ ...f, name: d.user.name || '', email: d.user.email || '' }))
            }
        }).catch(() => {}).finally(() => setLoading(false))
    }, [])

    const handleSave = async (e) => {
        e.preventDefault()
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setMsg({ type: 'error', text: 'New password and confirmation do not match' })
            return
        }
        setSaving(true); setMsg(null)
        try {
            const payload = { name: form.name, email: form.email }
            if (form.newPassword) {
                payload.currentPassword = form.currentPassword
                payload.newPassword = form.newPassword
            }
            const res = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Failed to update profile')
            setUser(data.user)
            setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
            setMsg({ type: 'success', text: 'Profile updated successfully.' })
        } catch (err) {
            setMsg({ type: 'error', text: err.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        )
    }
    if (!user) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#c5221f', fontSize: '15px' }}>Unable to load profile.</div>
    }

    const roleLabel = ROLE_LABELS[String(user.role || '').toLowerCase()] || user.role || 'User'

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: '#f6f8fc', maxWidth: '720px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>My Profile</h1>
            <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 20px' }}>View and update your account details.</p>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#DC2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '22px' }}>
                        {(user.name || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111827' }}>{user.name || '—'}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>{roleLabel}</p>
                    </div>
                </div>
                <div>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permissions</p>
                    {user.permissions && user.permissions.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {user.permissions.map((p, i) => (
                                <span key={i} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: '#e8f0fe', color: '#1a73e8' }}>{p}</span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{user.role === 'Admin' ? 'Full access (Administrator)' : 'No specific permissions assigned.'}</p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', padding: '24px' }}>
                <p style={{ margin: '0 0 ' + (msg ? '2px' : '16px'), fontSize: '15px', fontWeight: 700, color: '#202124' }}>Account Information</p>
                {msg && (
                    <div style={{ margin: '0 0 16px', padding: '10px 13px', borderRadius: '8px', fontSize: '13px', background: msg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: msg.type === 'success' ? '#137333' : '#c5221f', border: `1px solid ${msg.type === 'success' ? '#b7dfbe' : '#f5c6c2'}` }}>{msg.text}</div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Full Name</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={field} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Email</label>
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={field} />
                    </div>
                </div>

                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Change Password</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Current Password</label>
                        <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} style={field} autoComplete="current-password" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>New Password</label>
                            <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} style={field} autoComplete="new-password" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Confirm New Password</label>
                            <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} style={field} autoComplete="new-password" />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={saving}
                    style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, color: '#fff', background: saving ? '#9aa0a6' : '#1a73e8', border: 'none', borderRadius: '24px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 2px 8px rgba(26,115,232,0.3)' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

export default ProfilePage
