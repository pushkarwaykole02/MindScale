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

// Fallback suggestions (simplified)
const generateRecommendations = () => {
  return [
    'Practice 5-minute deep breathing exercises twice daily',
    'Take a 10-minute walk outside for natural light exposure',
    'Write down 3 things you\'re grateful for before bed',
    'Set a consistent sleep schedule and stick to it'
  ]
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
    
    // Use AI-generated suggestions if available, otherwise fallback to hardcoded
    const issue = (userData.issue || '').toLowerCase()
    let suggestions
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const { generateAISuggestions } = require('./ai-suggestions')
        suggestions = await generateAISuggestions(userData, issue)
      } catch (error) {
        console.error('AI suggestions failed, using fallback:', error)
        suggestions = generateRecommendations()
      }
    } else {
      suggestions = generateRecommendations(userData.preferredCategory, (prediction.probability/100), issue)
    }

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
