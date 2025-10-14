import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LineChart from '../components/Charts/LineChart'
import BarChart from '../components/Charts/BarChart'
import DoughnutChart from '../components/Charts/DoughnutChart'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart,
  Activity,
  Target
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regionYear, setRegionYear] = useState(null)
  const [clusterYear, setClusterYear] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [countryData, setCountryData] = useState(null)
  const [allCountries, setAllCountries] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, regionsRes, clustersRes, countriesRes] = await Promise.all([
        fetch('/api/happiness/overview'),
        fetch('/api/happiness/regions'),
        fetch('/api/happiness/cluster-distribution'),
        fetch('/api/happiness/countries')
      ])
      const [overview, regions, clusters, { countries }] = await Promise.all([
        overviewRes.json(), regionsRes.json(), clustersRes.json(), countriesRes.json()
      ])
      setAnalytics({ overview, regions, clusters })
      setRegionYear(regions.year)
      setClusterYear(clusters.year)
      setAllCountries(countries)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCountryData = async (country) => {
    if (!country) return
    try {
      const res = await fetch(`/api/happiness/country-trends?country=${encodeURIComponent(country)}`)
      const data = await res.json()
      setCountryData(data)
    } catch (error) {
      console.error('Error fetching country data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Latest Year',
      value: analytics?.overview?.latestYear || '-',
      change: '',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Happiness (Global)',
      value: (analytics?.overview?.avgHappiness?.slice(-1)[0] || 0).toFixed ? (analytics?.overview?.avgHappiness?.slice(-1)[0]).toFixed(2) : analytics?.overview?.avgHappiness?.slice(-1)[0] || '-',
      change: '',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Regions Covered',
      value: Object.keys(analytics?.regions?.regions || {}).length,
      change: '',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      title: 'Clusters',
      value: Object.values(analytics?.clusters?.buckets || {}).reduce((a,b)=>a+b,0),
      change: '',
      icon: Users,
      color: 'text-orange-600'
    }
  ]

  const yearlyTrendsData = {
    labels: selectedCountry ? (countryData?.years || []) : (analytics?.overview?.years || []),
    datasets: [
      {
        label: selectedCountry ? `${selectedCountry} Happiness` : 'Average Happiness',
        data: selectedCountry ? (countryData?.scores || []) : (analytics?.overview?.avgHappiness || []),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const canonicalRegions = [
    'Sub-Saharan Africa',
    'Latin America and Caribbean',
    'Middle East and Northern Africa',
    'Central and Eastern Europe',
    'Southeastern Asia',
    'North America',
    'Western Europe',
    'Southern Asia',
    'Eastern Asia',
    'Australia and New Zealand'
  ]

  const regionsObj = analytics?.regions?.regions || {}
  const regionLabels = canonicalRegions.filter(r => regionsObj[r] !== undefined)
  const regionValues = regionLabels.map(r => regionsObj[r])

  const regionData = {
    labels: regionLabels,
    datasets: [
      {
        label: 'Regional Avg Happiness',
        data: regionValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ]
      }
    ]
  }

  // Ensure all segments are always shown, even with 0 values
  const defaultBuckets = {
    'Very Happy Countries': 0,
    'Happy Countries': 0,
    'Moderately Happy Countries': 0,
    'Less Happy Countries': 0,
    'Unhappy Countries': 0
  }
  
  const buckets = { ...defaultBuckets, ...(analytics?.clusters?.buckets || {}) }
  
  const segmentData = {
    labels: Object.keys(buckets),
    datasets: [
      {
        data: Object.values(buckets),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',    // Blue - Very Happy
          'rgba(16, 185, 129, 0.8)',    // Green - Happy
          'rgba(245, 158, 11, 0.8)',    // Orange - Moderately Happy
          'rgba(139, 92, 246, 0.8)',    // Purple - Less Happy
          'rgba(239, 68, 68, 0.8)'      // Red - Unhappy
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            World Happiness & Mental Health Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Global well-being metrics, regional insights, and clusters from the World Happiness Report
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
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
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCountry ? `${selectedCountry} Trends` : 'Yearly Trends (2015-2024)'}
              </h3>
              <div className="flex space-x-2">
                <select 
                  className="input-field w-auto" 
                  value={selectedCountry} 
                  onChange={(e) => {
                    const country = e.target.value
                    setSelectedCountry(country)
                    if (country) {
                      fetchCountryData(country)
                    } else {
                      setCountryData(null)
                    }
                  }}
                  style={{ maxHeight: '300px', overflow: 'auto' }}
                >
                  <option value="">Global Average</option>
                  {allCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            <LineChart 
              data={yearlyTrendsData} 
              title={''} 
              height={400}
            />
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Regional Average Happiness</h3>
              <select className="input-field w-auto" value={regionYear || ''} onChange={async (e)=>{
                const y = e.target.value
                setRegionYear(y)
                try {
                  const res = await fetch(`/api/happiness/regions?year=${y}`)
                  const data = await res.json()
                  setAnalytics(prev => ({ ...prev, regions: data }))
                } catch (err) { console.error(err) }
              }}>
                {(analytics?.overview?.years||[]).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <BarChart 
              data={regionData} 
              title={''} 
              height={400}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Happiness Segments Distribution</h3>
              <select className="input-field w-auto" value={clusterYear || ''} onChange={async (e)=>{
                const y = e.target.value
                setClusterYear(y)
                try {
                  const res = await fetch(`/api/happiness/cluster-distribution?year=${y}`)
                  const data = await res.json()
                  setAnalytics(prev => ({ ...prev, clusters: data }))
                } catch (err) { console.error(err) }
              }}>
                {(analytics?.overview?.years||[]).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <DoughnutChart 
              data={segmentData} 
              title={''}
              height={400}
            />
          </div>
          
          {/* Insights */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-6 w-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Latest Insights
              </h3>
            </div>
            <div className="space-y-4">
              {(() => {
                const latestYear = analytics?.overview?.latestYear
                const top = analytics?.overview?.top?.[0]
                const bottom = analytics?.overview?.bottom?.[0]
                const regionsCount = Object.keys(analytics?.regions?.regions || {}).length
                const avg = analytics?.overview?.avgHappiness?.slice(-1)[0]
                const totalCountries = Object.values(analytics?.clusters?.buckets || {}).reduce((a,b)=>a+b,0)
                console.log('Cluster buckets:', analytics?.clusters?.buckets)
                console.log('Total countries calculated:', totalCountries)
                const items = [
                  top ? { action: `Top country (${latestYear}): ${top.country_name} (${Number(top.happiness_score).toFixed(3)})`, time: '', type: 'success' } : null,
                  bottom ? { action: `Lowest country (${latestYear}): ${bottom.country_name} (${Number(bottom.happiness_score).toFixed(3)})`, time: '', type: 'warning' } : null,
                  { action: `Regions covered (${latestYear}): ${regionsCount}`, time: '', type: 'info' },
                  { action: `Avg global happiness (${latestYear}): ${avg?.toFixed ? avg.toFixed(2) : avg}`, time: '', type: 'info' },
                  { action: `Countries counted (${latestYear}): ${totalCountries}`, time: '', type: 'info' }
                ].filter(Boolean)
                return items
              })().map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
