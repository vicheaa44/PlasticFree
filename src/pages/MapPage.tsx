import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Btn } from '../components/Btn'
import { MapView, type MapLabels } from '../components/MapView'
import { PageHeader } from '../components/PageHeader'
import { Wrap } from '../components/SectionTitle'
import { LAYER_COLORS } from '../constants/layers'
import { usePlastic } from '../context/plastic'
import { useLanguage } from '../i18n/LanguageContext'
import { formatNumber } from '../utils/format'
import { acceptsPlastic, fetchSpots, geocode, groupByLayer, LAYERS, type LayerId, type Place, type Spot } from '../utils/map'

const DEFAULT_PLACE: Place = { lat: 47.0105, lon: 28.8638, label: 'Chișinău' }
const RADII = [3000, 6000, 12000]
const LIST_LIMIT = 80

type Status = 'loading' | 'ok' | 'error'

const EMPTY: Record<LayerId, Spot[]> = { recycling: [], bulk: [], water: [] }

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template)
}

export function MapPage() {
  const { t, lang } = useLanguage()
  const { spots: mySpots, addSpot, removeSpot } = usePlastic()
  const m = t.map

  const [place, setPlace] = useState<Place>(DEFAULT_PLACE)
  const [query, setQuery] = useState('')
  const [radius, setRadius] = useState(6000)
  const [enabled, setEnabled] = useState<Record<LayerId, boolean>>({ recycling: true, bulk: true, water: true })
  const [plasticOnly, setPlasticOnly] = useState(false)
  const [loaded, setLoaded] = useState<{ key: string; spots: Spot[] | null } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addMode, setAddMode] = useState(false)
  const [pending, setPending] = useState<{ lat: number; lon: number } | null>(null)
  const [newName, setNewName] = useState('')
  const [newLayer, setNewLayer] = useState<LayerId>('bulk')

  // Results belong to the search they were fetched for; anything else counts as still loading.
  const requestKey = `${place.lat},${place.lon},${radius}`
  const current = loaded?.key === requestKey ? loaded : null
  const status: Status = !current ? 'loading' : current.spots === null ? 'error' : 'ok'
  const data = useMemo(() => (current?.spots ? groupByLayer(current.spots) : EMPTY), [current])

  useEffect(() => {
    const controller = new AbortController()
    const key = `${place.lat},${place.lon},${radius}`
    fetchSpots(place.lat, place.lon, radius, controller.signal)
      .then((spots) => setLoaded({ key, spots }))
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ key, spots: null })
      })
    return () => controller.abort()
  }, [place, radius])

  const visible = useMemo(() => {
    const out: Spot[] = []
    for (const layer of LAYERS) {
      if (!enabled[layer]) continue
      for (const spot of data[layer]) {
        if (layer === 'recycling' && plasticOnly && !acceptsPlastic(spot.materials)) continue
        out.push(spot)
      }
    }
    return out.sort((a, b) => a.distanceKm - b.distanceKm)
  }, [data, enabled, plasticOnly])

  const labels = useMemo<MapLabels>(
    () => ({ unnamed: m.unnamed, openOsm: m.openOsm, accepts: m.accepts, layers: m.layers, materials: m.materials, away: (km) => fill(m.away, { km }) }),
    [m],
  )

  async function onSearch(event: FormEvent) {
    event.preventDefault()
    const text = query.trim()
    if (!text) return
    setSearching(true)
    setMessage(null)
    try {
      const found = await geocode(text, lang)
      if (found) {
        setPlace(found)
        setSelectedId(null)
      } else {
        setMessage(m.errorSearch)
      }
    } catch {
      setMessage(m.errorLoad)
    } finally {
      setSearching(false)
    }
  }

  function onLocate() {
    if (!navigator.geolocation) {
      setMessage(m.errorLocate)
      return
    }
    setLocating(true)
    setMessage(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPlace({ lat: position.coords.latitude, lon: position.coords.longitude, label: '' })
        setSelectedId(null)
        setLocating(false)
      },
      () => {
        setMessage(m.errorLocate)
        setLocating(false)
      },
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  function saveSpot(event: FormEvent) {
    event.preventDefault()
    if (!pending || !newName.trim()) return
    addSpot({ layer: newLayer, lat: pending.lat, lon: pending.lon, name: newName.trim() })
    setPending(null)
    setNewName('')
    setAddMode(false)
  }

  function cancelAdd() {
    setPending(null)
    setNewName('')
    setAddMode(false)
  }

  const emptyText = { recycling: m.emptyRecycling, bulk: m.emptyBulk, water: m.emptyWater }
  const emptyLayers = status === 'ok' ? LAYERS.filter((layer) => enabled[layer] && data[layer].length === 0 && !(layer === 'recycling' && plasticOnly && data[layer].length > 0)) : []

  return (
    <div>
      <PageHeader eyebrow={m.eyebrow} title={m.title} sub={m.sub} />

      <Wrap className="pt-2">
        <form onSubmit={onSearch} className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={m.searchPlaceholder}
            aria-label={m.searchPlaceholder}
            className="min-w-[12rem] flex-1 rounded-[4px] bg-card px-4 py-3 text-[0.95rem] text-white placeholder:text-white/35 focus:outline-brand"
          />
          <Btn type="submit" variant="blue" disabled={searching || !query.trim()}>
            {searching ? '…' : m.search}
          </Btn>
          <Btn variant="ghost" onClick={onLocate} disabled={locating}>
            {locating ? m.locating : m.locate}
          </Btn>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {LAYERS.map((layer) => (
            <button
              key={layer}
              type="button"
              aria-pressed={enabled[layer]}
              onClick={() => setEnabled((e) => ({ ...e, [layer]: !e[layer] }))}
              className={`flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm transition-colors ${enabled[layer] ? 'bg-white text-black' : 'bg-card text-white/55 hover:text-white'}`}
            >
              <span className="h-2.5 w-2.5 border border-black/40" style={{ background: LAYER_COLORS[layer] }} />
              {m.layers[layer]}
              <span className="font-mono text-[0.68rem] opacity-60">{status === 'ok' ? data[layer].length : '–'}</span>
            </button>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded-[4px] bg-card px-3 py-2 text-sm text-white/70">
            <input type="checkbox" checked={plasticOnly} onChange={(event) => setPlasticOnly(event.target.checked)} className="accent-brand" />
            {m.plasticOnly}
          </label>
          <label className="ml-auto flex items-center gap-2 text-sm text-white/55">
            {m.radius}
            <select
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="rounded-[4px] bg-card px-2 py-2 font-mono text-xs text-white"
            >
              {RADII.map((r) => (
                <option key={r} value={r}>
                  {r / 1000} km
                </option>
              ))}
            </select>
          </label>
        </div>

        {message && <p className="mt-3 rounded-[4px] bg-card px-4 py-3 text-sm text-white/80">{message}</p>}
        {status === 'error' && <p className="mt-3 rounded-[4px] bg-card px-4 py-3 text-sm text-white/80">{m.errorLoad}</p>}
      </Wrap>

      <Wrap className="grid gap-3 pt-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative h-[28rem] overflow-hidden rounded-[2px] border border-white/15 lg:h-[36rem]">
          <MapView
            center={place}
            radiusM={radius}
            spots={visible}
            mySpots={mySpots}
            selectedId={selectedId}
            addMode={addMode}
            pending={pending}
            onMapClick={(lat, lon) => setPending({ lat, lon })}
            labels={labels}
          />
          {status === 'loading' && <p className="pointer-events-none absolute left-3 top-3 z-[500] rounded-[4px] bg-black/80 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.05em]">{m.loading}</p>}
        </div>

        <div className="flex max-h-[36rem] flex-col gap-3 overflow-hidden">
          <div className="rounded-[4px] bg-card p-4">
            {!addMode ? (
              <Btn variant="ghost" onClick={() => setAddMode(true)} className="w-full">
                + {m.addMode}
              </Btn>
            ) : (
              <form onSubmit={saveSpot} className="space-y-3">
                <p className="text-sm text-white/65">{m.addHint}</p>
                {pending && (
                  <>
                    <input
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      placeholder={m.addName}
                      aria-label={m.addName}
                      maxLength={80}
                      className="w-full rounded-[4px] bg-black px-3 py-2.5 text-sm text-white placeholder:text-white/35"
                    />
                    <select value={newLayer} onChange={(event) => setNewLayer(event.target.value as LayerId)} className="w-full rounded-[4px] bg-black px-3 py-2.5 text-sm text-white">
                      {LAYERS.map((layer) => (
                        <option key={layer} value={layer}>
                          {m.layers[layer]}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <div className="flex gap-2">
                  <Btn type="submit" variant="blue" disabled={!pending || !newName.trim()}>
                    {m.addSave}
                  </Btn>
                  <Btn variant="ghost" onClick={cancelAdd}>
                    {m.addCancel}
                  </Btn>
                </div>
              </form>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rounded-[4px] bg-card p-2">
            <p className="eyebrow px-2 pb-2 pt-1">
              {status === 'loading' ? m.loading : fill(m.found, { n: formatNumber(visible.length, lang) })}
              {place.label ? ` · ${place.label}` : ''}
            </p>

            {emptyLayers.map((layer) => (
              <p key={layer} className="m-1 rounded-[4px] bg-black p-3 text-sm leading-snug text-white/65">
                {emptyText[layer]}
              </p>
            ))}

            <ul className="space-y-1">
              {visible.slice(0, LIST_LIMIT).map((spot) => (
                <li key={spot.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(spot.id)}
                    className={`flex w-full items-start gap-3 rounded-[4px] p-3 text-left transition-colors ${selectedId === spot.id ? 'bg-slate' : 'bg-black hover:bg-slate/60'}`}
                  >
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 border border-black/40" style={{ background: LAYER_COLORS[spot.layer] }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.95rem] tracking-[-0.02em]">{spot.name ?? m.unnamed}</span>
                      <span className="block text-xs text-white/45">
                        {m.layers[spot.layer]} · {fill(m.away, { km: spot.distanceKm.toFixed(1) })}
                      </span>
                      {spot.materials.length > 0 && (
                        <span className="mt-1 block text-xs text-white/55">
                          {m.accepts}: {spot.materials.map((mat) => m.materials[mat] ?? mat.replace(/_/g, ' ')).join(', ')}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {mySpots.length > 0 && (
              <div className="mt-3 border-t border-white/10 pt-2">
                <p className="eyebrow px-2 pb-2">{m.mySpots}</p>
                <ul className="space-y-1">
                  {mySpots.map((spot) => (
                    <li key={spot.id} className="flex items-center gap-3 rounded-[4px] bg-black p-3">
                      <span className="h-2.5 w-2.5 shrink-0 border border-dashed border-black/60" style={{ background: LAYER_COLORS[spot.layer] }} />
                      <button type="button" onClick={() => setSelectedId(spot.id)} className="min-w-0 flex-1 truncate text-left text-[0.95rem]">
                        {spot.name}
                      </button>
                      <button type="button" onClick={() => removeSpot(spot.id)} className="font-mono text-[0.65rem] uppercase text-white/45 hover:text-white">
                        {m.removeSpot}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Wrap>

      <Wrap className="pt-6">
        <p className="max-w-3xl text-sm leading-relaxed text-white/45">
          {m.attribution}{' '}
          <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer noopener" className="text-brand underline-offset-4 hover:underline">
            {m.contribute}
          </a>
        </p>
      </Wrap>
    </div>
  )
}
