'use client'
import { useEffect, useState, useRef } from 'react'

// ── tiny helpers ───────────────────────────────────────────────────────────────
const clx = (...a) => a.filter(Boolean).join(' ')

const Btn = ({ children, onClick, variant = 'ghost', size = 'sm', disabled, className, type = 'button' }) => {
    const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
    const variants = {
        ghost:   'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300',
        primary: 'bg-[#1a73e8] text-white hover:bg-[#1557b0] border border-[#1a73e8]',
        danger:  'border border-red-200 text-red-600 hover:bg-red-50',
        success: 'bg-green-600 text-white hover:bg-green-700 border border-green-600',
    }
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={clx(base, sizes[size], variants[variant], className)}>
            {children}
        </button>
    )
}

const Modal = ({ title, onClose, children, width = '480px' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px', borderRadius: '50%' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div style={{ padding: '20px' }}>{children}</div>
        </div>
    </div>
)

const Field = ({ label, children, required }) => (
    <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
            {label}{required && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
        </label>
        {children}
    </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', ...rest }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: '100%', padding: '7px 10px', border: '1px solid #c4c7c5', borderRadius: '4px', fontSize: '13px', color: '#202124', outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = '#1a73e8'}
        onBlur={e => e.target.style.borderColor = '#c4c7c5'}
        {...rest}
    />
)

const Select = ({ value, onChange, children, ...rest }) => (
    <select
        value={value}
        onChange={onChange}
        style={{ width: '100%', padding: '7px 10px', border: '1px solid #c4c7c5', borderRadius: '4px', fontSize: '13px', color: '#202124', outline: 'none', background: '#fff' }}
        {...rest}
    >
        {children}
    </select>
)

const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"]

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SetupPage() {
    const [manufacturers, setManufacturers] = useState([])
    const [fields, setFields] = useState([])          // dynamic fields for add-vehicles
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // selected manufacturer whose models are shown in the right panel
    const [activeMfg, setActiveMfg] = useState(null)

    // modals
    const [mfgModal, setMfgModal]     = useState(null)  // null | 'add' | { ...manufacturer }
    const [modelModal, setModelModal] = useState(null)  // null | 'add' | { mfgId, modelIndex, ...model }
    const [saving, setSaving]         = useState(false)

    useEffect(() => { load() }, [])

    const load = async () => {
        setLoading(true)
        const [mRes, fRes] = await Promise.all([
            fetch('/api/manufacturer'),
            fetch('/api/fields'),
        ])
        const mData = mRes.ok ? await mRes.json() : []
        const fData = fRes.ok ? await fRes.json() : []
        const mfgs = mData.filter(m => !m.isRikusoCompany).sort((a, b) => a.name.localeCompare(b.name))
        setManufacturers(mfgs)
        setFields(fData.filter(f => f.belongsto === 'add-vehicles'))
        if (mfgs.length > 0) setActiveMfg(prev => prev ? mfgs.find(m => m._id === prev._id) || mfgs[0] : mfgs[0])
        setLoading(false)
    }

    // ── Manufacturer CRUD ──────────────────────────────────────────────────────
    const saveMfg = async (data) => {
        setSaving(true)
        try {
            if (data._id) {
                const res = await fetch(`/api/manufacturer/${data._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.name, country: data.country }) })
                if (!res.ok) throw new Error('Failed')
            } else {
                const res = await fetch('/api/manufacturer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.name, country: data.country, models: [] }) })
                if (!res.ok) throw new Error('Failed')
            }
            await load()
            setMfgModal(null)
        } catch (e) { alert(e.message) }
        finally { setSaving(false) }
    }

    const deleteMfg = async (id) => {
        if (!confirm('Delete this manufacturer and all its models?')) return
        await fetch(`/api/manufacturer/${id}`, { method: 'DELETE' })
        if (activeMfg?._id === id) setActiveMfg(null)
        await load()
    }

    // ── Model CRUD ─────────────────────────────────────────────────────────────
    const saveModel = async (data) => {
        setSaving(true)
        try {
            const mfg = manufacturers.find(m => m._id === data.mfgId)
            if (!mfg) throw new Error('Manufacturer not found')
            let updatedModels
            if (data.modelIndex !== undefined) {
                updatedModels = mfg.models.map((m, i) => i === data.modelIndex
                    ? { ...m, name: data.name, description: data.description, dimensions: data.dimensions || {}, defaults: data.defaults }
                    : m
                )
            } else {
                updatedModels = [...(mfg.models || []), { name: data.name, description: data.description, dimensions: data.dimensions || {}, defaults: data.defaults }]
            }
            const res = await fetch(`/api/manufacturer/${data.mfgId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ models: updatedModels }) })
            if (!res.ok) throw new Error('Failed')
            await load()
            setModelModal(null)
        } catch (e) { alert(e.message) }
        finally { setSaving(false) }
    }

    const deleteModel = async (mfgId, modelIndex) => {
        if (!confirm('Delete this model?')) return
        const mfg = manufacturers.find(m => m._id === mfgId)
        const updatedModels = mfg.models.filter((_, i) => i !== modelIndex)
        await fetch(`/api/manufacturer/${mfgId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ models: updatedModels }) })
        await load()
    }

    const filteredMfg = manufacturers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.country?.toLowerCase().includes(search.toLowerCase()))

    return (
        <div style={{ padding: '20px 24px', minHeight: '100vh', background: '#f6f8fc' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#202124', margin: 0 }}>Vehicle Setup</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>Manage manufacturers, models and their default field values</p>
                </div>
                <Btn variant="primary" size="md" onClick={() => setMfgModal({ name: '', country: '' })}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Manufacturer
                </Btn>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>

                    {/* ── Left: Manufacturer list ── */}
                    <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                        <div style={{ padding: '12px', borderBottom: '1px solid #f1f3f4' }}>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search manufacturers…"
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                            {filteredMfg.length === 0 && (
                                <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#9aa0a6' }}>No manufacturers found</div>
                            )}
                            {filteredMfg.map(m => (
                                <div
                                    key={m._id}
                                    onClick={() => setActiveMfg(m)}
                                    style={{
                                        padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f3f4',
                                        background: activeMfg?._id === m._id ? '#e8f0fe' : 'transparent',
                                        borderLeft: activeMfg?._id === m._id ? '3px solid #1a73e8' : '3px solid transparent',
                                        transition: 'all 0.12s',
                                    }}
                                    onMouseEnter={e => { if (activeMfg?._id !== m._id) e.currentTarget.style.background = '#f8f9fa' }}
                                    onMouseLeave={e => { if (activeMfg?._id !== m._id) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: activeMfg?._id === m._id ? '#1a73e8' : '#202124' }}>{m.name}</div>
                                            <div style={{ fontSize: '11px', color: '#9aa0a6', marginTop: '1px' }}>
                                                {[m.country, `${m.models?.length || 0} models`].filter(Boolean).join(' · ')}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setMfgModal({ _id: m._id, name: m.name, country: m.country || '' })}
                                                style={{ padding: '3px', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', borderRadius: '4px' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#1a73e8'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#9aa0a6'}
                                                title="Edit">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => deleteMfg(m._id)}
                                                style={{ padding: '3px', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', borderRadius: '4px' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#c5221f'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#9aa0a6'}
                                                title="Delete">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Models panel ── */}
                    <ModelsPanel
                        manufacturer={activeMfg ? manufacturers.find(m => m._id === activeMfg._id) : null}
                        fields={fields}
                        onAddModel={() => activeMfg && setModelModal({ mfgId: activeMfg._id, name: '', description: '', defaults: {} })}
                        onEditModel={(idx, model) => activeMfg && setModelModal({ mfgId: activeMfg._id, modelIndex: idx, name: model.name, description: model.description || '', defaults: model.defaults || {} })}
                        onDeleteModel={(idx) => activeMfg && deleteModel(activeMfg._id, idx)}
                    />
                </div>
            )}

            {/* ── Manufacturer Modal ── */}
            {mfgModal && (
                <MfgModal
                    data={mfgModal}
                    saving={saving}
                    onSave={saveMfg}
                    onClose={() => setMfgModal(null)}
                />
            )}

            {/* ── Model Modal ── */}
            {modelModal && (
                <ModelModal
                    data={modelModal}
                    fields={fields}
                    saving={saving}
                    onSave={saveModel}
                    onClose={() => setModelModal(null)}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

// ── Models Panel ───────────────────────────────────────────────────────────────
function ModelsPanel({ manufacturer, fields, onAddModel, onEditModel, onDeleteModel }) {
    const [search, setSearch] = useState('')

    if (!manufacturer) return (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👈</div>
            <p style={{ fontSize: '13px', color: '#9aa0a6' }}>Select a manufacturer to manage its models</p>
        </div>
    )

    const models = (manufacturer.models || []).filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    const dropdownFields = fields.filter(f => f.type === 'dropdown' || f.type === 'text' || f.type === 'number')

    return (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {/* Panel header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0, whiteSpace: 'nowrap' }}>
                        {manufacturer.name} — Models
                    </h2>
                    <span style={{ fontSize: '11px', color: '#9aa0a6', background: '#f1f3f4', padding: '2px 8px', borderRadius: '12px' }}>
                        {manufacturer.models?.length || 0}
                    </span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search models…"
                        style={{ padding: '5px 10px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', width: '180px' }}
                    />
                </div>
                <Btn variant="primary" onClick={onAddModel}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Model
                </Btn>
            </div>

            {/* Models grid */}
            <div style={{ padding: '16px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                {models.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9aa0a6', fontSize: '13px' }}>
                        {manufacturer.models?.length === 0 ? 'No models yet — add one above' : 'No models match your search'}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                        {models.map((model, idx) => {
                            const realIdx = manufacturer.models.findIndex(m => m.name === model.name)
                            const defaultCount = Object.keys(model.defaults || {}).length
                            return (
                                <div key={idx} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', background: '#fafafa' }}>
                                    {/* Model card header */}
                                    <div style={{ padding: '10px 12px', background: '#fff', borderBottom: '1px solid #f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#202124' }}>{model.name}</div>
                                            {model.description && <div style={{ fontSize: '11px', color: '#9aa0a6', marginTop: '1px' }}>{model.description}</div>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => onEditModel(realIdx, model)}
                                                title="Edit model & defaults"
                                                style={{ padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#1a73e8', fontWeight: 600 }}>
                                                Edit
                                            </button>
                                            <button onClick={() => onDeleteModel(realIdx)}
                                                title="Delete model"
                                                style={{ padding: '4px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fff5f5', cursor: 'pointer', color: '#c5221f' }}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    {/* Model card body — show defaults */}
                                    <div style={{ padding: '10px 12px' }}>
                                        {defaultCount === 0 ? (
                                            <p style={{ fontSize: '11px', color: '#c4c7c5', fontStyle: 'italic', margin: 0 }}>No defaults set</p>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                                                {Object.entries(model.defaults || {}).map(([fieldId, val]) => {
                                                    const field = fields.find(f => f._id === fieldId)
                                                    if (!field || val === '' || val === undefined) return null
                                                    return (
                                                        <div key={fieldId} style={{ padding: '3px 0', borderBottom: '1px solid #f4f4f4' }}>
                                                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</div>
                                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#202124' }}>{String(val)}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Manufacturer Modal ─────────────────────────────────────────────────────────
function MfgModal({ data, saving, onSave, onClose }) {
    const [form, setForm] = useState({ name: data.name || '', country: data.country || '', _id: data._id })
    return (
        <Modal title={data._id ? 'Edit Manufacturer' : 'Add Manufacturer'} onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Name" required>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Toyota" />
                </Field>
                <Field label="Country">
                    <Select value={form.country || ''} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}>
                        <option value="">Select country...</option>
                        {COUNTRIES.sort((a, b) => a.localeCompare(b)).map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </Field>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <Btn onClick={onClose}>Cancel</Btn>
                    <Btn variant="primary" disabled={!form.name.trim() || saving} onClick={() => onSave(form)}>
                        {saving ? 'Saving…' : data._id ? 'Save Changes' : 'Add Manufacturer'}
                    </Btn>
                </div>
            </div>
        </Modal>
    )
}

// ── Model Modal ────────────────────────────────────────────────────────────────
function ModelModal({ data, fields, saving, onSave, onClose }) {
    const [form, setForm] = useState({
        mfgId:       data.mfgId,
        modelIndex:  data.modelIndex,
        name:        data.name || '',
        description: data.description || '',
        dimensions:  { ...(data.dimensions || {}) },
        defaults:    { ...(data.defaults || {}) },
    })

    // Fields eligible for defaults: exclude file/image/boolean
    const defaultableFields = fields.filter(f =>
        !['file', 'image', 'boolean'].includes(f.type)
        && f.belongsto === 'add-vehicles'
    )

    const setDefault = (fieldId, value) => {
        setForm(p => ({ ...p, defaults: { ...p.defaults, [fieldId]: value } }))
    }

    const clearDefault = (fieldId) => {
        setForm(p => {
            const d = { ...p.defaults }
            delete d[fieldId]
            return { ...p, defaults: d }
        })
    }

    const handleSave = () => {
        // Filter out empty string defaults
        const cleanDefaults = Object.fromEntries(
            Object.entries(form.defaults).filter(([, v]) => v !== '' && v !== null && v !== undefined)
        )
        onSave({ ...form, defaults: cleanDefaults, dimensions: form.dimensions })
    }

    return (
        <Modal title={data.modelIndex !== undefined ? `Edit Model — ${data.name}` : 'Add Model'} onClose={onClose} width="600px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Name & Description */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Model Name" required>
                        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Corolla" />
                    </Field>
                    <Field label="Description">
                        <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Sedan" />
                    </Field>
                </div>

                {/* Default field values */}
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                        Default Field Values
                        <span style={{ marginLeft: '6px', fontSize: '10px', color: '#9aa0a6', fontWeight: 400, textTransform: 'none' }}>
                            — pre-filled when adding a vehicle with this model
                        </span>
                    </div>
                    {defaultableFields.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#9aa0a6', fontStyle: 'italic' }}>
                            No fields configured for "add-vehicles". <a href="/admin/fields" style={{ color: '#1a73e8' }}>Add fields first.</a>
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                            {defaultableFields.map(field => (
                                <div key={field._id}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                        {field.label}
                                        {form.defaults[field._id] !== undefined && form.defaults[field._id] !== '' && (
                                            <button onClick={() => clearDefault(field._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f', fontSize: '9px', padding: '0 2px' }} title="Clear default">✕</button>
                                        )}
                                    </label>
                                    {field.type === 'dropdown' ? (
                                        <Select value={form.defaults[field._id] ?? ''} onChange={e => setDefault(field._id, e.target.value)}>
                                            <option value="">— no default —</option>
                                            {[...(field.options || [])].sort((a, b) => a.localeCompare(b)).map((o, i) => <option key={i} value={o}>{o}</option>)}
                                        </Select>
                                    ) : field.type === 'number' ? (
                                        <Input type="number" value={form.defaults[field._id] ?? ''} onChange={e => setDefault(field._id, e.target.value)} placeholder="Leave blank = no default" />
                                    ) : (
                                        <Input value={form.defaults[field._id] ?? ''} onChange={e => setDefault(field._id, e.target.value)} placeholder="Leave blank = no default" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dimensions & Weight */}
                <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Dimensions & Weight</div>
                    <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                            <Field label="Length">
                                <Input type="number" value={form.dimensions?.length || ''} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, length: e.target.value } }))} placeholder="0" />
                            </Field>
                            <Field label="Width">
                                <Input type="number" value={form.dimensions?.width || ''} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, width: e.target.value } }))} placeholder="0" />
                            </Field>
                            <Field label="Height">
                                <Input type="number" value={form.dimensions?.height || ''} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, height: e.target.value } }))} placeholder="0" />
                            </Field>
                            <Field label="Unit Size">
                                <Select value={form.dimensions?.unit_size || 'cm'} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, unit_size: e.target.value } }))}>
                                    {['cm','m','mm','in','ft'].map(u => <option key={u} value={u}>{u}</option>)}
                                </Select>
                            </Field>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                            <Field label="Weight">
                                <Input type="number" value={form.dimensions?.weight || ''} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, weight: e.target.value } }))} placeholder="0" />
                            </Field>
                            <Field label="Unit Weight">
                                <Select value={form.dimensions?.unit_weight || 'kg'} onChange={e => setForm(p => ({ ...p, dimensions: { ...p.dimensions, unit_weight: e.target.value } }))}>
                                    {['kg','g','lb','oz','t'].map(u => <option key={u} value={u}>{u}</option>)}
                                </Select>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px', borderTop: '1px solid #f1f3f4', marginTop: '4px' }}>
                    <Btn onClick={onClose}>Cancel</Btn>
                    <Btn variant="primary" disabled={!form.name.trim() || saving} onClick={handleSave}>
                        {saving ? 'Saving…' : data.modelIndex !== undefined ? 'Save Changes' : 'Add Model'}
                    </Btn>
                </div>
            </div>
        </Modal>
    )
}
