'use client'
import { useEffect, useState, useRef } from "react";

const FIELD_TYPES = ["text","number","boolean","password","email","date","image","file","dropdown","select-year","select-country","tax","sum"];
const TYPE_COLORS = {
    text:'bg-blue-50 text-blue-700 border-blue-200', number:'bg-purple-50 text-purple-700 border-purple-200',
    boolean:'bg-yellow-50 text-yellow-700 border-yellow-200', password:'bg-red-50 text-red-700 border-red-200',
    email:'bg-teal-50 text-teal-700 border-teal-200', date:'bg-orange-50 text-orange-700 border-orange-200',
    image:'bg-pink-50 text-pink-700 border-pink-200', file:'bg-indigo-50 text-indigo-700 border-indigo-200',
    dropdown:'bg-green-50 text-green-700 border-green-200',
    'select-year':'bg-cyan-50 text-cyan-700 border-cyan-200',
    'select-country':'bg-lime-50 text-lime-700 border-lime-200',
    tax:'bg-amber-50 text-amber-700 border-amber-200',
    sum:'bg-violet-50 text-violet-700 border-violet-200',
};

const GetAllFields = ({ refreshKey, onDelete, forms }) => {
    const [fields, setFields] = useState(null);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [editing, setEditing] = useState(null);
    const [editDraft, setEditDraft] = useState({});
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterForm, setFilterForm] = useState("all");
    const [quickAdd, setQuickAdd] = useState(null);
    const [quickAddValue, setQuickAddValue] = useState('');
    const [quickAdding, setQuickAdding] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [taxes, setTaxes] = useState([]);
    const dragItem = useRef(null);
    const dragOver = useRef(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await fetch('/api/fields');
                if (!res.ok) throw new Error('Failed to load fields');
                const data = await res.json();
                if (mounted) setFields(data);
            } catch (e) { if (mounted) setError(e.message); }
        };
        load();
        return () => { mounted = false };
    }, [refreshKey]);

    useEffect(() => {
        fetch('/api/tax').then(r => r.ok ? r.json() : []).then(d => setTaxes(d)).catch(() => {})
    }, []);

    const startEdit = (f) => {
        setEditing(f._id);
        setEditDraft({ label:f.label, type:f.type, isRequired:f.isRequired??false,
            belongsto:f.belongsto??'', options:f.options||[], newOption:'', linkedTax:f.linkedTax||'', linkedField:f.linkedField||'', linkedFields:f.linkedFields||[], vehicleField:f.vehicleField||'' });
    };
    const cancelEdit = () => { setEditing(null); setEditDraft({}); };

    const handleSave = async (id) => {
        setSaving(true);
        try {
            const d = { label:editDraft.label, type:editDraft.type,
                isRequired:editDraft.isRequired, belongsto:editDraft.belongsto.trim()||undefined };
            if (editDraft.type === 'dropdown') {
                const v = (editDraft.options||[]).filter(o=>o.trim()!=='');
                if (!v.length) { alert('Add at least one option'); setSaving(false); return; }
                d.options = v;
            }
            if (editDraft.type === 'select-year') {
                const currentYear = new Date().getFullYear();
                const years = [];
                for (let y = currentYear; y >= 1950; y--) years.push(String(y));
                d.options = years;
            }
            if (editDraft.type === 'select-country') {
                d.options = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
            }
            if (editDraft.type === 'tax') {
                d.linkedTax = editDraft.linkedTax || null;
                d.linkedField = editDraft.linkedField || '';
            }
            if (editDraft.type === 'sum') {
                d.linkedFields = editDraft.linkedFields || [];
            }
            if (editDraft.vehicleField) {
                d.vehicleField = editDraft.vehicleField;
            } else {
                d.vehicleField = '';
            }
            const res = await fetch(`/api/fields/${id}`, {
                method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
            if (!res.ok) throw new Error('Failed to save');
            const updated = await res.json();
            setFields(prev => prev.map(f => f._id===id ? updated : f));
            setEditing(null); setEditDraft({});
        } catch(e) { alert(e.message); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            const res = await fetch(`/api/fields/${id}`, { method:'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setFields(prev => prev.filter(f => f._id!==id));
            onDelete?.();
        } catch(e) { alert(e.message); }
        finally { setDeleting(null); }
    };

    const handleQuickAddOption = async (field) => {
        const val = quickAddValue.trim();
        if (!val) return;
        if ((field.options||[]).includes(val)) { setQuickAddValue(''); setQuickAdd(null); return; }
        setQuickAdding(true);
        try {
            const newOptions = [...(field.options||[]), val];
            const res = await fetch(`/api/fields/${field._id}`, {
                method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({options:newOptions}) });
            if (!res.ok) throw new Error('Failed');
            const updated = await res.json();
            setFields(prev => prev.map(f => f._id===field._id ? updated : f));
            setQuickAddValue(''); setQuickAdd(null);
        } catch(e) { alert(e.message); }
        finally { setQuickAdding(false); }
    };

    const handleRemoveOption = async (field, idx) => {
        if (field.options.length<=1) { alert('A dropdown must have at least one option.'); return; }
        const newOptions = field.options.filter((_,i)=>i!==idx);
        const res = await fetch(`/api/fields/${field._id}`, {
            method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({options:newOptions}) });
        if (res.ok) {
            const updated = await res.json();
            setFields(prev => prev.map(f => f._id===field._id ? updated : f));
        }
    };

    // ── showOnCard toggle ──────────────────────────────────────────────────────
    const toggleShowOnCard = async (field) => {
        const newVal = field.showOnCard === false ? true : false;  // explicit toggle
        try {
            const res = await fetch(`/api/fields/${field._id}`, {
                method:'PATCH',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ showOnCard: newVal })
            });
            if (res.ok) {
                // Update locally immediately without waiting for server response
                // (server response might omit the false value)
                setFields(prev => prev.map(f =>
                    f._id === field._id ? { ...f, showOnCard: newVal } : f
                ));
            }
        } catch(e) { console.error(e); }
    };

    // ── Drag-and-drop reorder ─────────────────────────────────────────────────
    const onDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };
    const onDragEnter = (e, index) => {
        dragOver.current = index;
        e.preventDefault();
    };
    const onDragOver = (e) => { e.preventDefault(); };

    const onDrop = async (e, formName) => {
        e.preventDefault();
        const from = dragItem.current;
        const to = dragOver.current;
        if (from === null || to === null || from === to) return;

        // Reorder within the same form group
        const groupFields = [...(groupedFields[formName] || [])];
        const moved = groupFields.splice(from, 1)[0];
        groupFields.splice(to, 0, moved);

        // Assign new order values
        const updated = groupFields.map((f, i) => ({ ...f, order: i }));
        const newFields = fields.map(f => {
            const u = updated.find(u => u._id === f._id);
            return u || f;
        });
        setFields(newFields);

        setReordering(true);
        try {
            await fetch('/api/fields/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: updated.map(f => ({ id: f._id, order: f.order })) })
            });
        } catch(e) { console.error(e); }
        finally { setReordering(false); dragItem.current = null; dragOver.current = null; }
    };

    if (error) return (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    );
    if (fields === null) return (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse"/>)}</div>
    );

    const filteredFields = fields.filter(f => {
        if (searchTerm && !f.label.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterType !== "all" && f.type !== filterType) return false;
        if (filterForm !== "all") {
            if (filterForm === "global" && f.belongsto) return false;
            if (filterForm !== "global" && f.belongsto !== filterForm) return false;
        }
        return true;
    });

    const groupedFields = {};
    filteredFields.forEach(f => {
        const key = f.belongsto || 'Global Fields';
        if (!groupedFields[key]) groupedFields[key] = [];
        groupedFields[key].push(f);
    });
    const sortedForms = Object.keys(groupedFields).sort((a,b)=> a==='Global Fields'?-1:b==='Global Fields'?1:a.localeCompare(b));

    return (
        <div className="space-y-5">
            {/* Search & Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Search fields by label..." value={searchTerm}
                        onChange={e=>setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"/>
                </div>
                <div className="flex gap-2">
                    <select value={filterType} onChange={e=>setFilterType(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none">
                        <option value="all">All Types</option>
                        {FIELD_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={filterForm} onChange={e=>setFilterForm(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none">
                        <option value="all">All Forms</option>
                        <option value="global">Global Fields</option>
                        {forms&&forms.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {filteredFields.length} of {fields.length} fields
                        {reordering && <span className="ml-2 text-blue-500">Saving order…</span>}
                    </span>
                    <span className="text-xs text-gray-400">⠿ Drag rows to reorder · 🟢 Toggle to show on card</span>
                </div>
            </div>

            {filteredFields.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No fields match your filters</p>
                </div>
            ) : (
                <div className="space-y-5 max-h-150 overflow-y-auto pr-1">
                    {sortedForms.map(formName => (
                        <div key={formName}>
                            <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200 mb-2">
                                <span className="text-xs font-bold text-gray-700 capitalize">{formName}</span>
                                <span className="ml-auto text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{groupedFields[formName].length}</span>
                            </div>
                            <div className="space-y-1.5">
                                {groupedFields[formName].map((f, idx) => {
                                    if (editing === f._id) return (
                                        <div key={f._id} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="col-span-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Label</label>
                                                    <input value={editDraft.label} onChange={e=>setEditDraft({...editDraft,label:e.target.value})}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Type</label>
                                                    <select value={editDraft.type} onChange={e=>setEditDraft({...editDraft,type:e.target.value,options:e.target.value==='dropdown'?(editDraft.options||[]):[]})}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                                                        {FIELD_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Belongs to</label>
                                                    <select value={editDraft.belongsto} onChange={e=>setEditDraft({...editDraft,belongsto:e.target.value})}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                                                        <option value="">— none —</option>
                                                        {forms&&forms.map(fm=><option key={fm} value={fm}>{fm}</option>)}
                                                    </select>
                                                </div>
                                                {editDraft.type==='dropdown' && (
                                                    <div className="col-span-2 border-2 border-blue-200 rounded-lg p-3 bg-white">
                                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Options</label>
                                                        <div className="space-y-1.5 mb-2">
                                                            {(editDraft.options||[]).map((opt,i)=>(
                                                                <div key={i} className="flex gap-2">
                                                                    <input value={opt} onChange={e=>{const o=[...(editDraft.options||[])];o[i]=e.target.value;setEditDraft({...editDraft,options:o})}}
                                                                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-400"/>
                                                                    {(editDraft.options||[]).length>1&&<button type="button" onClick={()=>setEditDraft({...editDraft,options:(editDraft.options||[]).filter((_,j)=>j!==i)})} className="text-red-500 hover:text-red-700 px-1 text-sm">✕</button>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2 border-t border-gray-200 pt-2">
                                                            <input value={editDraft.newOption||''} onChange={e=>setEditDraft({...editDraft,newOption:e.target.value})}
                                                                onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if((editDraft.newOption||'').trim())setEditDraft({...editDraft,options:[...(editDraft.options||[]),editDraft.newOption.trim()],newOption:''})}}}
                                                                placeholder="New option…" className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-400"/>
                                                            <button type="button" onClick={()=>{if((editDraft.newOption||'').trim())setEditDraft({...editDraft,options:[...(editDraft.options||[]),editDraft.newOption.trim()],newOption:''})}}
                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded font-semibold">Add</button>
                                                        </div>
                                                    </div>
                                                )}
                                                {editDraft.type==='select-year' && (
                                                    <div className="col-span-2 border-2 border-cyan-200 rounded-lg p-3 bg-cyan-50">
                                                        <label className="text-xs font-semibold text-cyan-700 uppercase tracking-wide block mb-2">Auto-generated Years</label>
                                                        <p className="text-xs text-cyan-600">Options are years from <strong>{new Date().getFullYear()}</strong> down to <strong>1950</strong>. Saved automatically on save.</p>
                                                    </div>
                                                )}
                                                {editDraft.type==='select-country' && (
                                                    <div className="col-span-2 border-2 border-lime-200 rounded-lg p-3 bg-lime-50">
                                                        <label className="text-xs font-semibold text-lime-700 uppercase tracking-wide block mb-2">Auto-generated Countries</label>
                                                        <p className="text-xs text-lime-600">Options are <strong>195 countries</strong> sorted A-Z. Saved automatically on save.</p>
                                                    </div>
                                                )}
                                                {editDraft.type==='tax' && (
                                                    <div className="col-span-2 border-2 border-amber-200 rounded-lg p-3 bg-amber-50">
                                                        <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-2">Linked Tax</label>
                                                        <select value={editDraft.linkedTax||''} onChange={e=>setEditDraft({...editDraft,linkedTax:e.target.value})}
                                                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-amber-400 bg-white mb-2">
                                                            <option value="">Select a tax...</option>
                                                            {taxes.filter(t=>t.active).map(t=><option key={t._id} value={t._id}>{t.name} ({t.type==='percentage'?`${t.rate}%`:`$${t.rate}`})</option>)}
                                                        </select>
                                                        {taxes.filter(t=>t.active).length===0&&<p className="text-xs text-amber-600 mb-2 italic">No active taxes. <a href="/admin/setup/tax" className="underline">Create taxes first.</a></p>}
                                                        <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-2">Calculate from field</label>
                                                        <select value={editDraft.linkedField||''} onChange={e=>setEditDraft({...editDraft,linkedField:e.target.value})}
                                                            className="w-full border border-amber-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-amber-400 bg-white">
                                                            <option value="">Select source field...</option>
                                                            {fields.filter(f=>(f.type==='number'||f.type==='text')&&f._id!==editing).map(f=><option key={f._id} value={f.label}>{f.label}{f.belongsto?` (${f.belongsto})`:''}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                                {editDraft.type==='sum' && (
                                                    <div className="col-span-2 border-2 border-violet-200 rounded-lg p-3 bg-violet-50">
                                                        <label className="text-xs font-semibold text-violet-700 uppercase tracking-wide block mb-2">Fields to Sum</label>
                                                        <p className="text-xs text-violet-500 mb-2">Check the fields whose values should be added together.</p>
                                                        <div className="space-y-1 max-h-40 overflow-y-auto bg-white rounded border border-violet-200 p-2">
                                                            {fields.filter(f=>(f.type==='number'||f.type==='text'||f.type==='tax'||f.type==='sum')&&f._id!==editing).map(f=>(
                                                                <label key={f._id} className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-xs hover:bg-violet-50 transition">
                                                                    <input type="checkbox" className="accent-violet-600" checked={(editDraft.linkedFields||[]).includes(f.label)}
                                                                        onChange={e=>{const lf=editDraft.linkedFields||[];setEditDraft({...editDraft,linkedFields:e.target.checked?[...lf,f.label]:lf.filter(l=>l!==f.label)})}}/>
                                                                    <span className="font-medium text-gray-800">{f.label}</span>
                                                                    <span className="text-gray-400 ml-auto">{f.type}{f.belongsto?` (${f.belongsto})`:''}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        {(editDraft.linkedFields||[]).length>0&&<p className="text-xs text-violet-600 mt-2 font-medium">Summing: {(editDraft.linkedFields||[]).join(' + ')}</p>}
                                                    </div>
                                                )}
                                                {editDraft.type!=='file'&&editDraft.type!=='image' && (
                                                    <div className="col-span-2 border-2 border-green-200 rounded-lg p-3 bg-green-50">
                                                        <label className="text-xs font-semibold text-green-700 uppercase tracking-wide block mb-2">Link to Vehicle DB Field</label>
                                                        <p className="text-xs text-green-600 mb-2">Auto-fill from the vehicle's database value. Field will be read-only.</p>
                                                        <select value={editDraft.vehicleField||''} onChange={e=>setEditDraft({...editDraft,vehicleField:e.target.value})}
                                                            className="w-full border border-green-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-green-400 bg-white">
                                                            <option value="">None (manual entry)</option>
                                                            <option value="rikusoCompany">Rikuso Company</option>
                                                            <option value="consignee">Consignee</option>
                                                            <option value="allocation">Allocation</option>
                                                            <option value="exportCountry">Export Country</option>
                                                            <option value="manufacturer">Manufacturer</option>
                                                            <option value="model">Model</option>
                                                            <option value="auctionGroup">Auction Group</option>
                                                            <option value="auctionVenue">Auction Venue</option>
                                                        </select>
                                                    </div>
                                                )}
                                                <div className="col-span-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Required?</span>
                                                    <div className="flex gap-3">
                                                        {[{l:'Yes',v:true},{l:'No',v:false}].map(({l,v})=>(
                                                            <label key={String(v)} className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium transition ${editDraft.isRequired===v?'border-blue-500 bg-white text-blue-700':'border-gray-200 bg-white text-gray-500'}`}>
                                                                <input type="radio" className="sr-only" checked={editDraft.isRequired===v} onChange={()=>setEditDraft({...editDraft,isRequired:v})}/>{l}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={cancelEdit} disabled={saving} className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                                                <button onClick={()=>handleSave(f._id)} disabled={saving||!editDraft.label} className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-1">
                                                    {saving?<svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>:<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>}
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div key={f._id}
                                            draggable
                                            onDragStart={e=>onDragStart(e,idx)}
                                            onDragEnter={e=>onDragEnter(e,idx)}
                                            onDragOver={onDragOver}
                                            onDrop={e=>onDrop(e,formName)}
                                            className="rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all"
                                        >
                                            <div className="flex items-center justify-between px-3 py-2.5">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {/* drag handle */}
                                                    <span className="text-gray-300 cursor-grab active:cursor-grabbing shrink-0 text-base leading-none select-none">⠿</span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-semibold text-gray-900 truncate" style={{fontSize:'var(--text-sm)'}}>{f.label}</span>
                                                            {f.isRequired && <span className="jp-badge jp-badge-red">REQ</span>}
                                                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${TYPE_COLORS[f.type]||'bg-gray-100 text-gray-700 border-gray-200'}`}>{f.type}</span>
                                                            {f.type==='dropdown'&&f.options?.length>0&&<span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{f.options.length} opts</span>}
                                                            {f.type==='select-year'&&f.options?.length>0&&<span className="text-xs text-cyan-500 bg-cyan-50 px-1.5 py-0.5 rounded-full">{f.options.length} yrs</span>}
                                                            {f.type==='select-country'&&f.options?.length>0&&<span className="text-xs text-lime-600 bg-lime-50 px-1.5 py-0.5 rounded-full">{f.options.length} countries</span>}
                                                             {f.type==='tax'&&f.linkedTax&&<span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">linked: {taxes.find(t=>t._id===f.linkedTax)?.name||'unknown'}</span>}
                                                             {f.type==='sum'&&f.linkedFields?.length>0&&<span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full border border-violet-200">Σ {f.linkedFields.length} fields</span>}
                                                             {f.vehicleField&&<span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">→ {f.vehicleField}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                                    {/* Show on card toggle */}
                                                    <button onClick={()=>toggleShowOnCard(f)} title={f.showOnCard!==false?'Showing on card — click to hide':'Hidden from card — click to show'}
                                                        className={`p-1.5 rounded-lg transition text-xs font-bold ${f.showOnCard!==false?'bg-green-100 text-green-700 hover:bg-green-200':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                                        {f.showOnCard!==false ? '🟢' : '⚫'}
                                                    </button>
                                                    <button onClick={()=>startEdit(f)} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    </button>
                                                    <button onClick={()=>handleDelete(f._id)} disabled={deleting===f._id} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition">
                                                        {deleting===f._id
                                                            ?<svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                                                            :<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                            {/* options chips + quick-add */}
                                            {(f.type==='dropdown'||f.type==='select-year'||f.type==='select-country')&&(f.options?.length>0||quickAdd===f._id)&&(
                                                <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 rounded-b-xl">
                                                    {f.options?.length>0&&(
                                                        <div className="flex flex-wrap gap-1 mb-1.5">
                                                            {[...(f.options||[])].sort((a,b)=>{const na=Number(a),nb=Number(b);if(!isNaN(na)&&!isNaN(nb))return na-nb;return a.localeCompare(b)}).map((opt,i)=>(
                                                                <span key={i} className="group/chip inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                                                    {opt}
                                                                    {f.type==='dropdown'&&<button onClick={()=>handleRemoveOption(f,i)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover/chip:opacity-100">
                                                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                                                                    </button>}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {f.type==='dropdown'&&(quickAdd===f._id?(
                                                        <div className="flex gap-1.5">
                                                            <input autoFocus value={quickAddValue} onChange={e=>setQuickAddValue(e.target.value)}
                                                                onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();handleQuickAddOption(f)}if(e.key==='Escape'){setQuickAdd(null);setQuickAddValue('')}}}
                                                                placeholder="New option, press Enter" className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-400 outline-none bg-white"/>
                                                            <button onClick={()=>handleQuickAddOption(f)} disabled={!quickAddValue.trim()||quickAdding} className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg disabled:opacity-50">{quickAdding?'…':'Add'}</button>
                                                            <button onClick={()=>{setQuickAdd(null);setQuickAddValue('')}} className="px-2 py-1 text-gray-400 text-xs rounded-lg hover:bg-gray-100">✕</button>
                                                        </div>
                                                    ):(
                                                        <button onClick={()=>{setQuickAdd(f._id);setQuickAddValue('')}} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                                            Add option
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GetAllFields;
