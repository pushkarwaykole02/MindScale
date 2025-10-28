const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// -------- Apriori (associations) --------
function apriori(transactions, minSupport = 0.3) {
  const numTx = transactions.length || 1
  const supportCount = (itemset) => {
    const set = new Set(itemset)
    let count = 0
    for (const tx of transactions) {
      let ok = true
      for (const it of set) if (!tx.has(it)) { ok = false; break }
      if (ok) count++
    }
    return count
  }

  const toKey = (arr) => Array.from(new Set(arr)).sort().join('::')

  // 1-itemsets
  const itemFreq = {}
  for (const tx of transactions) {
    for (const it of tx) {
      const k = toKey([it])
      itemFreq[k] = (itemFreq[k] || 0) + 1
    }
  }
  const L1 = Object.entries(itemFreq)
    .filter(([_, c]) => c / numTx >= minSupport)
    .map(([k, c]) => ({ items: k.split('::'), count: c }))

  // 2-itemsets (good enough for dashboard rules)
  const L2Map = {}
  for (let i = 0; i < L1.length; i++) {
    for (let j = i + 1; j < L1.length; j++) {
      const comb = toKey(L1[i].items.concat(L1[j].items))
      if (L2Map[comb]) continue
      const count = supportCount(comb.split('::'))
      if (count / numTx >= minSupport) L2Map[comb] = count
    }
  }
  const L2 = Object.entries(L2Map).map(([k, c]) => ({ items: k.split('::'), count: c }))
  return { L1, L2, numTx }
}

function generateRules(L1, L2, numTx, minConfidence = 0.6) {
  const freq1 = Object.fromEntries(L1.map(l => [l.items[0], l.count]))
  const rules = []
  for (const l2 of L2) {
    const [a, b] = l2.items
    const supp = l2.count / numTx
    const confAB = l2.count / (freq1[a] || 1)
    const confBA = l2.count / (freq1[b] || 1)
    const liftAB = confAB / ((freq1[b] || 1) / numTx)
    const liftBA = confBA / ((freq1[a] || 1) / numTx)
    if (confAB >= minConfidence) rules.push({ antecedent: [a], consequent: [b], support: Number(supp.toFixed(3)), confidence: Number(confAB.toFixed(3)), lift: Number(liftAB.toFixed(3)) })
    if (confBA >= minConfidence) rules.push({ antecedent: [b], consequent: [a], support: Number(supp.toFixed(3)), confidence: Number(confBA.toFixed(3)), lift: Number(liftBA.toFixed(3)) })
  }
  return rules
}

router.get('/associations', async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : null
    const minSupport = req.query.minSupport ? Number(req.query.minSupport) : 0.3
    const minConfidence = req.query.minConfidence ? Number(req.query.minConfidence) : 0.6

    const query = supabase
      .from('happiness_data')
      .select('country_name, happiness_score, economy_gdp_per_capita, social_support, healthy_life_expectancy, freedom_to_make_life_choices, generosity, perceptions_of_corruption' + (year ? ', year' : ''))
    const { data, error } = year ? await query.eq('year', year) : await query
    if (error) throw error

    const rows = (data || []).filter(r => r.happiness_score != null)
    if (rows.length === 0) return res.json({ rules: [], year })

    const features = ['economy_gdp_per_capita','social_support','healthy_life_expectancy','freedom_to_make_life_choices','generosity','perceptions_of_corruption','happiness_score']
    const medians = {}
    for (const f of features) {
      const arr = rows.map(r => Number(r[f])).filter(v => !isNaN(v)).sort((a,b)=>a-b)
      const mid = Math.floor(arr.length/2)
      medians[f] = arr.length ? (arr.length%2?arr[mid]:(arr[mid-1]+arr[mid])/2) : 0
    }

    const tx = rows.map(r => {
      const s = new Set()
      for (const f of features) {
        if (isNaN(Number(r[f]))) continue
        s.add(`${f}:${Number(r[f])>=medians[f]?'high':'low'}`)
      }
      return s
    })

    const { L1, L2, numTx } = apriori(tx, minSupport)
    const rules = generateRules(L1, L2, numTx, minConfidence)
    res.json({ year, rules, numTransactions: numTx, medians })
  } catch (err) {
    console.error('apriori error', err)
    res.status(500).json({ error: 'Failed to compute associations' })
  }
})

// -------- K-means (country clustering) --------
function zscore(matrix) {
  const n = matrix.length
  const d = matrix[0].length
  const means = Array(d).fill(0)
  const stds = Array(d).fill(0)
  for (const row of matrix) for (let j=0;j<d;j++) means[j]+=row[j]
  for (let j=0;j<d;j++) means[j]/=n
  for (const row of matrix) for (let j=0;j<d;j++) stds[j]+=Math.pow(row[j]-means[j],2)
  for (let j=0;j<d;j++) stds[j]=Math.sqrt(stds[j]/n)||1
  return matrix.map(row=>row.map((v,j)=>(v-means[j])/stds[j]))
}

function kmeansPlusPlusInit(points, k) {
  const centroids = []
  centroids.push(points[Math.floor(Math.random()*points.length)])
  while (centroids.length < k) {
    const distances = points.map(p => Math.min(...centroids.map(c => euclid2(p,c))))
    const sum = distances.reduce((a,b)=>a+b,0)
    let r = Math.random()*sum
    for (let i=0;i<points.length;i++) { r -= distances[i]; if (r<=0){ centroids.push(points[i]); break } }
    if (centroids.length===k) break
  }
  return centroids
}

const euclid2 = (a,b)=>a.reduce((s,v,i)=>s+Math.pow(v-b[i],2),0)

function runKmeans(points, k, maxIter=100){
  let centroids = kmeansPlusPlusInit(points, k)
  let labels = Array(points.length).fill(0)
  for (let it=0; it<maxIter; it++) {
    let changed = false
    // assign
    for (let i=0;i<points.length;i++) {
      let best=0, bestd=Infinity
      for (let c=0;c<k;c++) {const d=euclid2(points[i], centroids[c]); if (d<bestd){bestd=d; best=c}}
      if (labels[i]!==best){labels[i]=best; changed=true}
    }
    // update
    const sums = Array.from({length:k},()=>Array(points[0].length).fill(0))
    const counts = Array(k).fill(0)
    for (let i=0;i<points.length;i++){const l=labels[i]; counts[l]++; for (let j=0;j<points[0].length;j++) sums[l][j]+=points[i][j]}
    for (let c=0;c<k;c++){ if(counts[c]>0) for (let j=0;j<points[0].length;j++) centroids[c][j]=sums[c][j]/counts[c] }
    if (!changed) break
  }
  return { centroids, labels }
}

function nameCluster(features, centroidObj) {
  const pretty = {
    economy_gdp_per_capita: 'Economy',
    social_support: 'Social Support',
    healthy_life_expectancy: 'Health',
    freedom_to_make_life_choices: 'Freedom',
    generosity: 'Generosity',
    perceptions_of_corruption: 'Corruption'
  }
  // Convert to entries with abs strength
  const entries = Object.entries(centroidObj).map(([k,v])=>({ key:k, val:Number(v) }))
  if (!entries.length) return 'Cluster'
  entries.sort((a,b)=>Math.abs(b.val)-Math.abs(a.val))
  const top = entries.slice(0,2)
  const parts = top.map(e => {
    const label = pretty[e.key] || e.key
    // For corruption, negative z means lower corruption (good)
    if (e.key === 'perceptions_of_corruption') {
      return (e.val <= 0 ? 'Low ' : 'High ') + 'Corruption'
    }
    return (e.val >= 0 ? 'High ' : 'Low ') + label
  })
  return parts.join(' • ')
}

router.post('/kmeans', async (req, res) => {
  try {
    const year = req.body.year ? Number(req.body.year) : null
    const k = req.body.k ? Number(req.body.k) : 5
    const features = ['economy_gdp_per_capita','social_support','healthy_life_expectancy','freedom_to_make_life_choices','generosity','perceptions_of_corruption']
    const query = supabase.from('happiness_data').select(['country_name', ...features].join(','))
    const { data, error } = year ? await query.eq('year', year) : await query
    if (error) throw error
    const rows = (data || []).filter(r => features.every(f => r[f] != null))
    if (rows.length < k) return res.status(400).json({ error: 'Not enough rows for requested k' })

    const matrix = rows.map(r => features.map(f => Number(r[f]) || 0))
    const norm = zscore(matrix)
    const { centroids, labels } = runKmeans(norm, k)

    // Save to happiness_clusters
    const payload = Array.from({length:k}).map((_,c)=>{
      const centroidObj = Object.fromEntries(features.map((f,j)=>[f, Number(centroids[c][j].toFixed(3))]))
      const clusterCountries = rows.filter((_,i)=>labels[i]===c)
      return {
        cluster_id: c,
        cluster_name: nameCluster(features, centroidObj),
        cluster_description: 'K-means over normalized factors (z-score); name reflects strongest factors',
        centroid_data: centroidObj,
        countries: clusterCountries.map(r=>r.country_name),
        size: clusterCountries.length,
        avg_happiness_score: null
      }
    })

    // Clear old clusters for simplicity (optional)
    const del = await supabase.from('happiness_clusters').delete().neq('cluster_id', -1)
    if (del.error) console.warn('delete clusters error', del.error)
    const ins = await supabase.from('happiness_clusters').insert(payload)
    if (ins.error) throw ins.error

    res.json({ status: 'ok', k, year, clusters: payload })
  } catch (err) {
    console.error('kmeans error', err)
    res.status(500).json({ error: 'Failed to run k-means' })
  }
})

module.exports = router



