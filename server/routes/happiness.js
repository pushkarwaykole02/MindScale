const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const router = express.Router()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to fetch latest year present in happiness_data
async function getLatestYear() {
  const { data, error } = await supabase
    .from('happiness_data')
    .select('year')
    .order('year', { ascending: false })
    .limit(1)
  if (error || !data || data.length === 0) return null
  return data[0].year
}

// GET /api/happiness/overview
router.get('/overview', async (req, res) => {
  try {
    const { data: analytics, error } = await supabase
      .from('happiness_analytics')
      .select('metric_name, metric_value, year, region, category')
      .eq('region', 'GLOBAL')
      .in('metric_name', [
        'Average Happiness Score',
        'Average Economy Score',
        'Average Social Support',
        'Average Health Score',
        'Average Freedom Score',
        'Average Generosity',
        'Average Corruption Score',
        'Total Countries'
      ])
      .order('year', { ascending: true })

    if (error) throw error

    const years = [...new Set(analytics.map(a => a.year))].sort((a,b)=>a-b)
    const series = years.map(y => ({
      year: y,
      avgHappiness: Number((analytics.find(a => a.year === y && a.metric_name === 'Average Happiness Score')?.metric_value) || 0)
    }))

    const latestYear = years.length ? years[years.length - 1] : await getLatestYear()
    let top = [], bottom = []
    if (latestYear) {
      const { data: rows } = await supabase
        .from('happiness_data')
        .select('country_name, happiness_score')
        .eq('year', latestYear)
        .order('happiness_score', { ascending: false })
        .limit(10)
      const { data: rowsBottom } = await supabase
        .from('happiness_data')
        .select('country_name, happiness_score')
        .eq('year', latestYear)
        .order('happiness_score', { ascending: true })
        .limit(10)
      top = rows || []
      bottom = rowsBottom || []
    }

    res.json({ years: series.map(s => s.year), avgHappiness: series.map(s => s.avgHappiness), latestYear, top, bottom })
  } catch (err) {
    console.error('overview error', err)
    res.status(500).json({ error: 'Failed to fetch overview' })
  }
})

// POST /api/happiness/rebuild – regenerate analytics from happiness_data for all years
router.post('/rebuild', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('happiness_data')
      .select('*')
    if (error) throw error

    const byYear = {}
    ;(rows || []).forEach(r => {
      if (!byYear[r.year]) byYear[r.year] = []
      byYear[r.year].push(r)
    })

    for (const [yearStr, data] of Object.entries(byYear)) {
      const year = parseInt(yearStr)
      const avg = (key) => data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / (data.length || 1)
      const analytics = [
        { metric_name: 'Average Happiness Score', metric_value: avg('happiness_score'), category: 'overview', year, region: 'GLOBAL' },
        { metric_name: 'Average Economy Score', metric_value: avg('economy_gdp_per_capita'), category: 'factors', year, region: 'GLOBAL' },
        { metric_name: 'Average Social Support', metric_value: avg('social_support'), category: 'factors', year, region: 'GLOBAL' },
        { metric_name: 'Average Health Score', metric_value: avg('healthy_life_expectancy'), category: 'factors', year, region: 'GLOBAL' },
        { metric_name: 'Average Freedom Score', metric_value: avg('freedom_to_make_life_choices'), category: 'factors', year, region: 'GLOBAL' },
        { metric_name: 'Average Generosity', metric_value: avg('generosity'), category: 'factors', year, region: 'GLOBAL' },
        { metric_name: 'Average Corruption Score', metric_value: avg('perceptions_of_corruption'), category: 'factors', year, region: 'GLOBAL' },
        { metric_name: 'Total Countries', metric_value: data.length, category: 'overview', year, region: 'GLOBAL' }
      ]
      const { error: upErr } = await supabase
        .from('happiness_analytics')
        .upsert(analytics, { onConflict: 'metric_name,region,year' })
      if (upErr) console.warn('analytics upsert error', upErr)
    }

    res.json({ status: 'ok', years: Object.keys(byYear).map(Number).sort((a,b)=>a-b) })
  } catch (err) {
    console.error('rebuild error', err)
    res.status(500).json({ error: 'Failed to rebuild analytics' })
  }
})

// GET /api/happiness/regions
router.get('/regions', async (req, res) => {
  try {
    const { year } = req.query
    const latestYear = year ? Number(year) : await getLatestYear()
    
    console.log(`Fetching regional data for year: ${latestYear}`)
    
    const { data, error } = await supabase
      .from('happiness_analytics')
      .select('region, metric_value')
      .eq('metric_name', 'Regional Average Happiness')
      .eq('year', latestYear)
      .not('region', 'is', null)
    if (error) throw error
    
    
    let regions = {}
    ;(data || []).forEach(r => { regions[r.region] = Number(r.metric_value) })

    // Always compute from raw data to ensure we have current data
    const { data: raw, error: rawErr } = await supabase
      .from('happiness_data')
      .select('country_name, region, happiness_score')
      .eq('year', latestYear)
      .not('happiness_score', 'is', null)
    if (rawErr) throw rawErr
    
    // If no regions found, try to get region mapping from other years
    let regionMapping = {}
    if (raw && raw.length > 0 && raw.every(r => !r.region || r.region.trim() === '')) {
      const { data: regionData } = await supabase
        .from('happiness_data')
        .select('country_name, region')
        .not('region', 'is', null)
        .neq('region', '')
        .limit(1000)
      
      regionData?.forEach(r => {
        if (!regionMapping[r.country_name]) {
          regionMapping[r.country_name] = r.region
        }
      })
    }

    const buckets = {}
    ;(raw || []).forEach(r => {
      let region = String(r.region || '').trim()
      const score = Number(r.happiness_score) || 0
      
      // Use fallback region mapping if current region is empty
      if (!region && regionMapping[r.country_name]) {
        region = regionMapping[r.country_name]
      }
      
      if (!region || score === 0) return
      if (!buckets[region]) buckets[region] = []
      buckets[region].push(score)
    })
    
    regions = Object.fromEntries(
      Object.entries(buckets).map(([k, arr]) => [k, arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0])
    )
    res.json({ year: latestYear, regions })
  } catch (err) {
    console.error('regions error', err)
    res.status(500).json({ error: 'Failed to fetch regions' })
  }
})

// GET /api/happiness/trends
router.get('/trends', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('happiness_analytics')
      .select('year, metric_value')
      .eq('metric_name', 'Average Happiness Score')
      .eq('region', 'GLOBAL')
      .order('year', { ascending: true })
    if (error) throw error
    const years = data.map(d => d.year)
    const scores = data.map(d => Number(d.metric_value))
    res.json({ years, scores })
  } catch (err) {
    console.error('trends error', err)
    res.status(500).json({ error: 'Failed to fetch trends' })
  }
})

// GET /api/happiness/clusters
router.get('/clusters', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('happiness_clusters')
      .select('cluster_id, cluster_name, size, avg_happiness_score')
      .order('cluster_id', { ascending: true })
    if (error) throw error
    res.json({ clusters: data || [] })
  } catch (err) {
    console.error('clusters error', err)
    res.status(500).json({ error: 'Failed to fetch clusters' })
  }
})

// GET /api/happiness/cluster-distribution?year=YYYY
router.get('/cluster-distribution', async (req, res) => {
  try {
    const { year } = req.query
    const y = year ? Number(year) : await getLatestYear()
    
    // Debug: Check what data exists in the database
    const { data, error } = await supabase
      .from('happiness_data')
      .select('country_name, happiness_score')
      .eq('year', y)
      .not('happiness_score', 'is', null)
      .order('happiness_score', { ascending: false })
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      return res.json({ 
        year: y, 
        buckets: {
          'Very Happy Countries': 0,
          'Happy Countries': 0,
          'Moderately Happy Countries': 0,
          'Less Happy Countries': 0,
          'Unhappy Countries': 0
        }
      })
    }
    
    const scores = data.map(r => Number(r.happiness_score) || 0)
    
    // Use actual World Happiness Report score ranges
    const buckets = {
      'Very Happy Countries': scores.filter(s => s >= 7.0).length,
      'Happy Countries': scores.filter(s => s >= 6.0 && s < 7.0).length,
      'Moderately Happy Countries': scores.filter(s => s >= 5.0 && s < 6.0).length,
      'Less Happy Countries': scores.filter(s => s >= 4.0 && s < 5.0).length,
      'Unhappy Countries': scores.filter(s => s < 4.0).length
    }
    
    res.json({ year: y, buckets })
  } catch (err) {
    console.error('cluster-distribution error', err)
    res.status(500).json({ error: 'Failed to fetch cluster distribution' })
  }
})

// GET /api/happiness/top-countries?year=YYYY
router.get('/top-countries', async (req, res) => {
  try {
    const { year } = req.query
    const y = year ? Number(year) : await getLatestYear()
    
    const { data, error } = await supabase
      .from('happiness_data')
      .select('country_name, happiness_score')
      .eq('year', y)
      .not('happiness_score', 'is', null)
      .order('happiness_score', { ascending: false })
      .limit(10)
    
    if (error) throw error
    
    const top = (data || []).map(row => ({
      country_name: row.country_name,
      happiness_score: Number(row.happiness_score) || 0
    }))
    
    res.json({ year: y, top })
  } catch (err) {
    console.error('top-countries error', err)
    res.status(500).json({ error: 'Failed to fetch top countries' })
  }
})

// GET /api/happiness/country-trends?country=CountryName
router.get('/country-trends', async (req, res) => {
  try {
    const { country } = req.query
    if (!country) return res.status(400).json({ error: 'country parameter is required' })
    
    const { data, error } = await supabase
      .from('happiness_data')
      .select('year, happiness_score')
      .eq('country_name', country)
      .order('year', { ascending: true })
    
    if (error) throw error
    
    const years = (data || []).map(d => d.year)
    const scores = (data || []).map(d => Number(d.happiness_score))
    
    res.json({ country, years, scores })
  } catch (err) {
    console.error('country-trends error', err)
    res.status(500).json({ error: 'Failed to fetch country trends' })
  }
})

// GET /api/happiness/countries
router.get('/countries', async (req, res) => {
  try {
    let allCountries = []
    let page = 0
    const pageSize = 1000
    let hasMore = true

    // Fetch all countries using pagination to bypass any limits
    while (hasMore) {
      const { data, error } = await supabase
        .from('happiness_data')
        .select('country_name')
        .order('country_name', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) throw error

      if (data && data.length > 0) {
        allCountries = allCountries.concat(data)
        page++
        hasMore = data.length === pageSize
      } else {
        hasMore = false
      }
    }

    // Get unique countries and filter out null/empty values
    const countries = [...new Set(allCountries.map(d => d.country_name))].filter(Boolean)
    console.log(`Fetched ${countries.length} unique countries from database`)
    console.log(`First 5 countries: ${countries.slice(0, 5).join(', ')}`)
    console.log(`Last 5 countries: ${countries.slice(-5).join(', ')}`)
    
    res.json({ countries })
  } catch (err) {
    console.error('countries error', err)
    res.status(500).json({ error: 'Failed to fetch countries' })
  }
})

module.exports = router

// Dynamic correlations from happiness_correlations
// GET /api/happiness/correlations?year=YYYY
router.get('/correlations', async (req, res) => {
  try {
    const { year } = req.query
    let query = supabase
      .from('happiness_correlations')
      .select('factor1, factor2, correlation_coefficient, p_value, significance_level, year')
    if (year) query = query.eq('year', Number(year))
    const { data, error } = await query
    if (error) throw error
    res.json({ correlations: data || [] })
  } catch (err) {
    console.error('correlations error', err)
    res.status(500).json({ error: 'Failed to fetch correlations' })
  }
})

// GET /api/happiness/correlations/live?year=YYYY
router.get('/correlations/live', async (req, res) => {
  try {
    const { year } = req.query
    const y = year ? Number(year) : await getLatestYear()
    const { data, error } = await supabase
      .from('happiness_data')
      .select('happiness_score, economy_gdp_per_capita, social_support, healthy_life_expectancy, freedom_to_make_life_choices, generosity, perceptions_of_corruption')
      .eq('year', y)
    if (error) throw error

    const rows = (data || []).filter(r => r.happiness_score != null)
    const numeric = key => rows.map(r => Number(r[key])).filter(v => !isNaN(v))
    const base = numeric('happiness_score')
    const factors = [
      'economy_gdp_per_capita',
      'social_support',
      'healthy_life_expectancy',
      'freedom_to_make_life_choices',
      'generosity',
      'perceptions_of_corruption'
    ]

    function pearson(a, b) {
      const n = Math.min(a.length, b.length)
      if (n === 0) return 0
      let sumX=0, sumY=0, sumXY=0, sumX2=0, sumY2=0
      for (let i=0;i<n;i++) {
        const x=a[i]; const y=b[i]
        if (isNaN(x) || isNaN(y)) continue
        sumX += x; sumY += y; sumXY += x*y; sumX2 += x*x; sumY2 += y*y
      }
      const num = n*sumXY - sumX*sumY
      const den = Math.sqrt((n*sumX2 - sumX*sumX) * (n*sumY2 - sumY*sumY))
      if (den === 0) return 0
      return num/den
    }

    function median(arr){
      const a = arr.slice().sort((x,y)=>x-y)
      const n = a.length
      if (n===0) return 0
      const mid = Math.floor(n/2)
      return n%2 ? a[mid] : (a[mid-1]+a[mid])/2
    }

    const correlations = factors.map(f => {
      const arr = numeric(f)
      const n = Math.min(base.length, arr.length)
      const validPairs = Array.from({length: n}).filter((_,i)=>!isNaN(base[i]) && !isNaN(arr[i])).length
      const coverage = n === 0 ? 0 : validPairs / n
      const coef = pearson(base, arr)
      const level = Math.abs(coef) >= 0.7 ? 'strong' : Math.abs(coef) >= 0.4 ? 'moderate' : 'weak'
      // Support: co-occurrence of upper/lower halves according to correlation sign
      const bx = base.filter(v=>!isNaN(v))
      const by = arr.filter(v=>!isNaN(v))
      const mx = median(bx), my = median(by)
      let co=0, tot=0
      for(let i=0;i<n;i++){
        const x=base[i], y=arr[i]
        if (isNaN(x) || isNaN(y)) continue
        tot++
        if (coef >= 0){
          if ((x>=mx && y>=my) || (x<mx && y<my)) co++
        } else {
          if ((x>=mx && y<my) || (x<mx && y>=my)) co++
        }
      }
      const support = tot===0 ? 0 : co/tot
      return { factor1: f, factor2: 'happiness_score', correlation_coefficient: Number(coef.toFixed(3)), support: Number(support.toFixed(3)), coverage: Number((coverage).toFixed(3)), p_value: null, significance_level: level, year: y }
    })

    res.json({ correlations })
  } catch (err) {
    console.error('correlations-live error', err)
    res.status(500).json({ error: 'Failed to compute correlations' })
  }
})
// POST /api/happiness/backfill-regions
// Builds country->region mapping from existing rows (any year where region is present)
// and applies it to rows with null region. Then upserts regional averages for latest year.
router.post('/backfill-regions', async (req, res) => {
  try {
    // 0) Normalize blank regions to NULL and trim
    const { data: nonNullRows } = await supabase
      .from('happiness_data')
      .select('id, region')
      .not('region', 'is', null)

    const blanks = (nonNullRows || []).filter(r => (String(r.region || '').trim() === ''))
    const toTrim = (nonNullRows || []).filter(r => r.region && r.region !== r.region.trim())

    // Set blanks to NULL
    for (const b of blanks) {
      await supabase.from('happiness_data').update({ region: null }).eq('id', b.id)
    }
    // Trim whitespace
    for (const t of toTrim) {
      await supabase.from('happiness_data').update({ region: t.region.trim() }).eq('id', t.id)
    }

    // 1) Build mapping from existing data
    const { data: known, error: knownErr } = await supabase
      .from('happiness_data')
      .select('country_name, region')
      .not('region', 'is', null)
    if (knownErr) throw knownErr

    const countryToRegion = {}
    ;(known || []).forEach(r => {
      if (!countryToRegion[r.country_name]) countryToRegion[r.country_name] = r.region
    })

    // 2) Fetch countries missing region
    const { data: missing, error: missErr } = await supabase
      .from('happiness_data')
      .select('country_name, region')
      .or('region.is.null,region.eq.""')
    if (missErr) throw missErr

    const uniqueMissing = Array.from(new Set((missing || []).map(m => m.country_name))).filter(Boolean)

    // 3) Update in small batches
    const batchSize = 100
    for (let i = 0; i < uniqueMissing.length; i += batchSize) {
      const slice = uniqueMissing.slice(i, i + batchSize)
      const updates = slice
        .filter(c => countryToRegion[c])
        .map(async c => {
          const region = countryToRegion[c]
          return await supabase
            .from('happiness_data')
            .update({ region })
            .eq('country_name', c)
            .is('region', null)
        })
      await Promise.all(updates)
    }

    // 4) Upsert regional averages for latest year
    const latestYear = await getLatestYear()
    if (latestYear) {
      const { data: regRows } = await supabase
        .from('happiness_data')
        .select('region, happiness_score')
        .eq('year', latestYear)
        .not('region', 'is', null)

      const regionBuckets = {}
      ;(regRows || []).forEach(r => {
        const region = String(r.region || '').trim()
        if (!region) return
        if (!regionBuckets[region]) regionBuckets[region] = []
        regionBuckets[region].push(Number(r.happiness_score) || 0)
      })

      const payload = Object.entries(regionBuckets).map(([region, arr]) => ({
        metric_name: 'Regional Average Happiness',
        metric_value: arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0,
        category: 'regional',
        region,
        year: latestYear
      }))

      if (payload.length) {
        await supabase
          .from('happiness_analytics')
          .upsert(payload, { onConflict: 'metric_name,region,year' })
      }
    }

    res.json({ status: 'ok', mapped: Object.keys(countryToRegion).length })
  } catch (err) {
    console.error('backfill-regions error', err)
    res.status(500).json({ error: 'Failed to backfill regions' })
  }
})


