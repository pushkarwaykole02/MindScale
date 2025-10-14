const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// AI-powered wellness suggestion generator
const generateAISuggestions = async (userData, issueText) => {
  try {
    const { age, income, purchaseFrequency, avgOrderValue, preferredCategory, lastPurchaseDays } = userData
    
    // Map fields to wellness context
    const sleepHours = Number(income)
    const stressLevel = Number(purchaseFrequency)
    const activityMinutes = Number(avgOrderValue)
    const lowMoodDays = Number(lastPurchaseDays)
    
    // Create context for AI
    const context = `
User Profile:
- Age: ${age}
- Sleep Hours: ${sleepHours} hours per night
- Stress Level: ${stressLevel}/10
- Daily Activity: ${activityMinutes} minutes
- Low Mood Days This Month: ${lowMoodDays}
- Primary Concern: ${issueText || 'General wellness'}
- Focus Area: ${preferredCategory}
`

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `You are a certified wellness coach and mental health professional. Provide evidence-based, personalized wellness suggestions. Always prioritize safety and recommend professional help when appropriate. Keep suggestions practical and achievable.

${context}

Please respond with a JSON object containing a "suggestions" array with exactly 4 personalized wellness suggestions. Each suggestion should be ONE SIMPLE SENTENCE in plain language that anyone can understand. Focus on actionable, easy-to-follow advice.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const response = JSON.parse(jsonMatch[0])
      return response.suggestions || []
    } else {
      // Fallback: extract suggestions from text if JSON parsing fails
      const lines = text.split('\n').filter(line => line.trim())
      return lines.slice(0, 4).map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
    }

  } catch (error) {
    console.error('Gemini API Error:', error)
    // Fallback to hardcoded suggestions if AI fails
    return generateFallbackSuggestions()
  }
}

// Fallback suggestions (simplified)
const generateFallbackSuggestions = () => {
  return [
    'Practice 5-minute deep breathing exercises twice daily',
    'Take a 10-minute walk outside for natural light exposure',
    'Write down 3 things you\'re grateful for before bed',
    'Set a consistent sleep schedule and stick to it'
  ]
}

// POST /api/ai-suggestions
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
    
    // Generate AI suggestions
    const suggestions = await generateAISuggestions(userData, userData.issue)
    
    res.json({
      suggestions,
      source: process.env.GEMINI_API_KEY ? 'AI-Generated (Gemini)' : 'Fallback',
      timestamp: new Date().toISOString(),
      modelVersion: '3.0.0'
    })
    
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    res.status(500).json({ error: 'Failed to generate suggestions' })
  }
})

// GET /api/ai-suggestions/health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    aiEnabled: !!process.env.GEMINI_API_KEY,
    aiProvider: 'Google Gemini',
    timestamp: new Date().toISOString()
  })
})

// Export the function for use in other routes
module.exports = { router, generateAISuggestions }
