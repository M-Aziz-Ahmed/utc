'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import VehicleCard from '@/components/public/VehicleCard'
import VehicleRow from '@/components/public/VehicleRow'

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest First' },
  { value: 'mileage_asc', label: 'Mileage: Low to High' },
]

const DEFAULT_FILTERS = {
  make: '',
  model: '',
  yearFrom: '',
  yearTo: '',
  minPrice: '',
  maxPrice: '',
  fuelType: '',
  transmission: '',
  bodyType: '',
  driveType: '',
}

export default function StockPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [vehicles, setVehicles] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filterOptions, setFilterOptions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return localStorage.getItem('stock_view') || 'grid'
    }
    return 'grid'
  })

  const [filters, setFilters] = useState(() => {
    const initial = { ...DEFAULT_FILTERS }
    for (const key of Object.keys(DEFAULT_FILTERS)) {
      const val = searchParams.get(key)
      if (val) initial[key] = val
    }
    return initial
  })

  const [sort, setSort] = useState(searchParams.get('sort') || 'latest')
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)

  const buildQueryString = useCallback((f, s, p) => {
    const params = new URLSearchParams()
    params.set('page', p.toString())
    params.set('limit', '20')
    params.set('sort', s)
    for (const [key, value] of Object.entries(f)) {
      if (value) params.set(key, value)
    }
    return params.toString()
  }, [])

  const fetchVehicles = useCallback(async (f, s, p) => {
    setLoading(true)
    try {
      const qs = buildQueryString(f, s, p)
      const res = await fetch(`/api/public/vehicles?${qs}`)
      const data = await res.json()
      setVehicles(data.vehicles || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch {
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [buildQueryString])

  useEffect(() => {
    async function loadFilters() {
      setFiltersLoading(true)
      try {
        const res = await fetch('/api/public/vehicles/filters')
        const data = await res.json()
        setFilterOptions(data)
      } catch {
        setFilterOptions(null)
      } finally {
        setFiltersLoading(false)
      }
    }
    loadFilters()
  }, [])

  useEffect(() => {
    fetchVehicles(filters, sort, page)
    const qs = buildQueryString(filters, sort, page)
    router.replace(`/stock?${qs}`, { scroll: false })
  }, [filters, sort, page, fetchVehicles, router, buildQueryString])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleApplyFilters = () => {
    setPage(1)
    setMobileFilterOpen(false)
  }

  const handleClearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS })
    setPage(1)
    setMobileFilterOpen(false)
  }

  const handleSortChange = (e) => {
    setSort(e.target.value)
    setPage(1)
  }

  const switchView = (mode) => {
    setViewMode(mode)
    if (typeof document !== 'undefined') {
      localStorage.setItem('stock_view', mode)
    }
  }

  const renderPagination = () => {
    const { totalPages, page: currentPage } = pagination
    if (totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)

    if (start > 1) {
      pages.push(
        <button key="1" onClick={() => setPage(1)}>1</button>
      )
      if (start > 2) pages.push(<span key="dots1">...</span>)
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} className={i === currentPage ? 'active' : ''} onClick={() => setPage(i)}>{i}</button>
      )
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="dots2">...</span>)
      pages.push(
        <button key={totalPages} onClick={() => setPage(totalPages)}>{totalPages}</button>
      )
    }

    return (
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>&#8249;</button>
        {pages}
        <button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>&#8250;</button>
      </div>
    )
  }

  const sidebar = (
    <div className="filter-card">
      <h3>Filter Vehicles</h3>

      <div className="filter-group">
        <label>Make</label>
        <select value={filters.make} onChange={e => handleFilterChange('make', e.target.value)}>
          <option value="">All Makes</option>
          {filterOptions?.makes?.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Model</label>
        <input
          type="text"
          placeholder="Search model..."
          value={filters.model}
          onChange={e => handleFilterChange('model', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Year Range</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <select value={filters.yearFrom} onChange={e => handleFilterChange('yearFrom', e.target.value)}>
            <option value="">From</option>
            {filterOptions?.minYear && Array.from({ length: (new Date().getFullYear()) - filterOptions.minYear + 1 }, (_, i) => filterOptions.minYear + i).reverse().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={filters.yearTo} onChange={e => handleFilterChange('yearTo', e.target.value)}>
            <option value="">To</option>
            {filterOptions?.maxYear && Array.from({ length: (new Date().getFullYear()) - filterOptions.minYear + 1 }, (_, i) => filterOptions.minYear + i).reverse().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-group">
        <label>Price Range (USD)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={e => handleFilterChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={e => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Fuel Type</label>
        <select value={filters.fuelType} onChange={e => handleFilterChange('fuelType', e.target.value)}>
          <option value="">All Fuel Types</option>
          {filterOptions?.fuelTypes?.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Transmission</label>
        <select value={filters.transmission} onChange={e => handleFilterChange('transmission', e.target.value)}>
          <option value="">All Transmissions</option>
          {filterOptions?.transmissions?.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Body Type</label>
        <select value={filters.bodyType} onChange={e => handleFilterChange('bodyType', e.target.value)}>
          <option value="">All Body Types</option>
          {filterOptions?.bodyTypes?.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Drive Type</label>
        <select value={filters.driveType} onChange={e => handleFilterChange('driveType', e.target.value)}>
          <option value="">All Drive Types</option>
          {filterOptions?.driveTypes?.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="btn-primary" onClick={handleApplyFilters} style={{ flex: 1 }}>Apply Filters</button>
        <button className="btn-outline" onClick={handleClearFilters} style={{ flex: 1 }}>Clear All</button>
      </div>
    </div>
  )

  return (
    <div className="stock-page">
      <div className="page-header">
        <div className="utc-container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">&#8250;</span>
            <span className="current">Browse Our Stock</span>
          </div>
          <h1>Browse Our Stock</h1>
          <p>Explore our extensive inventory of quality Japanese vehicles ready for worldwide export</p>
        </div>
      </div>

      <div className="utc-container" style={{ paddingTop: 32 }}>
        <div className="stock-layout">
          <aside className={`stock-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            {mobileFilterOpen && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#374151' }}
                >
                  &#10005;
                </button>
              </div>
            )}
            {filtersLoading ? (
              <div className="filter-card">
                <div className="loading-spinner" style={{ padding: '40px 0' }}>
                  <div className="spinner"></div>
                </div>
              </div>
            ) : (
              sidebar
            )}
          </aside>

          <div className="stock-main">
            <div className="stock-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button className="mobile-filter-btn" onClick={() => setMobileFilterOpen(true)}>
                  &#9776; Filters
                </button>
                <div className="stock-count">
                  Showing <strong>{vehicles.length}</strong> of <strong>{pagination.total}</strong> vehicles
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="stock-view-toggle">
                  <button
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => switchView('grid')}
                    title="Grid View"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                    </svg>
                  </button>
                  <button
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => switchView('list')}
                    title="List View"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                    </svg>
                  </button>
                </div>
                <div className="stock-sort">
                  <select value={sort} onChange={handleSortChange}>
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="stock-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="vehicle-card" style={{ overflow: 'hidden' }}>
                    <div className="skeleton" style={{ height: 200 }}></div>
                    <div style={{ padding: 20 }}>
                      <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 12 }}></div>
                      <div className="skeleton" style={{ height: 28, width: '40%', marginBottom: 12 }}></div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                        <div className="skeleton" style={{ height: 36 }}></div>
                        <div className="skeleton" style={{ height: 36 }}></div>
                        <div className="skeleton" style={{ height: 36 }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#128270;</div>
                <h3>No vehicles found</h3>
                <p>Try adjusting your filters or search criteria to find more vehicles.</p>
                <button className="btn-primary" onClick={handleClearFilters} style={{ marginTop: 16 }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="stock-grid">
                    {vehicles.map(vehicle => (
                      <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} />
                    ))}
                  </div>
                ) : (
                  <div className="stock-list">
                    {vehicles.map(vehicle => (
                      <VehicleRow key={vehicle.vehicleId} vehicle={vehicle} />
                    ))}
                  </div>
                )}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
