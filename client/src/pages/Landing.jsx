import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  BarChart3, 
  Users, 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const Landing = () => {
  const { user } = useAuth()

  const [overview, setOverview] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [topCountries, setTopCountries] = useState(null)
  const [availableYears, setAvailableYears] = useState([])
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)
  const [animatedStats, setAnimatedStats] = useState([
    { label: 'Years of Data', value: 0, target: 10, suffix: '+' },
    { label: 'Customer Records', value: 0, target: 1, suffix: 'M+' },
    { label: 'Data Points', value: 0, target: 50, suffix: 'M+' },
    { label: 'Accuracy Rate', value: 0, target: 95, suffix: '%' }
  ])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/happiness/overview')
        const ov = await res.json()
        setOverview(ov)
        setSelectedYear(ov.latestYear)
        setTopCountries(ov.top)
        setAvailableYears(ov.years || [])
      } catch (_) {}
    }
    load()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [statsVisible])

  useEffect(() => {
    if (!statsVisible) return
    const duration = 1200
    const steps = 50
    const stepTime = duration / steps
    let current = 0
    const interval = setInterval(() => {
      current++
      setAnimatedStats(prev => prev.map(s => ({
        ...s,
        value: Math.min(s.target, Math.floor((s.target * current) / steps))
      })))
      if (current >= steps) clearInterval(interval)
    }, stepTime)
    return () => clearInterval(interval)
  }, [statsVisible])

  const fetchTopCountriesForYear = async (year) => {
    try {
      const res = await fetch(`/api/happiness/top-countries?year=${year}`)
      const data = await res.json()
      setTopCountries(data.top)
    } catch (error) {
      console.error('Error fetching top countries:', error)
    }
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
    fetchTopCountriesForYear(year)
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Global Analytics',
      description: 'Explore multi‑year world happiness trends with clean visual summaries'
    },
    {
      icon: Users,
      title: 'Regional Insights',
      description: 'Compare regions and countries to understand patterns in well‑being'
    },
    {
      icon: Brain,
      title: 'Personal Check‑ins',
      description: 'Get wellness suggestions based on your inputs and global context'
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Track how happiness changes over time across the world'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data stays private and secure with Supabase authentication'
    },
    {
      icon: Zap,
      title: 'Real‑time Insights',
      description: 'Instant analytics and suggestions after each check‑in'
    }
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            MindScale
            <span className="text-primary-600"> – Mental Health Insights</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore global well-being metrics from the World Happiness Report with
            interactive analytics, regional insights, and personal comparisons.
          </p>
          
          {user ? (
            <div className="space-x-4">
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/signup"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {animatedStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Tools to explore global happiness and personalize your well‑being journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Global Insights Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Global Insights</h2>
            <p className="text-gray-600 dark:text-gray-300">Explore yearly happiness trends and the latest global highlights</p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yearly Trends (Average Happiness)</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {overview ? (
                  <div className="grid grid-cols-2 gap-2">
                    {overview.years?.map((y, i) => (
                      <div key={y} className="list-tile">
                        <span>{y}</span>
                        <span>{(overview.avgHappiness?.[i] ?? 0).toFixed ? overview.avgHappiness[i].toFixed(2) : overview.avgHappiness?.[i]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-pulse h-24 bg-gray-100 dark:bg-gray-700 rounded" />
                )}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top 10 Happiest Countries ({selectedYear || '-'})
                </h3>
                <select 
                  className="input-field w-auto text-sm"
                  value={selectedYear || ''}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {topCountries ? (
                  <ol className="list-decimal pl-5 space-y-1">
                    {topCountries.map((c, idx) => (
                      <li key={idx} className="list-tile">
                        <span className="badge mr-2">#{idx+1}</span>
                        <span className="flex-1 ml-2">{c.country_name}</span>
                        <span>{Number(c.happiness_score).toFixed(3)}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="animate-pulse h-24 bg-gray-100 dark:bg-gray-700 rounded" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses using our platform to understand their customers better.
          </p>
          
          {!user && (
            <Link
              to="/signup"
              className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg text-lg inline-flex items-center space-x-2 transition-colors duration-200"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/Logo.png" alt="MindScale" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold">MindScale</span>
            </div>
            <p className="text-gray-400">
              © 2025 MindScale. All rights reserved. Built with ❤️ and ☕.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
