const express = require('express')
const router = express.Router()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Simulated Naive Bayes classifier
const simulateNaiveBayes = (userData) => {
  const { age, income, purchaseFrequency, avgOrderValue, preferredCategory, lastPurchaseDays } = userData

  // Map repurposed fields to wellness risk scores (higher = higher risk)
  // age has a light effect
  const ageRisk = age < 18 ? 0.5 : age <= 30 ? 0.3 : age <= 50 ? 0.4 : 0.5

  // income -> sleep hours (7-9 good, <6 or >9 worse)
  const sleep = Number(income)
  let sleepRisk = 0.5
  if (sleep >= 7 && sleep <= 9) sleepRisk = 0.1
  else if (sleep >= 6 && sleep < 7) sleepRisk = 0.3
  else if (sleep > 9) sleepRisk = 0.3
  else sleepRisk = 0.7

  // purchaseFrequency -> stress level 1-10 (higher stress = higher risk)
  const stress = Number(purchaseFrequency)
  let stressRisk = 0.2
  if (stress >= 7) stressRisk = 0.9
  else if (stress >= 4) stressRisk = 0.6
  else stressRisk = 0.2

  // avgOrderValue -> physical activity mins/day (more activity = lower risk)
  const activity = Number(avgOrderValue)
  let activityRisk = 0.7
  if (activity >= 60) activityRisk = 0.2
  else if (activity >= 30) activityRisk = 0.4
  else if (activity >= 15) activityRisk = 0.6
  else activityRisk = 0.8

  // lastPurchaseDays -> days feeling low this month (more days = higher risk)
  const lowDays = Number(lastPurchaseDays)
  let moodRisk = 0.1
  if (lowDays > 10) moodRisk = 0.9
  else if (lowDays >= 4) moodRisk = 0.7
  else if (lowDays >= 1) moodRisk = 0.4
  else moodRisk = 0.1

  // preferredCategory acts as focus; neutral default
  const categoryMod = {
    electronics: 0.1, // focus on attention/tech hygiene
    clothing: 0.1,
    home: -0.05, // sleep focus helps
    books: -0.05, // CBT/journaling focus helps
    sports: -0.1, // activity focus helps
    beauty: 0
  }[preferredCategory] ?? 0

  // Weighted risk score (0..1)
  const weights = [0.1, 0.25, 0.25, 0.2, 0.2] // age, sleep, stress, activity, mood
  const scores = [ageRisk, sleepRisk, stressRisk, activityRisk, moodRisk]
  let risk = scores.reduce((sum, s, i) => sum + s * weights[i], 0)
  risk = Math.min(1, Math.max(0, risk + categoryMod))
  
  // Determine well-being profile (renamed from customer segments)
  let segment = 'Stable Well-being'
  if (risk >= 0.8) segment = 'Critical Risk'
  else if (risk >= 0.6) segment = 'Elevated Risk'
  else if (risk >= 0.4) segment = 'Moderate Risk'
  else segment = 'Stable Well-being'
  
  // Generate recommendations based on category and probability
  const recommendations = generateRecommendations(preferredCategory, risk, (userData?.issue || ''))
  
  return {
    probability: Math.round(risk * 100),
    segment,
    recommendations,
    confidence: Math.round((1 - risk + Math.random() * 0.2) * 100),
    nextPurchasePrediction: predictNextPurchase(lastPurchaseDays, purchaseFrequency)
  }
}

const generateRecommendations = (category, probability, issueText) => {
  // Large suggestion library (>=50)
  const LIB = {
    general: [
      '5-minute body scan once daily',
      'Practice 3 good things before bed',
      'Write a 1-line journal entry nightly',
      'Step outside for 10 minutes of daylight before noon',
      'Drink a glass of water on waking',
      'Set a 2-minute tidy-up timer after dinner',
      'Listen to calming music for 10 minutes',
      'Schedule a micro-break every 60 minutes',
      'Do a random act of kindness this week',
      'Text a friend to check in today',
      'Stand and stretch every hour',
      'Eat a piece of fruit today',
      'Limit news/social scrolling to 20 minutes',
      'Plan tomorrow with 3 bullet points',
      'Practice box breathing 4-4-4-4 for 3 minutes',
      'Name 5 things you can see/hear/feel (grounding)',
      'Progressive muscle relaxation (5 minutes)',
      'Take a warm shower before bed',
      'Use blue-light filter after sunset',
      'Prepare clothes/desk the night before',
      'Keep a consistent wake time all week',
      'Set phone to Do Not Disturb for 30 minutes',
      'Walk while taking a call',
      'Practice self-compassion: speak kindly to yourself',
      'Limit caffeine after 2PM',
      'Write down intrusive thoughts and postpone them',
      'Plan a small reward after a task',
      'Tidy one surface (desk/nightstand)',
      'Spend 10 minutes on a hobby',
      'Read 5 pages of a book',
      'Cook a simple balanced meal',
      'Stand in sunlight for 5 minutes',
      'Do 10 slow deep breaths',
      'Set a realistic bedtime window',
      'Practice gratitude with a partner/friend',
      'Set boundaries: say no once this week',
      'Write a worry list then set a “worry time” later',
      'Practice mindful eating for one meal',
      'Lower evening lights 1 hour before bed',
      'Create a calm corner (chair + lamp)',
      'Unfollow one stressful feed',
      'Use a paper to‑do list tomorrow',
      'Schedule a nature walk this week',
      'Do a digital reset: close unused tabs/apps',
      'Light stretching before bed',
      'Set a hydration target: 6–8 glasses',
      'Add a vegetable to lunch/dinner',
      'Do one 2-minute meditation today',
      'Practice the 5-4-3-2-1 grounding',
      'Write a kind note to yourself'
    ],
    anxiety: [
      '4-7-8 breathing twice daily',
      '10-minute mindfulness session',
      'Label emotion + cause (name it to tame it)',
      'Reduce stimulants (caffeine/energy drinks)'
    ],
    sleep: [
      'Avoid screens 60 minutes before bed',
      'Keep consistent sleep/wake times',
      'Avoid caffeine after 2PM',
      'Reserve bed for sleep only'
    ],
    activity: [
      '20–30 minutes brisk walk daily',
      'Light yoga or stretching (10 minutes)',
      'Take stairs when possible',
      '2×5 push-ups/squats throughout the day'
    ],
    mood: [
      'CBT thought record once a day',
      'Gratitude journaling (3 items)',
      'Plan one enjoyable activity (behavioral activation)',
      'Call or meet a supportive friend'
    ],
    focus: [
      'Use Pomodoro 25/5 for one session',
      'Declutter your desk for 5 minutes',
      'Silence notifications during tasks',
      'Single-task: finish one small task fully'
    ]
  }

  // Build candidate pool based on inputs
  const i = (issueText || '').toLowerCase()
  let pool = [...LIB.general]
  if (i.includes('anxiety')) pool = pool.concat(LIB.anxiety)
  if (i.includes('sleep')) pool = pool.concat(LIB.sleep)
  if (i.includes('stress')) pool = pool.concat(LIB.anxiety)
  if (i.includes('focus') || i.includes('adhd')) pool = pool.concat(LIB.focus)

  // Probability ~ risk. High risk → more structured actions; low risk → lighter habits
  if (probability >= 0.6) pool = pool.concat(LIB.activity, LIB.mood)
  else pool = pool.concat(LIB.sleep, LIB.mood)

  // Deduplicate
  const dedup = Array.from(new Set(pool))

  // Pick 4 suggestions deterministically influenced by probability
  const count = 4
  const selected = []
  let seed = Math.floor(probability * 1000)
  for (let n = 0; n < count && dedup.length > 0; n++) {
    seed = (seed * 9301 + 49297) % 233280
    const idx = seed % dedup.length
    selected.push(dedup.splice(idx, 1)[0])
  }

  return selected
}

const predictNextPurchase = (lastPurchaseDays, frequency) => {
  const avgDaysBetweenPurchases = 30 / frequency
  const predictedDays = Math.max(1, Math.round(avgDaysBetweenPurchases - lastPurchaseDays))
  
  if (predictedDays <= 0) return 'Within 1 week'
  if (predictedDays <= 7) return 'Within 1 week'
  if (predictedDays <= 14) return 'Within 2 weeks'
  if (predictedDays <= 30) return 'Within 1 month'
  return 'More than 1 month'
}

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const userData = req.body
    
    // Validate required fields
    const requiredFields = ['age', 'income', 'purchaseFrequency', 'avgOrderValue', 'preferredCategory', 'lastPurchaseDays']
    const missingFields = requiredFields.filter(field => !userData[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      })
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Run simulated Naive Bayes prediction
    const prediction = simulateNaiveBayes(userData)
    
    // Add additional insights
    const insights = {
      riskFactors: [],
      opportunities: [],
      behaviorPattern: 'stable'
    }
    
    // Analyze risk factors
    if (userData.lastPurchaseDays > 90) {
      insights.riskFactors.push('Long time since last purchase')
    }
    if (userData.purchaseFrequency < 1) {
      insights.riskFactors.push('Low purchase frequency')
    }
    if (userData.avgOrderValue < 50) {
      insights.riskFactors.push('Low average order value')
    }
    
    // Identify opportunities
    if (userData.income > 80000 && userData.avgOrderValue < 100) {
      insights.opportunities.push('High income with potential for higher order values')
    }
    if (userData.purchaseFrequency > 3) {
      insights.opportunities.push('High engagement - good candidate for loyalty programs')
    }
    
    // AI-like selection: choose 4 suggestions from large library based on inputs
    const issue = (userData.issue || '').toLowerCase()
    const suggestions = generateRecommendations(userData.preferredCategory, (prediction.probability/100), issue)

    const responsePayload = {
      ...prediction,
      insights,
      suggestions,
      timestamp: new Date().toISOString(),
      modelVersion: '1.0.0'
    }

    // If userId provided, save to happiness_predictions
    if (userData.userId) {
      await supabase
        .from('happiness_predictions')
        .insert({
          user_id: userData.userId,
          country_name: userData.issue || null,
          input_data: userData,
          prediction_result: responsePayload,
          confidence: prediction.probability
        })
    }

    res.json(responsePayload)
  } catch (error) {
    console.error('Error making prediction:', error)
    res.status(500).json({ error: 'Failed to generate prediction' })
  }
})

// GET /api/predict/model-info
router.get('/model-info', async (req, res) => {
  try {
    const modelInfo = {
      name: 'Customer Behavior Prediction Model',
      version: '1.0.0',
      algorithm: 'Simulated Naive Bayes',
      features: [
        'Age',
        'Annual Income',
        'Purchase Frequency',
        'Average Order Value',
        'Preferred Category',
        'Days Since Last Purchase'
      ],
      accuracy: 0.87,
      lastTrained: '2024-01-15T10:30:00Z',
      description: 'This model predicts customer purchase probability and segments customers based on their behavior patterns.'
    }
    
    res.json(modelInfo)
  } catch (error) {
    console.error('Error fetching model info:', error)
    res.status(500).json({ error: 'Failed to fetch model information' })
  }
})

// POST /api/predict/batch
router.post('/batch', async (req, res) => {
  try {
    const { customers } = req.body
    
    if (!customers || !Array.isArray(customers)) {
      return res.status(400).json({ error: 'Customers array is required' })
    }
    
    if (customers.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 customers per batch request' })
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
  const predictions = customers.map((customer, index) => ({
      id: customer.id || index,
      ...simulateNaiveBayes(customer),
      timestamp: new Date().toISOString()
    }))
    
    res.json({
      predictions,
      summary: {
        totalProcessed: predictions.length,
        avgProbability: predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length,
        segmentDistribution: predictions.reduce((acc, p) => {
          acc[p.segment] = (acc[p.segment] || 0) + 1
          return acc
        }, {})
      }
    })
  } catch (error) {
    console.error('Error processing batch predictions:', error)
    res.status(500).json({ error: 'Failed to process batch predictions' })
  }
})

// GET /api/predict/history?userId=UUID
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    const { data, error } = await supabase
      .from('happiness_predictions')
      .select('id, created_at, prediction_result')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    res.json({ history: data || [] })
  } catch (err) {
    console.error('history error', err)
    res.status(500).json({ error: 'Failed to fetch prediction history' })
  }
})

// GET /api/predict/summary?userId=UUID
router.get('/summary', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    const { data, error } = await supabase
      .from('happiness_predictions')
      .select('prediction_result, input_data', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    const count = data?.length || 0
    const latest = data?.[0]?.prediction_result || null
    const issue = data?.[0]?.input_data?.issue || null
    // cohort: how many share same issue
    let cohortCount = 0
    if (issue) {
      const { count: cohort } = await supabase
        .from('happiness_predictions')
        .select('id', { count: 'exact', head: true })
        .eq('input_data->>issue', issue)
      cohortCount = cohort || 0
    }
    res.json({ totalPredictions: count, latest, issue, cohortCount })
  } catch (err) {
    console.error('summary error', err)
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

// GET /api/predict/risk-series?userId=UUID&granularity=day|month|year
router.get('/risk-series', async (req, res) => {
  try {
    const { userId, granularity = 'day' } = req.query
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    const { data, error } = await supabase
      .from('happiness_predictions')
      .select('created_at, prediction_result')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error

    const buckets = {}
    const fmt = (d) => {
      const dt = new Date(d)
      if (granularity === 'year') return `${dt.getFullYear()}`
      if (granularity === 'month') return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`
      if (granularity === 'hour') return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:00`
      return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
    }

    ;(data || []).forEach(row => {
      const key = fmt(row.created_at)
      const risk = Number(row.prediction_result?.probability || 0)
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(risk)
    })

    const labels = Object.keys(buckets).sort()
    const values = labels.map(k => Math.round(buckets[k].reduce((a,b)=>a+b,0) / buckets[k].length))
    res.json({ labels, values })
  } catch (err) {
    console.error('risk-series error', err)
    res.status(500).json({ error: 'Failed to fetch risk series' })
  }
})

module.exports = router
