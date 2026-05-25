'use client'
import { useState, useEffect } from "react";

// ─── Fetch dynamic fields for a given form name ──────────────────────────────
const useDynamicFields = (belongsto) => {
    const [dynFields, setDynFields] = useState([]);
    useEffect(() => {
        if (!belongsto) return;
        fetch('/api/fields', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ belongsto }),
        })
            .then((r) => r.json())
            .then((data) => setDynFields(Array.isArray(data) ? data : []))
            .catch(() => setDynFields([]));
    }, [belongsto]);
    return dynFields;
};

// ─── Render a single dynamic field ──────────────────────────────────────────
const DynamicFieldRenderer = ({ field, value, onChange }) => {
    const base = "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition w-full";
    const label = (
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {field.label}{field.isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );

    const { type } = field;

    if (type === 'dropdown') {
        return (
            <div className="flex flex-col gap-1">
                {label}
                <select value={value || ''} onChange={onChange} required={field.isRequired} className={base + " bg-white"}>
                    <option value="">Select…</option>
                    {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        );
    }
    if (type === 'boolean') {
        return (
            <div className="flex flex-col gap-1">
                {label}
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange({ target: { value: e.target.checked } })}
                        className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">Yes</span>
                </label>
            </div>
        );
    }
    if (type === 'date') {
        return (
            <div className="flex flex-col gap-1">
                {label}
                <input type="date" value={value || ''} onChange={onChange} required={field.isRequired} className={base} />
            </div>
        );
    }
    // text, number, email, password, image, file
    const inputType = ['number', 'email', 'password', 'image', 'file'].includes(type) ? type : 'text';
    return (
        <div className="flex flex-col gap-1">
            {label}
            <input type={inputType} value={value || ''} onChange={onChange} required={field.isRequired} className={base} />
        </div>
    );
};

// ─── Reusable static field ───────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', textarea = false, required = false }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {textarea ? (
            <textarea
                rows={3}
                value={value}
                onChange={onChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
        )}
    </div>
);

// ─── Status message ──────────────────────────────────────────────────────────
const Message = ({ text, ok }) => {
    if (!text) return null;
    return (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium mb-4 ${ok
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {text}
        </div>
    );
};

// ─── Card wrapper ────────────────────────────────────────────────────────────
const Card = ({ title, icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                {icon}
            </div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        {children}
    </div>
);

// ─── Section divider ─────────────────────────────────────────────────────────
const Section = ({ title }) => (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mt-2">{title}</p>
);

// ─── Supplier Form ───────────────────────────────────────────────────────────
const SupplierForm = () => {
    const FORM = 'supplier';
    const empty = { name: '', email: '', phone: '', company: '', vat: '', address: '', city: '', country: '', notes: '' };
    const [values, setValues] = useState(empty);
    const [dynValues, setDynValues] = useState({});
    const [msg, setMsg] = useState({ text: '', ok: false });
    const dynFields = useDynamicFields(FORM);

    const set = (key) => (e) => setValues({ ...values, [key]: e.target.value });
    const setDyn = (key) => (e) => setDynValues({ ...dynValues, [key]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/supplier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, ...dynValues }),
        });
        const data = await res.json().catch(() => ({ message: 'Server error' }));
        setMsg({ text: data.message || (res.ok ? 'Saved' : 'Error'), ok: res.ok });
        if (res.ok) { setValues(empty); setDynValues({}); }
    };

    return (
        <Card title="Add Supplier" icon="🏭">
            <Message text={msg.text} ok={msg.ok} />
            <form onSubmit={handleSubmit} className="space-y-4">
                <Section title="Basic Info" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Name" value={values.name}    onChange={set('name')}    required />
                    <Field label="Company"   value={values.company} onChange={set('company')} />
                    <Field label="Email"     value={values.email}   onChange={set('email')}   type="email" />
                    <Field label="Phone"     value={values.phone}   onChange={set('phone')} />
                    <Field label="VAT"       value={values.vat}     onChange={set('vat')} />
                    <Field label="City"      value={values.city}    onChange={set('city')} />
                    <Field label="Country"   value={values.country} onChange={set('country')} />
                    <Field label="Address"   value={values.address} onChange={set('address')} />
                </div>
                <Field label="Notes" value={values.notes} onChange={set('notes')} textarea />

                {dynFields.length > 0 && (
                    <>
                        <Section title="Additional Fields" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dynFields.map((f) => (
                                <DynamicFieldRenderer
                                    key={f._id}
                                    field={f}
                                    value={dynValues[f.label] ?? ''}
                                    onChange={setDyn(f.label)}
                                />
                            ))}
                        </div>
                    </>
                )}

                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition text-sm">
                    Save Supplier
                </button>
            </form>
        </Card>
    );
};

// ─── Consignee Form ──────────────────────────────────────────────────────────
const ConsigneeForm = () => {
    const FORM = 'consignee';
    const empty = { name: '', email: '', phone: '', company: '', vat: '', address: '', city: '', country: '', notes: '' };
    const [values, setValues] = useState(empty);
    const [dynValues, setDynValues] = useState({});
    const [msg, setMsg] = useState({ text: '', ok: false });
    const dynFields = useDynamicFields(FORM);

    const set = (key) => (e) => setValues({ ...values, [key]: e.target.value });
    const setDyn = (key) => (e) => setDynValues({ ...dynValues, [key]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/consignee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, ...dynValues }),
        });
        const data = await res.json().catch(() => ({ message: 'Server error' }));
        setMsg({ text: data.message || (res.ok ? 'Saved' : 'Error'), ok: res.ok });
        if (res.ok) { setValues(empty); setDynValues({}); }
    };

    return (
        <Card title="Add Consignee" icon="📦">
            <Message text={msg.text} ok={msg.ok} />
            <form onSubmit={handleSubmit} className="space-y-4">
                <Section title="Basic Info" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Name" value={values.name}    onChange={set('name')}    required />
                    <Field label="Company"   value={values.company} onChange={set('company')} />
                    <Field label="Email"     value={values.email}   onChange={set('email')}   type="email" />
                    <Field label="Phone"     value={values.phone}   onChange={set('phone')} />
                    <Field label="VAT"       value={values.vat}     onChange={set('vat')} />
                    <Field label="City"      value={values.city}    onChange={set('city')} />
                    <Field label="Country"   value={values.country} onChange={set('country')} />
                    <Field label="Address"   value={values.address} onChange={set('address')} />
                </div>
                <Field label="Notes" value={values.notes} onChange={set('notes')} textarea />

                {dynFields.length > 0 && (
                    <>
                        <Section title="Additional Fields" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dynFields.map((f) => (
                                <DynamicFieldRenderer
                                    key={f._id}
                                    field={f}
                                    value={dynValues[f.label] ?? ''}
                                    onChange={setDyn(f.label)}
                                />
                            ))}
                        </div>
                    </>
                )}

                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition text-sm">
                    Save Consignee
                </button>
            </form>
        </Card>
    );
};

// ─── Dimensions input inside a car model ─────────────────────────────────────
const DimensionInputs = ({ dims, onChange }) => {
    const numInput = (label, key) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
            <input
                type="number"
                value={dims[key] ?? ''}
                onChange={(e) => onChange({ ...dims, [key]: e.target.value })}
                placeholder="0"
                className="border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
        </div>
    );
    const unitSel = (key, opts) => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Unit</label>
            <select
                value={dims[key] ?? opts[0]}
                onChange={(e) => onChange({ ...dims, [key]: e.target.value })}
                className="border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
    return (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dimensions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {numInput('Length', 'length')}
                {numInput('Width',  'width')}
                {numInput('Height', 'height')}
                {unitSel('unit_size', ['cm', 'm', 'mm', 'in', 'ft'])}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {numInput('Weight', 'weight')}
                {unitSel('unit_weight', ['kg', 'g', 'lb', 'oz', 't'])}
            </div>
        </div>
    );
};

// ─── Manufacturer + Car Model Form ───────────────────────────────────────────
const ManufacturerForm = () => {
    const FORM = 'manufacturer';
    const emptyMfr = { name: '', country: '', models: [] };
    const emptyModel = { name: '', description: '', dimensions: {} };
    const [values, setValues] = useState(emptyMfr);
    const [modelInput, setModelInput] = useState(emptyModel);
    const [dynValues, setDynValues] = useState({});
    const [msg, setMsg] = useState({ text: '', ok: false });
    const dynFields = useDynamicFields(FORM);

    const setDyn = (key) => (e) => setDynValues({ ...dynValues, [key]: e.target.value });

    const addModel = () => {
        if (!modelInput.name.trim()) return;
        setValues({ ...values, models: [...values.models, { ...modelInput }] });
        setModelInput(emptyModel);
    };

    const removeModel = (i) => setValues({ ...values, models: values.models.filter((_, idx) => idx !== i) });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/manufacturer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, ...dynValues }),
        });
        const data = await res.json().catch(() => ({ message: 'Server error' }));
        setMsg({ text: data.message || (res.ok ? 'Saved' : 'Error'), ok: res.ok });
        if (res.ok) { setValues(emptyMfr); setModelInput(emptyModel); setDynValues({}); }
    };

    return (
        <Card title="Add Manufacturer & Car Models" icon="🚗">
            <Message text={msg.text} ok={msg.ok} />
            <form onSubmit={handleSubmit} className="space-y-5">
                <Section title="Manufacturer" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Manufacturer Name" value={values.name}    onChange={(e) => setValues({ ...values, name: e.target.value })} required />
                    <Field label="Country of Origin"  value={values.country} onChange={(e) => setValues({ ...values, country: e.target.value })} />
                </div>

                {/* Car models */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Car Models</p>

                    {/* Added models list */}
                    {values.models.length > 0 && (
                        <div className="space-y-2">
                            {values.models.map((m, i) => {
                                const d = m.dimensions || {};
                                const hasDims = d.length || d.width || d.height || d.weight;
                                return (
                                    <div key={i} className="flex items-start justify-between bg-gray-50 rounded-lg px-3 py-2 gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                                            {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                                            {hasDims && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {[d.length && `L: ${d.length}`, d.width && `W: ${d.width}`, d.height && `H: ${d.height}`].filter(Boolean).join(' · ')}
                                                    {d.length && ` ${d.unit_size || 'cm'}`}
                                                    {d.weight && `  ·  ${d.weight} ${d.unit_weight || 'kg'}`}
                                                </p>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => removeModel(i)} className="text-red-400 hover:text-red-600 transition shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* New model input */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-3">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">New Model</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Model Name"  value={modelInput.name}        onChange={(e) => setModelInput({ ...modelInput, name: e.target.value })} />
                            <Field label="Description" value={modelInput.description} onChange={(e) => setModelInput({ ...modelInput, description: e.target.value })} />
                        </div>
                        <DimensionInputs
                            dims={modelInput.dimensions}
                            onChange={(dims) => setModelInput({ ...modelInput, dimensions: dims })}
                        />
                        <button
                            type="button"
                            onClick={addModel}
                            disabled={!modelInput.name.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-40"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Model
                        </button>
                    </div>
                </div>

                {dynFields.length > 0 && (
                    <>
                        <Section title="Additional Fields" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dynFields.map((f) => (
                                <DynamicFieldRenderer
                                    key={f._id}
                                    field={f}
                                    value={dynValues[f.label] ?? ''}
                                    onChange={setDyn(f.label)}
                                />
                            ))}
                        </div>
                    </>
                )}

                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition text-sm">
                    Save Manufacturer
                </button>
            </form>
        </Card>
    );
};

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'supplier',     label: 'Supplier',     icon: '🏭' },
    { key: 'consignee',    label: 'Consignee',    icon: '📦' },
    { key: 'manufacturer', label: 'Manufacturer', icon: '🚗' },
];

export default function SetupPage() {
    const [tab, setTab] = useState('supplier');

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Setup</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage suppliers, consignees, manufacturers, and dimensions.
                        Dynamic fields added via the Fields manager appear automatically under each form.
                    </p>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm flex-wrap">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                                tab === t.key
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <span>{t.icon}</span>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>

                {tab === 'supplier'     && <SupplierForm />}
                {tab === 'consignee'    && <ConsigneeForm />}
                {tab === 'manufacturer' && <ManufacturerForm />}
            </div>
        </div>
    );
}
