'use client';
import { useState, useEffect } from "react";
import GetAllFields from "@/components/fields/GetAllFields";

const FIELD_TYPES = ["text", "number", "boolean", "password", "email", "date", "file", "image", "dropdown", "select-year", "select-country", "tax", "sum"];

const Page = () => {
    const [label, setLabel] = useState("");
    const [type, setType] = useState("text");
    const [isRequired, setIsRequired] = useState(false);
    const [belongsto, setBelongsto] = useState("");
    const [message, setMessage] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [forms, setForms] = useState([]);
    const [showNewFormModal, setShowNewFormModal] = useState(false);
    const [newFormName, setNewFormName] = useState("");
    const [creatingForm, setCreatingForm] = useState(false);
    
    // Dropdown options state
    const [dropdownOptions, setDropdownOptions] = useState([""]);
    const [newOption, setNewOption] = useState("");
    const [taxes, setTaxes] = useState([]);
    const [linkedTax, setLinkedTax] = useState("");
    const [linkedField, setLinkedField] = useState("");
    const [linkedFields, setLinkedFields] = useState([]);
    const [allFields, setAllFields] = useState([]);
    const [vehicleField, setVehicleField] = useState("");

    // Fetch unique forms from fields
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const res = await fetch('/api/fields');
                if (!res.ok) throw new Error('Failed to load fields');
                const data = await res.json();
                
                // Extract unique form names
                const uniqueForms = [...new Set(data.map(f => f.belongsto).filter(Boolean))];
                setForms(uniqueForms.sort());
                setAllFields(data);
            } catch (e) {
                console.error('Error fetching forms:', e);
            }
        };
        fetchForms();
    }, [refreshKey]);

    // Fetch taxes
    useEffect(() => {
        const fetchTaxes = async () => {
            try {
                const res = await fetch('/api/tax');
                if (res.ok) setTaxes(await res.json());
            } catch (e) {
                console.error('Error fetching taxes:', e);
            }
        };
        fetchTaxes();
    }, []);

    const handleCreateForm = async (e) => {
        e.preventDefault();
        if (!newFormName.trim()) return;
        
        setCreatingForm(true);
        try {
            // Add the new form to the list
            const formName = newFormName.trim();
            if (!forms.includes(formName)) {
                setForms(prev => [...prev, formName].sort());
            }
            setBelongsto(formName);
            setShowNewFormModal(false);
            setNewFormName("");
        } catch (e) {
            alert('Error creating form');
        } finally {
            setCreatingForm(false);
        }
    };

    const addDropdownOption = () => {
        if (newOption.trim()) {
            setDropdownOptions(prev => [...prev, newOption.trim()]);
            setNewOption("");
        }
    };

    const removeDropdownOption = (index) => {
        setDropdownOptions(prev => prev.filter((_, i) => i !== index));
    };

    const updateDropdownOption = (index, value) => {
        setDropdownOptions(prev => prev.map((opt, i) => i === index ? value : opt));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const fieldData = { 
                label, 
                type, 
                isRequired, 
                belongsto: belongsto.trim() || undefined 
            };
            
            // Add dropdown options if type is dropdown
            if (type === 'dropdown') {
                const validOptions = dropdownOptions.filter(opt => opt.trim() !== '');
                if (validOptions.length === 0) {
                    throw new Error('Please add at least one option for the dropdown');
                }
                fieldData.options = validOptions;
            }

            // Auto-generate options for select-year
            if (type === 'select-year') {
                const currentYear = new Date().getFullYear();
                const years = [];
                for (let y = currentYear; y >= 1950; y--) {
                    years.push(String(y));
                }
                fieldData.options = years;
            }

            // Auto-generate options for select-country
            if (type === 'select-country') {
                fieldData.options = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].sort((a, b) => a.localeCompare(b));
            }

            // Add linked tax if type is tax
            if (type === 'tax' && linkedTax) {
                fieldData.linkedTax = linkedTax;
                fieldData.linkedField = linkedField;
            }

            // Add linked fields if type is sum
            if (type === 'sum' && linkedFields.length > 0) {
                fieldData.linkedFields = linkedFields;
            }

            // Add vehicle field linking
            if (vehicleField) {
                fieldData.vehicleField = vehicleField;
            }
            
            const res = await fetch('/api/newField', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Error creating field');
            setMessage({ type: 'success', text: data.message || 'Field created successfully' });
            setLabel('');
            setType('text');
            setIsRequired(false);
            setBelongsto('');
            setDropdownOptions(['']);
            setNewOption('');
            setLinkedTax('');
            setLinkedField('');
            setLinkedFields([]);
            setVehicleField('');
            setRefreshKey((k) => k + 1);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-6 px-6" style={{background:'#f6f8fc'}}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'var(--accent)', flexShrink:0}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                        <h1 className="font-medium" style={{fontSize:'var(--text-2xl)', color:'#202124'}}>Dynamic Fields</h1>
                        <p style={{fontSize:'var(--text-sm)', color:'#5f6368', marginTop:'2px'}}>Create and manage custom fields for your forms.</p>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Create Field Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6" style={{background:'#fff', borderRadius:'8px', border:'1px solid #e0e0e0', padding:'20px'}}>
                            <div className="mb-5">
                                <h2 className="font-medium" style={{fontSize:'var(--text-lg)', color:'#202124'}}>New Field</h2>
                                <p style={{fontSize:'var(--text-xs)', color:'#5f6368', marginTop:'2px'}}>Fill in the details to add a new dynamic field.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Label */}
                            <div>
                                <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                    LABEL <span style={{color:'#c5221f'}}>*</span>
                                </label>
                                <input
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    type="text"
                                    required
                                    placeholder="e.g. First Name"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                    TYPE
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        // Reset dropdown options when changing type
                                        if (e.target.value !== 'dropdown') {
                                            setDropdownOptions(['']);
                                            setNewOption('');
                                        }
                                    }}
                                >
                                    {FIELD_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dropdown Options - Only show if type is dropdown */}
                            {type === 'dropdown' && (
                                <div style={{border:'1px solid #d2e3fc', borderRadius:'8px', padding:'12px', background:'rgba(232,240,254,0.3)'}}>
                                    <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Dropdown Options
                                    </label>
                                    
                                    {/* Existing Options */}
                                    <div className="space-y-2 mb-3">
                                        {dropdownOptions.map((option, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateDropdownOption(index, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    style={{flex:1}}
                                                />
                                                {dropdownOptions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDropdownOption(index)}
                                                        style={{padding:'6px', color:'#c5221f', borderRadius:'6px', background:'transparent', border:'none', cursor:'pointer', flexShrink:0}}
                                                        title="Remove option"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add New Option */}
                                    <div className="flex items-center gap-2 pt-2" style={{borderTop:'1px solid #d2e3fc'}}>
                                        <input
                                            type="text"
                                            value={newOption}
                                            onChange={(e) => setNewOption(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addDropdownOption();
                                                }
                                            }}
                                            placeholder="Type new option..."
                                            style={{flex:1}}
                                        />
                                        <button
                                            type="button"
                                            onClick={addDropdownOption}
                                            className="flex items-center gap-1 shrink-0"
                                            style={{padding:'6px 12px', background:'var(--accent)', color:'#fff', borderRadius:'6px', fontSize:'var(--text-sm)', fontWeight:600}}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add
                                        </button>
                                    </div>

                                    <p style={{fontSize:'var(--text-xs)', color:'#9aa0a6', marginTop:'6px', fontStyle:'italic'}}>
                                        Press Enter or click Add to add a new option
                                    </p>
                                </div>
                            )}

                            {/* Auto-generated years preview */}
                            {type === 'select-year' && (
                                <div style={{border:'1px solid #d2e3fc', borderRadius:'8px', padding:'12px', background:'rgba(232,240,254,0.3)'}}>
                                    <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Auto-generated Years
                                    </label>
                                    <div style={{fontSize:'var(--text-xs)', color:'#5f6368'}}>
                                        Options will be years from <strong>{new Date().getFullYear()}</strong> down to <strong>1950</strong> in descending order.
                                    </div>
                                    <p style={{fontSize:'var(--text-xs)', color:'#9aa0a6', marginTop:'6px', fontStyle:'italic'}}>
                                        Options are generated automatically — no manual entry needed.
                                    </p>
                                </div>
                            )}

                            {/* Auto-generated countries preview */}
                            {type === 'select-country' && (
                                <div style={{border:'1px solid #d2e3fc', borderRadius:'8px', padding:'12px', background:'rgba(232,240,254,0.3)'}}>
                                    <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Auto-generated Countries
                                    </label>
                                    <div style={{fontSize:'var(--text-xs)', color:'#5f6368'}}>
                                        Options will include <strong>195 countries</strong> sorted alphabetically A-Z.
                                    </div>
                                    <p style={{fontSize:'var(--text-xs)', color:'#9aa0a6', marginTop:'6px', fontStyle:'italic'}}>
                                        Options are generated automatically — no manual entry needed.
                                    </p>
                                </div>
                            )}

                            {/* Linked Tax - Only show if type is tax */}
                            {type === 'tax' && (
                                <div style={{border:'1px solid #d2e3fc', borderRadius:'8px', padding:'12px', background:'rgba(232,240,254,0.3)'}}>
                                    <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Link Tax
                                    </label>
                                    <select
                                        value={linkedTax}
                                        onChange={(e) => setLinkedTax(e.target.value)}
                                        style={{width:'100%', padding:'7px 10px', border:'1px solid #c4c7c5', borderRadius:'4px', fontSize:'13px', color:'#202124', outline:'none', background:'#fff'}}
                                    >
                                        <option value="">Select a tax...</option>
                                        {taxes.filter(t => t.active).map((t) => (
                                            <option key={t._id} value={t._id}>
                                                {t.name} ({t.type === 'percentage' ? `${t.rate}%` : `$${t.rate}`})
                                            </option>
                                        ))}
                                    </select>
                                    {taxes.filter(t => t.active).length === 0 && (
                                        <p style={{fontSize:'var(--text-xs)', color:'#9aa0a6', marginTop:'6px', fontStyle:'italic'}}>
                                            No active taxes found. <a href="/admin/setup/tax" style={{color:'var(--accent)'}}>Create taxes first</a>
                                        </p>
                                    )}
                                    <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'6px', marginTop:'10px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Calculate from field
                                    </label>
                                    <select
                                        value={linkedField}
                                        onChange={(e) => setLinkedField(e.target.value)}
                                        style={{width:'100%', padding:'7px 10px', border:'1px solid #c4c7c5', borderRadius:'4px', fontSize:'13px', color:'#202124', outline:'none', background:'#fff'}}
                                    >
                                        <option value="">Select source field...</option>
                                        {allFields.filter(f => f.type === 'number' || f.type === 'text').map((f) => (
                                            <option key={f._id} value={f.label}>
                                                {f.label} {f.belongsto ? `(${f.belongsto})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Sum fields - Only show if type is sum */}
                            {type === 'sum' && (
                                <div style={{border:'1px solid #ddd6fe', borderRadius:'8px', padding:'12px', background:'rgba(238,242,255,0.5)'}}>
                                    <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Fields to Sum
                                    </label>
                                    <p style={{fontSize:'var(--text-xs)', color:'#9aa0a6', marginBottom:'8px'}}>
                                        Select the fields whose values should be added together.
                                    </p>
                                    <div style={{display:'flex', flexDirection:'column', gap:'4px', maxHeight:'180px', overflowY:'auto', padding:'4px', background:'#fff', borderRadius:'6px', border:'1px solid #e0e0e0'}}>
                                        {allFields.filter(f => f.type === 'number' || f.type === 'text' || f.type === 'tax' || f.type === 'sum').map((f) => (
                                            <label key={f._id} style={{display:'flex', alignItems:'center', gap:'6px', padding:'4px 8px', borderRadius:'4px', cursor:'pointer', fontSize:'12px', color:'#202124', background: linkedFields.includes(f.label) ? '#ede9fe' : 'transparent', border: linkedFields.includes(f.label) ? '1px solid #c4b5fd' : '1px solid transparent', transition:'all 0.15s'}}>
                                                <input
                                                    type="checkbox"
                                                    checked={linkedFields.includes(f.label)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setLinkedFields(prev => [...prev, f.label]);
                                                        } else {
                                                            setLinkedFields(prev => prev.filter(l => l !== f.label));
                                                        }
                                                    }}
                                                    style={{accentColor:'#7c3aed'}}
                                                />
                                                <span style={{fontWeight:500}}>{f.label}</span>
                                                <span style={{fontSize:'10px', color:'#9aa0a6', marginLeft:'auto'}}>{f.type}{f.belongsto ? ` (${f.belongsto})` : ''}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {linkedFields.length > 0 && (
                                        <p style={{fontSize:'var(--text-xs)', color:'#7c3aed', marginTop:'6px', fontWeight:500}}>
                                            Summing {linkedFields.length} field{linkedFields.length > 1 ? 's' : ''}: {linkedFields.join(' + ')}
                                        </p>
                                    )}
                                    {allFields.filter(f => f.type === 'number' || f.type === 'text' || f.type === 'tax' || f.type === 'sum').length === 0 && (
                                        <p style={{fontSize:'var(--text-xs)', color:'#9aa0a6', fontStyle:'italic'}}>
                                            No numeric or text fields available. Create number/tax fields first.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Is Required */}
                            <div>
                                <span style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                    REQUIRED?
                                </span>
                                <div className="flex gap-3">
                                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label: optLabel, value }) => (
                                        <label
                                            key={String(value)}
                                            style={{
                                                display:'flex', alignItems:'center', gap:'6px', cursor:'pointer',
                                                padding:'6px 14px', borderRadius:'20px', fontSize:'var(--text-sm)', fontWeight:500,
                                                border: isRequired === value ? '1px solid var(--accent)' : '1px solid #e0e0e0',
                                                background: isRequired === value ? '#e8f0fe' : '#fff',
                                                color: isRequired === value ? '#1a73e8' : '#5f6368',
                                                transition:'all 0.15s',
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="isRequired"
                                                className="sr-only"
                                                checked={isRequired === value}
                                                onChange={() => setIsRequired(value)}
                                            />
                                            {optLabel}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Belongs To Form - Dropdown */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label style={{fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Belongs to form
                                        <span style={{marginLeft:'4px', color:'#9aa0a6', fontWeight:400, textTransform:'none', letterSpacing:'normal'}}>(optional)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewFormModal(true)}
                                        className="flex items-center gap-1"
                                        style={{fontSize:'var(--text-xs)', color:'var(--accent)', fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0}}
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        + Add New
                                    </button>
                                </div>
                                <select
                                    value={belongsto}
                                    onChange={(e) => setBelongsto(e.target.value)}
                                >
                                    <option value="">Select a form...</option>
                                    {forms.map((form) => (
                                        <option key={form} value={form}>{form}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Link to Vehicle DB Field */}
                            {type !== 'file' && type !== 'image' && (
                                <div style={{border:'1px solid #d1fae5', borderRadius:'8px', padding:'12px', background:'rgba(209,250,229,0.3)'}}>
                                    <label style={{display:'block', fontSize:'var(--text-xs)', fontWeight:600, color:'#5f6368', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                                        Link to Vehicle DB Field
                                        <span style={{marginLeft:'4px', color:'#9aa0a6', fontWeight:400, textTransform:'none', letterSpacing:'normal'}}>(optional)</span>
                                    </label>
                                    <p style={{fontSize:'var(--text-xs)', color:'#9aa0a6', marginBottom:'8px'}}>
                                        Auto-fill this field from the vehicle's database value. Field will be read-only.
                                    </p>
                                    <select
                                        value={vehicleField}
                                        onChange={(e) => setVehicleField(e.target.value)}
                                        style={{width:'100%', padding:'7px 10px', border:'1px solid #86efac', borderRadius:'4px', fontSize:'13px', color:'#202124', outline:'none', background:'#fff'}}
                                    >
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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2"
                                style={{
                                    padding:'8px 16px', borderRadius:'20px', fontSize:'var(--text-sm)', fontWeight:600,
                                    color:'#fff', background: loading ? '#9aa0a6' : 'var(--accent)',
                                    cursor: loading ? 'not-allowed' : 'pointer', border:'none',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Creating…
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Field
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Feedback message */}
                        {message && (
                            <div className="mt-4 flex items-start gap-2" style={{
                                borderRadius:'8px', padding:'10px 14px', fontSize:'var(--text-sm)',
                                background: message.type === 'error' ? '#fce8e6' : '#e6f4ea',
                                color: message.type === 'error' ? '#c5221f' : '#137333',
                                border: `1px solid ${message.type === 'error' ? '#f5c6c2' : '#b7dfbe'}`,
                            }}>
                                {message.type === 'error' ? (
                                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {message.text}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Fields List with Search and Filters */}
                    <div className="lg:col-span-2">
                        <div style={{background:'#fff', borderRadius:'8px', border:'1px solid #e0e0e0', padding:'20px'}}>
                            <div className="mb-5">
                                <h2 className="font-medium" style={{fontSize:'var(--text-lg)', color:'#202124'}}>Existing Fields</h2>
                                <p style={{fontSize:'var(--text-xs)', color:'#5f6368', marginTop:'2px'}}>All dynamic fields currently in the system.</p>
                            </div>
                            <GetAllFields refreshKey={refreshKey} forms={forms} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Form Modal */}
            {showNewFormModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    style={{background:'rgba(0,0,0,0.5)'}}
                    onClick={() => setShowNewFormModal(false)}>
                    <div style={{background:'#fff', borderRadius:'12px', boxShadow:'0 8px 32px rgba(0,0,0,0.18)', maxWidth:'440px', width:'100%', padding:'24px'}}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-medium" style={{fontSize:'var(--text-lg)', color:'#202124'}}>Add New Form</h3>
                            <button
                                onClick={() => setShowNewFormModal(false)}
                                style={{padding:'6px', color:'#5f6368', background:'transparent', border:'none', cursor:'pointer', borderRadius:'50%'}}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateForm}>
                            <div className="mb-4">
                                <label style={{display:'block', fontSize:'var(--text-sm)', fontWeight:500, color:'#202124', marginBottom:'6px'}}>Form Name</label>
                                <input
                                    type="text"
                                    value={newFormName}
                                    onChange={(e) => setNewFormName(e.target.value)}
                                    placeholder="e.g. registration, checkout, add-vehicles"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNewFormModal(false)}
                                    style={{flex:1, padding:'8px 16px', background:'#f1f3f4', color:'#444746', fontWeight:600, borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'var(--text-sm)'}}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingForm}
                                    style={{flex:1, padding:'8px 16px', background:'var(--accent)', color:'#fff', fontWeight:600, borderRadius:'20px', border:'none', cursor: creatingForm ? 'not-allowed' : 'pointer', fontSize:'var(--text-sm)', opacity: creatingForm ? 0.7 : 1}}
                                >
                                    {creatingForm ? 'Creating...' : 'Create Form'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
