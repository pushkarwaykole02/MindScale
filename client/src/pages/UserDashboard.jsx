import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PredictionForm from '../components/Forms/PredictionForm'
import BarChart from '../components/Charts/BarChart'
import ReportDownloader from '../components/ReportDownloader'
import { 
  User, 
  Target, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Award,
  Clock,
  Star
} from 'lucide-react'

const UserDashboard = () => {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState(null)
  const [riskLabels, setRiskLabels] = useState([])
  const [riskValues, setRiskValues] = useState([])
  const [granularity, setGranularity] = useState('hour')

  useEffect(() => {
    fetchHistory()
    fetchSummary()
  }, [])

  const fetchUserData = async () => {}

  const fetchHistory = async () => {
    try {
      if (!user?.id) return
      const res = await fetch(`/api/predict/history?userId=${user.id}`)
      const data = await res.json()
      setHistory(data.history || [])
    } catch (e) {}
  }

  const fetchSummary = async () => {
    try {
      if (!user?.id) return
      const res = await fetch(`/api/predict/summary?userId=${user.id}`)
      const data = await res.json()
      setSummary(data)
    } catch (e) {}
  }

  const fetchRiskSeries = async (g = granularity) => {
    try {
      if (!user?.id) return
      const res = await fetch(`/api/predict/risk-series?userId=${user.id}&granularity=${g}`)
      const data = await res.json()
      setRiskLabels(data.labels || [])
      setRiskValues(data.values || [])
    } catch (e) {}
  }

  useEffect(() => {
    fetchRiskSeries(granularity)
  }, [granularity, user?.id])

  const handlePrediction = async (data) => {
    setPrediction(data)
    try {
      await fetchHistory()
      await fetchSummary()
      await fetchRiskSeries(granularity)
    } catch (_) {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const latestPrediction = prediction || (history?.[0]?.prediction_result) || null
  
  // Calculate next check-in period based on risk level
  const calculateNextCheckIn = (riskPercentage) => {
    if (!riskPercentage || riskPercentage === 0) return 'No data'
    
    if (riskPercentage >= 80) return 'Within 1 day'
    if (riskPercentage >= 60) return 'Within 2 days'
    if (riskPercentage >= 40) return 'Within 3 days'
    if (riskPercentage >= 20) return 'Within 1 week'
    return 'Within 2 weeks'
  }
  
  const personalStats = [
    {
      title: 'Well-being Risk',
      value: `${latestPrediction?.probability ?? 0}%`,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Confidence',
      value: `${latestPrediction?.confidence ?? 0}%`,
      icon: Award,
      color: 'text-green-600'
    },
    {
      title: 'Next Check-in',
      value: calculateNextCheckIn(latestPrediction?.probability),
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Segment',
      value: latestPrediction?.segment || '—',
      icon: User,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div id="report-user-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Well-being Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your personalized well-being insights and comparisons with global data
              </p>
            </div>
            {/* Removed page-level download from My Dashboard per feedback */}
          </div>
        </div>

        {/* User Info Card */}
        <div className="card mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome back, {user?.email?.split('@')[0]}!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {summary?.totalPredictions ? `${summary.totalPredictions} prediction(s)` : 'No predictions yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {personalStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Prediction Form */}
        <PredictionForm onSubmit={handlePrediction} />

        {history.length > 0 && (
          <div className="card mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Predictions</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {history.map(h => (
                <div key={h.id} className="flex justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                  <span>{new Date(h.created_at).toLocaleString()}</span>
                  <span>{h.prediction_result?.segment} • {h.prediction_result?.probability}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Trend */}
        <div className="card mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Risk Over Time</h3>
            <select value={granularity} onChange={(e)=>setGranularity(e.target.value)} className="input-field w-auto">
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <BarChart
            height={360}
            title="Average Risk"
            data={{
              labels: riskLabels,
              datasets: [{
                label: 'Risk %',
                data: riskValues,
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
              }]
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default UserDashboard

