import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Users, ShoppingCart } from 'lucide-react'
import BarChart from '../Charts/BarChart'
import { useAuth } from '../../contexts/AuthContext'

const PredictionForm = ({ onSubmit }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    age: '',              // years
    income: '',           // repurposed: average sleep hours
    purchaseFrequency: '',// repurposed: stress level 1-10
    avgOrderValue: '',    // repurposed: physical activity (mins/day)
    preferredCategory: '',// repurposed: primary well-being focus
    lastPurchaseDays: '', // repurposed: days feeling low this month
    issue: ''             // user-described primary issue
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [globalComparison, setGlobalComparison] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Map well-being focus to server's expected categories
      const focusMap = {
        social_support: 'electronics',
        work_life_balance: 'home',
        mental_health: 'books',
        physical_health: 'sports',
        financial_security: 'clothing'
      }
      const payload = {
        ...formData,
        preferredCategory: focusMap[formData.preferredCategory] || 'books',
        userId: user?.id || null
      }

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      setResult(data)
      // Fetch global category distribution to compare with user's preferred category
      try {
        const globalRes = await fetch('/api/analytics/categories')
        const global = await globalRes.json()
        setGlobalComparison(global)
      } catch (_) {}
      if (onSubmit) onSubmit(data)
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="h-6 w-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personal Well-being Check-in
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your age"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avg Sleep (hours)
            </label>
            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              className="input-field"
              placeholder="Average sleep hours"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stress Level (1-10)
            </label>
            <input
              type="number"
              name="purchaseFrequency"
              value={formData.purchaseFrequency}
              onChange={handleChange}
              className="input-field"
              placeholder="Your stress rating"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Physical Activity (mins/day)
            </label>
            <input
              type="number"
              name="avgOrderValue"
              value={formData.avgOrderValue}
              onChange={handleChange}
              className="input-field"
              placeholder="Minutes per day"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Well-being Focus
            </label>
            <select
              name="preferredCategory"
              value={formData.preferredCategory}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select focus</option>
              <option value="mental_health">Mental health</option>
              <option value="social_support">Social support</option>
              <option value="physical_health">Physical health</option>
              <option value="work_life_balance">Work-life balance</option>
              <option value="financial_security">Financial security</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Describe your primary issue (optional)
            </label>
            <input
              type="text"
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., anxiety, sleep, stress"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Days Feeling Low (this month)
            </label>
            <input
              type="number"
              name="lastPurchaseDays"
              value={formData.lastPurchaseDays}
              onChange={handleChange}
              className="input-field"
              placeholder="Number of days"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              <span>Predict Mental Health</span>
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
            Prediction Results
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary-600" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Profile:</strong> {result.segment}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary-600" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Well-being Risk:</strong> {result.probability}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-primary-600" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Suggested Actions:</strong> {result.recommendations?.join(', ')}
              </span>
            </div>
          </div>
          {/* Removed inline chart to avoid duplication with dashboard section */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="font-semibold mb-1">AI Suggestions</div>
              <ul className="list-disc pl-5 space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PredictionForm
