'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceSearchButton from '@/components/VoiceSearchButton'

export default function SearchPanel() {
  const router = useRouter()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [form, setForm] = useState({
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    driveType: '',
  })

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (form.make) params.set('make', form.make)
    if (form.model) params.set('model', form.model)
    if (form.yearFrom) params.set('yearFrom', form.yearFrom)
    if (form.yearTo) params.set('yearTo', form.yearTo)
    if (form.priceFrom) params.set('priceFrom', form.priceFrom)
    if (form.priceTo) params.set('priceTo', form.priceTo)
    if (form.fuelType) params.set('fuelType', form.fuelType)
    if (form.transmission) params.set('transmission', form.transmission)
    if (form.bodyType) params.set('bodyType', form.bodyType)
    if (form.driveType) params.set('driveType', form.driveType)
    router.push(`/stock?${params.toString()}`)
  }

  const makes = ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Daihatsu', 'Lexus', 'Infiniti']
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
  const transmissions = ['Automatic', 'Manual', 'CVT']
  const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Wagon', 'Van', 'Truck', 'Pickup']
  const driveTypes = ['4WD', '2WD', 'AWD', 'FWD', 'RWD']
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <div className="search-panel">
      <div className="utc-container">
        <div className="search-card">
          <h3 className="search-card-title">Search Our Inventory</h3>
          <form onSubmit={handleSearch}>
            <div className="search-form">
              <div className="form-group">
                <label>Make</label>
                <select value={form.make} onChange={(e) => updateField('make', e.target.value)}>
                  <option value="">All Makes</option>
                  {makes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Model</label>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <input
                      type="text"
                      placeholder="e.g. Corolla"
                      value={form.model}
                      onChange={(e) => updateField('model', e.target.value)}
                      style={{flex:1}}
                    />
                    <VoiceSearchButton onResult={(text) => updateField('model', form.model ? `${form.model} ${text}` : text)} size={28} />
                </div>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select value={form.yearFrom} onChange={(e) => updateField('yearFrom', e.target.value)}>
                  <option value="">From</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price Range</label>
                <select value={form.priceTo} onChange={(e) => updateField('priceTo', e.target.value)}>
                  <option value="">Any Price</option>
                  <option value="5000">Under $5,000</option>
                  <option value="10000">Under $10,000</option>
                  <option value="15000">Under $15,000</option>
                  <option value="20000">Under $20,000</option>
                  <option value="30000">Under $30,000</option>
                  <option value="50000">Under $50,000</option>
                </select>
              </div>
              <button type="submit" className="search-btn">SEARCH</button>
            </div>

            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '&#9650;' : '&#9660;'} Advanced Search
            </button>

            <div className={`advanced-search ${showAdvanced ? 'open' : ''}`}>
              <div className="advanced-grid">
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select value={form.fuelType} onChange={(e) => updateField('fuelType', e.target.value)}>
                    <option value="">All Fuel Types</option>
                    {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Transmission</label>
                  <select value={form.transmission} onChange={(e) => updateField('transmission', e.target.value)}>
                    <option value="">All Transmissions</option>
                    {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Body Type</label>
                  <select value={form.bodyType} onChange={(e) => updateField('bodyType', e.target.value)}>
                    <option value="">All Body Types</option>
                    {bodyTypes.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Drive Type</label>
                  <select value={form.driveType} onChange={(e) => updateField('driveType', e.target.value)}>
                    <option value="">All Drive Types</option>
                    {driveTypes.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
