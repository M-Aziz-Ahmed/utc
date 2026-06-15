'use client';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaChevronRight, FaCheck, FaTimes } from 'react-icons/fa';

const EMPTY_VENUE = { name: '', membership: '', tel: '', fax: '', email: '', postal: '', address: '' };

function VenueForm({ initial = EMPTY_VENUE, onSave, onCancel, saveLabel = 'Save' }) {
    const [form, setForm] = useState({ ...initial });
    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
    const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full';

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Venue Name *</label>
                    <input type="text" className={inputCls} placeholder="e.g., USS Tokyo" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Membership #</label>
                    <input type="text" className={inputCls} value={form.membership} onChange={e => set('membership', e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">TEL</label>
                    <input type="text" className={inputCls} value={form.tel} onChange={e => set('tel', e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">FAX</label>
                    <input type="text" className={inputCls} value={form.fax} onChange={e => set('fax', e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                    <input type="text" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Postal Code</label>
                    <input type="text" className={inputCls} value={form.postal} onChange={e => set('postal', e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Address</label>
                    <input type="text" className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
            </div>
            <div className="flex gap-2 pt-1">
                <button onClick={onCancel} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition flex items-center justify-center gap-1">
                    <FaTimes className="w-3 h-3" /> Cancel
                </button>
                <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 transition flex items-center justify-center gap-1">
                    <FaCheck className="w-3 h-3" /> {saveLabel}
                </button>
            </div>
        </div>
    );
}

function Page() {
    const [groups, setGroups] = useState([]);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add group modal
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupVenues, setNewGroupVenues] = useState([]);
    const [showNewVenueForm, setShowNewVenueForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit group name inline
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editingGroupName, setEditingGroupName] = useState('');

    // Edit venue inline — key: `${groupId}-${venueIndex}`
    const [editingVenueKey, setEditingVenueKey] = useState(null);

    // Add venue to existing group
    const [addingVenueToGroup, setAddingVenueToGroup] = useState(null);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auctionGroup');
            const data = await res.json();
            setGroups(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    // ── Helpers ──────────────────────────────────────────────
    const patchGroup = async (id, updates) => {
        const res = await fetch('/api/auctionGroup', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });
        if (!res.ok) throw new Error('Update failed');
        const { group } = await res.json();
        setGroups(prev => prev.map(g => g._id === id ? group : g));
        return group;
    };

    // ── Group name edit ───────────────────────────────────────
    const startEditGroupName = (group, e) => {
        e.stopPropagation();
        setEditingGroupId(group._id);
        setEditingGroupName(group.name);
    };

    const saveGroupName = async (id) => {
        if (!editingGroupName.trim()) return;
        await patchGroup(id, { name: editingGroupName.trim() });
        setEditingGroupId(null);
    };

    // ── Delete group ──────────────────────────────────────────
    const handleDeleteGroup = async (id) => {
        if (!confirm('Delete this auction group and all its venues?')) return;
        await fetch('/api/auctionGroup', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        setGroups(prev => prev.filter(g => g._id !== id));
    };

    // ── Venue edit ────────────────────────────────────────────
    const saveVenueEdit = async (group, venueIndex, updatedVenue) => {
        const newOptions = group.options.map((v, i) => i === venueIndex ? updatedVenue : v);
        await patchGroup(group._id, { options: newOptions });
        setEditingVenueKey(null);
    };

    // ── Venue delete ──────────────────────────────────────────
    const deleteVenue = async (group, venueIndex) => {
        if (!confirm('Remove this venue?')) return;
        const newOptions = group.options.filter((_, i) => i !== venueIndex);
        await patchGroup(group._id, { options: newOptions });
    };

    // ── Add venue to existing group ───────────────────────────
    const addVenueToGroup = async (group, venue) => {
        const newOptions = [...(group.options || []), venue];
        await patchGroup(group._id, { options: newOptions });
        setAddingVenueToGroup(null);
    };

    // ── Add new group ─────────────────────────────────────────
    const handleAddVenueToNewList = (venue) => {
        setNewGroupVenues(prev => [...prev, venue]);
        setShowNewVenueForm(false);
    };

    const handleSaveNewGroup = async () => {
        if (!newGroupName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/auctionGroup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newGroupName.trim(), options: newGroupVenues }),
            });
            if (res.ok) {
                setAddModalOpen(false);
                setNewGroupName('');
                setNewGroupVenues([]);
                setShowNewVenueForm(false);
                fetchGroups();
            }
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manage Auction Groups</h1>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                    <FaPlus className="w-3 h-3" /> Add New Group
                </button>
            </div>

            {/* Groups List */}
            {loading ? (
                <div className="text-gray-400 text-center py-16">Loading...</div>
            ) : groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 py-20">
                    <p className="text-gray-500 mb-2">No auction groups yet</p>
                    <button onClick={() => setAddModalOpen(true)} className="text-blue-600 text-sm underline">Add your first group</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map((group) => (
                        <div key={group._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                            {/* ── Group header row ── */}
                            <div
                                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                                onClick={() => setExpandedGroup(expandedGroup === group._id ? null : group._id)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {expandedGroup === group._id
                                        ? <FaChevronDown className="text-gray-400 w-3 h-3 shrink-0" />
                                        : <FaChevronRight className="text-gray-400 w-3 h-3 shrink-0" />
                                    }

                                    {/* Inline group name edit */}
                                    {editingGroupId === group._id ? (
                                        <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                className={inputCls + ' max-w-xs'}
                                                value={editingGroupName}
                                                onChange={e => setEditingGroupName(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') saveGroupName(group._id); if (e.key === 'Escape') setEditingGroupId(null); }}
                                            />
                                            <button onClick={() => saveGroupName(group._id)} className="text-green-600 hover:text-green-700"><FaCheck /></button>
                                            <button onClick={() => setEditingGroupId(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                                        </div>
                                    ) : (
                                        <span className="font-semibold text-gray-900">{group.name}</span>
                                    )}

                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                                        {group.options?.length || 0} venue{group.options?.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 ml-3" onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => startEditGroupName(group, e)} className="text-gray-400 hover:text-blue-500 p-1 transition" title="Rename group">
                                        <FaEdit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteGroup(group._id)} className="text-gray-400 hover:text-red-500 p-1 transition" title="Delete group">
                                        <FaTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* ── Venues panel ── */}
                            {expandedGroup === group._id && (
                                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">

                                    {/* Venue list */}
                                    {group.options?.map((venue, idx) => {
                                        const venueKey = `${group._id}-${idx}`;
                                        return (
                                            <div key={idx}>
                                                {editingVenueKey === venueKey ? (
                                                    <VenueForm
                                                        initial={venue}
                                                        onSave={(updated) => saveVenueEdit(group, idx, updated)}
                                                        onCancel={() => setEditingVenueKey(null)}
                                                        saveLabel="Update Venue"
                                                    />
                                                ) : (
                                                    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{venue.name || '—'}</p>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                                                                {venue.membership && <span className="text-xs text-gray-500">Membership: {venue.membership}</span>}
                                                                {venue.tel && <span className="text-xs text-gray-500">Tel: {venue.tel}</span>}
                                                                {venue.fax && <span className="text-xs text-gray-500">Fax: {venue.fax}</span>}
                                                                {venue.email && <span className="text-xs text-gray-500">Email: {venue.email}</span>}
                                                                {venue.postal && <span className="text-xs text-gray-500">Postal: {venue.postal}</span>}
                                                                {venue.address && <span className="text-xs text-gray-500">Address: {venue.address}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-3 shrink-0">
                                                            <button onClick={() => { setEditingVenueKey(venueKey); setAddingVenueToGroup(null); }} className="text-gray-400 hover:text-blue-500 p-1 transition" title="Edit venue">
                                                                <FaEdit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => deleteVenue(group, idx)} className="text-gray-400 hover:text-red-500 p-1 transition" title="Remove venue">
                                                                <FaTrash className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Add venue to this group */}
                                    {addingVenueToGroup === group._id ? (
                                        <VenueForm
                                            onSave={(venue) => addVenueToGroup(group, venue)}
                                            onCancel={() => setAddingVenueToGroup(null)}
                                            saveLabel="Add Venue"
                                        />
                                    ) : (
                                        <button
                                            onClick={() => { setAddingVenueToGroup(group._id); setEditingVenueKey(null); }}
                                            className="w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                                        >
                                            <FaPlus className="w-3 h-3" /> Add Venue
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Add New Group Modal ── */}
            {addModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Add New Group</h2>
                            <button onClick={() => { setAddModalOpen(false); setNewGroupName(''); setNewGroupVenues([]); setShowNewVenueForm(false); }} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold transition">✕</button>
                        </div>

                        <div className="overflow-y-auto px-6 py-4 space-y-5 flex-1">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name *</label>
                                <input type="text" className={inputCls} placeholder="e.g., JP" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Venues / Sites</label>
                                    <button onClick={() => setShowNewVenueForm(p => !p)} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                                        <FaPlus className="w-2.5 h-2.5" /> Add Venue
                                    </button>
                                </div>

                                {newGroupVenues.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {newGroupVenues.map((v, i) => (
                                            <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                                <span className="text-sm font-medium text-gray-800">{v.name}</span>
                                                <button onClick={() => setNewGroupVenues(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                                                    <FaTrash className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {showNewVenueForm ? (
                                    <VenueForm
                                        onSave={handleAddVenueToNewList}
                                        onCancel={() => setShowNewVenueForm(false)}
                                        saveLabel="Add Venue"
                                    />
                                ) : newGroupVenues.length === 0 && (
                                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        <p className="text-xs text-gray-400">No venues added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                            <button onClick={() => { setAddModalOpen(false); setNewGroupName(''); setNewGroupVenues([]); setShowNewVenueForm(false); }} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={handleSaveNewGroup} disabled={!newGroupName.trim() || saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                {saving ? 'Saving...' : 'Save Group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;
