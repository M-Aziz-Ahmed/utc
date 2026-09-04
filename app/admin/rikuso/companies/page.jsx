'use client'
import { useState, useEffect, useCallback } from "react";

const inp = "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition w-full";
const F = ({ label, value, onChange, type = 'text', textarea = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        {textarea
            ? <textarea rows={2} value={value} onChange={onChange} className={inp + " resize-none"} />
            : <input type={type} value={value} onChange={onChange} className={inp} />}
    </div>
);

const Msg = ({ text, ok }) => !text ? null : (
    <div className={`px-3 py-2 rounded-lg text-sm font-medium mb-3 ${ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{text}</div>
);

const ConfirmDelete = ({ name, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete &quot;{name}&quot;?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">Delete</button>
            </div>
        </div>
    </div>
);

const emptyRikuso = {
    companyName: '',
    contactPerson: '',
    tel: '',
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    mob: '',
    telSharp: '',
    fax: '',
    email: '',
    address: ''
};

export default function RikusoCompaniesPage() {
    const [list, setList]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [form, setForm]         = useState(emptyRikuso);
    const [editing, setEditing]   = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [msg, setMsg]           = useState({ text: '', ok: false });
    const [expanded, setExpanded] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/manufacturer');
        const data = await res.json().catch(() => []);
        setList(Array.isArray(data) ? data.filter(m => m.isRikusoCompany) : []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const run = async () => { await load() }
        run()
    }, [load]);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const startEdit = (item) => {
        setEditing(item._id);
        setForm({
            companyName: item.companyName || item.name || '',
            contactPerson: item.contactPerson || '',
            tel: item.tel || '',
            bankName: item.bankName || '',
            accountTitle: item.accountTitle || '',
            accountNumber: item.accountNumber || '',
            mob: item.mob || '',
            telSharp: item.telSharp || '',
            fax: item.fax || '',
            email: item.email || '',
            address: item.address || ''
        });
        setExpanded(item._id);
    };
    const cancelEdit = () => { setEditing(null); setForm(emptyRikuso); };

    const handleSave = async (e) => {
        e.preventDefault();
        const isNew = !editing;
        const url    = isNew ? '/api/manufacturer' : `/api/manufacturer/${editing}`;
        const method = isNew ? 'POST' : 'PATCH';
        const payload = {
            ...form,
            name: form.companyName,
            isRikusoCompany: true
        };
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({}));
        setMsg({ text: data.message || (res.ok ? 'Saved' : 'Error'), ok: res.ok });
        if (res.ok) { setForm(emptyRikuso); setEditing(null); load(); }
    };

    const handleDelete = async () => {
        const id = deleting?.id;
        const name = deleting?.name;
        if (!id) return;
        setDeleting(null);
        const res = await fetch(`/api/manufacturer/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        setMsg({ text: data.message || (res.ok ? `"${name}" deleted` : 'Error'), ok: res.ok });
        if (res.ok) load();
    };

    return (
        <div className="px-4 md:px-6 py-5">
            <div className="mb-5">
                <h1 className="font-bold" style={{ fontSize: 'var(--text-2xl)', color: '#111827' }}>Rikuso Companies</h1>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Manage Rikuso companies used in vehicle allocations.</p>
            </div>

            <div className="space-y-6 max-w-3xl">
                {deleting && <ConfirmDelete name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />}

                {/* Form */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">{editing ? '✏️ Edit Rikuso Company' : '➕ Add Rikuso Company'}</h3>
                    <Msg text={msg.text} ok={msg.ok} />
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <F label="Company Name *" value={form.companyName} onChange={set('companyName')} />
                            <F label="Contact Person" value={form.contactPerson} onChange={set('contactPerson')} />
                            <F label="T #" value={form.tel} onChange={set('tel')} />
                            <F label="Bank Name" value={form.bankName} onChange={set('bankName')} />
                            <F label="Account Title" value={form.accountTitle} onChange={set('accountTitle')} />
                            <F label="Account #" value={form.accountNumber} onChange={set('accountNumber')} />
                            <F label="Mob #" value={form.mob} onChange={set('mob')} />
                            <F label="Tel #" value={form.telSharp} onChange={set('telSharp')} />
                            <F label="Fax #" value={form.fax} onChange={set('fax')} />
                            <F label="Email" value={form.email} onChange={set('email')} type="email" />
                        </div>
                        <F label="Address" value={form.address} onChange={set('address')} textarea />
                        <div className="flex gap-2">
                            <button type="submit" disabled={!form.companyName.trim()}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition text-sm disabled:opacity-40">
                                {editing ? 'Save Changes' : 'Create Rikuso Company'}
                            </button>
                            {editing && (
                                <button type="button" onClick={cancelEdit}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700">All Rikuso Companies ({list.length})</h3>
                        <button onClick={load} className="text-xs text-orange-500 hover:text-orange-700 font-semibold">Refresh</button>
                    </div>
                    {loading ? (
                        <div className="p-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
                    ) : list.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">No Rikuso companies yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {list.map((item) => (
                                <div key={item._id}>
                                    <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                                            <p className="text-sm font-semibold text-gray-800">{item.companyName || item.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {[item.contactPerson, item.email, item.mob].filter(Boolean).join(' · ') || '—'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3 shrink-0">
                                            <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition" title="Edit">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => setDeleting({ id: item._id, name: item.companyName || item.name })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    {expanded === item._id && (
                                        <div className="px-5 pb-3 bg-orange-50 border-t border-orange-100">
                                            <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                                                {item.tel && <div><span className="font-semibold text-gray-600">T #:</span> <span className="text-gray-800">{item.tel}</span></div>}
                                                {item.bankName && <div><span className="font-semibold text-gray-600">Bank:</span> <span className="text-gray-800">{item.bankName}</span></div>}
                                                {item.accountTitle && <div><span className="font-semibold text-gray-600">Account Title:</span> <span className="text-gray-800">{item.accountTitle}</span></div>}
                                                {item.accountNumber && <div><span className="font-semibold text-gray-600">Account #:</span> <span className="text-gray-800">{item.accountNumber}</span></div>}
                                                {item.mob && <div><span className="font-semibold text-gray-600">Mob #:</span> <span className="text-gray-800">{item.mob}</span></div>}
                                                {item.telSharp && <div><span className="font-semibold text-gray-600">Tel #:</span> <span className="text-gray-800">{item.telSharp}</span></div>}
                                                {item.fax && <div><span className="font-semibold text-gray-600">Fax #:</span> <span className="text-gray-800">{item.fax}</span></div>}
                                                {item.email && <div><span className="font-semibold text-gray-600">Email:</span> <span className="text-gray-800">{item.email}</span></div>}
                                                {item.address && <div className="col-span-2"><span className="font-semibold text-gray-600">Address:</span> <span className="text-gray-800">{item.address}</span></div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
