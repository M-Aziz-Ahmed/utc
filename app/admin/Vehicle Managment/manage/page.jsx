'use client'
import { useState, useEffect, useCallback } from "react";

// ─── Shared helpers ───────────────────────────────────────────────────────────
const inp = "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full";
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
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete "{name}"?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">Delete</button>
            </div>
        </div>
    </div>
);

// ─── Dimension inputs ─────────────────────────────────────────────────────────
const DimInputs = ({ dims = {}, onChange }) => {
    const n = (label, key) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
            <input type="number" value={dims[key] ?? ''} placeholder="0"
                onChange={(e) => onChange({ ...dims, [key]: e.target.value })}
                className="border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
        </div>
    );
    const u = (key, opts) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Unit</label>
            <select value={dims[key] ?? opts[0]} onChange={(e) => onChange({ ...dims, [key]: e.target.value })}
                className="border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
    return (
        <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dimensions</p>
            <div className="grid grid-cols-4 gap-2">{n('Length','length')}{n('Width','width')}{n('Height','height')}{u('unit_size',['cm','m','mm','in','ft'])}</div>
            <div className="grid grid-cols-2 gap-2">{n('Weight','weight')}{u('unit_weight',['kg','g','lb','oz','t'])}</div>
        </div>
    );
};

// ─── Car models editor (used in both create & edit) ───────────────────────────
const emptyModel = { name: '', description: '', dimensions: {} };

const CarModelsEditor = ({ models, onChange }) => {
    const [draft, setDraft] = useState(emptyModel);

    const add = () => {
        if (!draft.name.trim()) return;
        onChange([...models, { ...draft }]);
        setDraft(emptyModel);
    };
    const remove = (i) => onChange(models.filter((_, idx) => idx !== i));

    return (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Car Models ({models.length})</p>

            {models.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {models.map((m, i) => {
                        const d = m.dimensions || {};
                        const dimStr = [d.length && `L:${d.length}`, d.width && `W:${d.width}`, d.height && `H:${d.height}`].filter(Boolean).join(' ');
                        return (
                            <div key={i} className="flex items-start justify-between bg-gray-50 rounded-lg px-3 py-2 gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                                    {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                                    {dimStr && <p className="text-xs text-gray-400">{dimStr} {d.unit_size || 'cm'}{d.weight ? ` · ${d.weight}${d.unit_weight || 'kg'}` : ''}</p>}
                                </div>
                                <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-600">+ New Model</p>
                <div className="grid grid-cols-2 gap-2">
                    <F label="Model Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                    <F label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                </div>
                <DimInputs dims={draft.dimensions} onChange={(dims) => setDraft({ ...draft, dimensions: dims })} />
                <button type="button" onClick={add} disabled={!draft.name.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition disabled:opacity-40">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add Model
                </button>
            </div>
        </div>
    );
};

// ─── Manufacturer panel ───────────────────────────────────────────────────────
const emptyMfr = { name: '', country: '', models: [] };

const ManufacturerPanel = () => {
    const [list, setList]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm]       = useState(emptyMfr);
    const [editing, setEditing] = useState(null); // id being edited
    const [deleting, setDeleting] = useState(null); // {id, name}
    const [msg, setMsg]         = useState({ text: '', ok: false });
    const [expanded, setExpanded] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/manufacturer');
        const data = await res.json().catch(() => []);
        setList(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const startEdit = (item) => {
        setEditing(item._id);
        setForm({ name: item.name, country: item.country || '', models: item.models || [] });
        setExpanded(item._id);
    };
    const cancelEdit = () => { setEditing(null); setForm(emptyMfr); };

    const handleSave = async (e) => {
        e.preventDefault();
        const isNew = !editing;
        const url   = isNew ? '/api/manufacturer' : `/api/manufacturer/${editing}`;
        const method = isNew ? 'POST' : 'PATCH';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const data = await res.json().catch(() => ({}));
        setMsg({ text: data.message || (res.ok ? 'Saved' : 'Error'), ok: res.ok });
        if (res.ok) { setForm(emptyMfr); setEditing(null); load(); }
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
        <div className="space-y-6">
            {deleting && <ConfirmDelete name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />}

            {/* Create / Edit form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4">{editing ? '✏️ Edit Manufacturer' : '➕ Add Manufacturer'}</h3>
                <Msg text={msg.text} ok={msg.ok} />
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <F label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <F label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                    </div>
                    <CarModelsEditor models={form.models} onChange={(models) => setForm({ ...form, models })} />
                    <div className="flex gap-2">
                        <button type="submit" disabled={!form.name.trim()}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition text-sm disabled:opacity-40">
                            {editing ? 'Save Changes' : 'Create Manufacturer'}
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
                    <h3 className="text-sm font-bold text-gray-700">All Manufacturers ({list.length})</h3>
                    <button onClick={load} className="text-xs text-blue-500 hover:text-blue-700 font-semibold">Refresh</button>
                </div>
                {loading ? (
                    <div className="p-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
                ) : list.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">No manufacturers yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {list.map((item) => (
                            <div key={item._id}>
                                <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.country || '—'} · {item.models?.length || 0} model{item.models?.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-3 shrink-0">
                                        <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => setDeleting({ id: item._id, name: item.name })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                                {expanded === item._id && item.models?.length > 0 && (
                                    <div className="px-5 pb-3 bg-gray-50 border-t border-gray-100">
                                        <div className="space-y-1.5 pt-2">
                                            {item.models.map((m, i) => {
                                                const d = m.dimensions || {};
                                                const dimStr = [d.length && `L:${d.length}`, d.width && `W:${d.width}`, d.height && `H:${d.height}`].filter(Boolean).join(' ');
                                                return (
                                                    <div key={i} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">{m.name}</p>
                                                            {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                                                            {dimStr && <p className="text-xs text-gray-400">{dimStr} {d.unit_size || 'cm'}{d.weight ? ` · ${d.weight}${d.unit_weight || 'kg'}` : ''}</p>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Rikuso Companies panel ───────────────────────────────────────────────────
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

const RikusoPanel = () => {
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
        // Filter only Rikuso companies
        setList(Array.isArray(data) ? data.filter(m => m.isRikusoCompany) : []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

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
            name: form.companyName, // Set name field for consistency
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
        <div className="space-y-6">
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
    );
};

// ─── Consignee panel ──────────────────────────────────────────────────────────
const emptyCon = { name: '', email: '', phone: '', company: '', vat: '', address: '', city: '', country: '', notes: '' };

const ConsigneePanel = () => {
    const [list, setList]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [form, setForm]         = useState(emptyCon);
    const [editing, setEditing]   = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [msg, setMsg]           = useState({ text: '', ok: false });

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/consignee');
        const data = await res.json().catch(() => []);
        setList(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const startEdit = (item) => {
        setEditing(item._id);
        setForm({ name: item.name, email: item.email || '', phone: item.phone || '', company: item.company || '',
            vat: item.vat || '', address: item.address || '', city: item.city || '', country: item.country || '', notes: item.notes || '' });
    };
    const cancelEdit = () => { setEditing(null); setForm(emptyCon); };

    const handleSave = async (e) => {
        e.preventDefault();
        const isNew = !editing;
        const url    = isNew ? '/api/consignee' : `/api/consignee/${editing}`;
        const method = isNew ? 'POST' : 'PATCH';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const data = await res.json().catch(() => ({}));
        setMsg({ text: data.message || (res.ok ? 'Saved' : 'Error'), ok: res.ok });
        if (res.ok) { setForm(emptyCon); setEditing(null); load(); }
    };

    const handleDelete = async () => {
        const id = deleting?.id;
        const name = deleting?.name;
        if (!id) return;
        setDeleting(null);
        const res = await fetch(`/api/consignee/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        setMsg({ text: data.message || (res.ok ? `"${name}" deleted` : 'Error'), ok: res.ok });
        if (res.ok) load();
    };

    return (
        <div className="space-y-6">
            {deleting && <ConfirmDelete name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />}

            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4">{editing ? '✏️ Edit Consignee' : '➕ Add Consignee'}</h3>
                <Msg text={msg.text} ok={msg.ok} />
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <F label="Name *"   value={form.name}    onChange={set('name')} />
                        <F label="Company"  value={form.company} onChange={set('company')} />
                        <F label="Email"    value={form.email}   onChange={set('email')}   type="email" />
                        <F label="Phone"    value={form.phone}   onChange={set('phone')} />
                        <F label="VAT"      value={form.vat}     onChange={set('vat')} />
                        <F label="City"     value={form.city}    onChange={set('city')} />
                        <F label="Country"  value={form.country} onChange={set('country')} />
                        <F label="Address"  value={form.address} onChange={set('address')} />
                    </div>
                    <F label="Notes" value={form.notes} onChange={set('notes')} textarea />
                    <div className="flex gap-2">
                        <button type="submit" disabled={!form.name.trim()}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition text-sm disabled:opacity-40">
                            {editing ? 'Save Changes' : 'Create Consignee'}
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
                    <h3 className="text-sm font-bold text-gray-700">All Consignees ({list.length})</h3>
                    <button onClick={load} className="text-xs text-blue-500 hover:text-blue-700 font-semibold">Refresh</button>
                </div>
                {loading ? (
                    <div className="p-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
                ) : list.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">No consignees yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {list.map((item) => (
                            <div key={item._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {[item.company, item.email, item.city, item.country].filter(Boolean).join(' · ') || '—'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 ml-3 shrink-0">
                                    <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Edit">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => setDeleting({ id: item._id, name: item.name })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'manufacturer', label: 'Manufacturers', icon: '🚗' },
    { key: 'consignee',    label: 'Consignees',    icon: '📦' },
    { key: 'rikuso',       label: 'Rikuso Companies', icon: '🏢' },
];

export default function ManagePage() {
    const [tab, setTab] = useState('manufacturer');

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Manage</h1>
                    <p className="text-sm text-gray-500 mt-1">View, create, edit and delete manufacturers and consignees.</p>
                </div>

                <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
                    {TABS.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                                tab === t.key ? 'bg-blue-500 text-white shadow' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}>
                            <span>{t.icon}</span><span>{t.label}</span>
                        </button>
                    ))}
                </div>

                {tab === 'manufacturer' && <ManufacturerPanel />}
                {tab === 'consignee'    && <ConsigneePanel />}
                {tab === 'rikuso'       && <RikusoPanel />}
            </div>
        </div>
    );
}
