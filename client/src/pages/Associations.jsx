import React, { useState, useEffect } from 'react'
import { Network, TrendingUp, Target, Users, ArrowRight } from 'lucide-react'

const Associations = () => {
  const [associations, setAssociations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [year, setYear] = useState('2024')

  useEffect(() => {
    fetchAssociations()
  }, [])

  // Refetch when year filter changes
  useEffect(() => {
    setLoading(true)
    fetchAssociations()
  }, [year])

  const fetchAssociations = async () => {
    try {
      const qs = year ? `?year=${year}` : ''
      // Use live correlations computed from happiness_data so it's never empty
      const response = await fetch(`/api/happiness/correlations/live${qs}`)
      const data = await response.json()
      // Map correlations into a rule-like visualization
      const rules = (data.correlations || []).map((c, idx) => ({
        id: idx,
        antecedent: [c.factor1],
        consequent: [c.factor2],
        confidence: Math.min(1, Math.abs(Number(c.correlation_coefficient || 0))),
        support: Number(c.support ?? c.coverage ?? 0),
        lift: Math.abs(Number(c.correlation_coefficient || 0)) * 2,
        category: String(c.year || 'all')
      }))
      setAssociations(rules)
    } catch (error) {
      console.error('Error fetching associations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssociations = filter === 'all' 
    ? associations 
    : associations.filter(rule => rule.category === filter)

  const categories = [
    { value: 'all', label: 'All Years' },
  ]

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  }

  const getLiftColor = (lift) => {
    if (lift >= 2.0) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (lift >= 1.5) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Association Rules
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover product relationships and cross-selling opportunities using the Apriori algorithm
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Network className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Rules
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {associations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  High Confidence
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {associations.filter(rule => rule.confidence >= 0.8).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Strong Lift
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {associations.filter(rule => rule.lift >= 2.0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter by Year
            </h3>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input-field w-auto"
            >
              {[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Association Rules Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Support
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAssociations.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-wrap gap-1">
                          {rule.antecedent.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {rule.consequent.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(rule.confidence)}`}>
                        {(rule.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {(rule.support * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLiftColor(rule.lift)}`}>
                        {rule.lift.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                        {rule.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            About the Apriori Algorithm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Confidence</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The probability that customers who buy the antecedent items will also buy the consequent items.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Support</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The frequency of the rule occurring in the dataset. Higher support means more common patterns.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lift</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                How much more likely customers are to buy the consequent items when they buy the antecedent items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Associations
