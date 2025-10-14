const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const { createReadStream } = require('fs')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to process happiness data based on year
function toNumber(value) {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return isNaN(value) ? null : value
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '.').trim()
    const n = parseFloat(cleaned)
    return isNaN(n) ? null : n
  }
  return null
}

function processHappinessData(row, year) {
  // Normalize common header variants (all keys lower-cased by mapHeaders)
  const get = (keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== '') return row[k]
    }
    return ''
  }

  const getNum = (keys) => toNumber(get(keys))

  const baseData = {
    year: year,
    country_name: get([
      'country name','country or region','country','country_name'
    ]),
    region: get(['region']),
    happiness_rank: toNumber(row['happiness rank']) || null,
    happiness_score: getNum([
      'happiness score','ladder score','life ladder','happiness.score','happiness_score','score'
    ]),
    upper_whisker: getNum(['upperwhisker','upper whisker']),
    lower_whisker: getNum(['lowerwhisker','lower whisker']),
    economy_gdp_per_capita: getNum(['economy (gdp per capita)','economy_gdp_per_capita','gdp per capita']),
    social_support: getNum(['social support','family']),
    healthy_life_expectancy: getNum(['healthy life expectancy','health (life expectancy)']),
    freedom_to_make_life_choices: getNum(['freedom to make life choices','freedom']),
    generosity: getNum(['generosity']),
    perceptions_of_corruption: getNum(['perceptions of corruption','trust (government corruption)']),
    standard_error: getNum(['standard error']),
    family: getNum(['family']),
    trust_government_corruption: getNum(['trust (government corruption)']),
    dystopia_residual: getNum(['dystopia residual'])
  }

  return baseData
}

// Function to import happiness data for a specific year
async function importHappinessDataForYear(filePath, year) {
  return new Promise((resolve, reject) => {
    const results = []
    
    createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
      .on('data', (data) => {
        const processedData = processHappinessData(data, year)
        if (processedData.country_name && processedData.happiness_score) {
          results.push(processedData)
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Importing ${results.length} happiness records for ${year}...`)
          
          // Insert data in batches
          const batchSize = 50
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize)
            const { error } = await supabase
              .from('happiness_data')
              .upsert(batch, { onConflict: 'year,country_name' })
            
            if (error) {
              console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1} for ${year}:`, error)
              reject(error)
              return
            }
            
            console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(results.length/batchSize)} for ${year}`)
          }
          
          resolve(results.length)
        } catch (error) {
          reject(error)
        }
      })
      .on('error', reject)
  })
}

// Function to generate analytics from happiness data
async function generateHappinessAnalytics() {
  try {
    console.log('📈 Generating happiness analytics...')
    
    // Get data for analytics
    const { data: happinessData, error } = await supabase
      .from('happiness_data')
      .select('*')
      .order('year', { ascending: true })
      .range(0, 20000)
    
    if (error) {
      console.error('❌ Error fetching happiness data:', error)
      return
    }
    
    // Group by year
    const yearlyData = {}
    happinessData.forEach(row => {
      if (!yearlyData[row.year]) {
        yearlyData[row.year] = []
      }
      yearlyData[row.year].push(row)
    })
    
    // Determine latest year available for regional metrics
    const years = Object.keys(yearlyData).map(y => parseInt(y))
    const latestYear = years.length > 0 ? Math.max(...years) : null

    // Generate analytics for each year
    for (const [year, data] of Object.entries(yearlyData)) {
      const avgHappiness = data.reduce((sum, row) => sum + (row.happiness_score || 0), 0) / data.length
      const avgEconomy = data.reduce((sum, row) => sum + (row.economy_gdp_per_capita || 0), 0) / data.length
      const avgSocialSupport = data.reduce((sum, row) => sum + (row.social_support || 0), 0) / data.length
      const avgHealth = data.reduce((sum, row) => sum + (row.healthy_life_expectancy || 0), 0) / data.length
      const avgFreedom = data.reduce((sum, row) => sum + (row.freedom_to_make_life_choices || 0), 0) / data.length
      const avgGenerosity = data.reduce((sum, row) => sum + (row.generosity || 0), 0) / data.length
      const avgCorruption = data.reduce((sum, row) => sum + (row.perceptions_of_corruption || 0), 0) / data.length
      
      const analytics = [
        { metric_name: 'Average Happiness Score', metric_value: avgHappiness, category: 'overview', year: parseInt(year), region: 'GLOBAL' },
        { metric_name: 'Average Economy Score', metric_value: avgEconomy, category: 'factors', year: parseInt(year), region: 'GLOBAL' },
        { metric_name: 'Average Social Support', metric_value: avgSocialSupport, category: 'factors', year: parseInt(year), region: 'GLOBAL' },
        { metric_name: 'Average Health Score', metric_value: avgHealth, category: 'factors', year: parseInt(year), region: 'GLOBAL' },
        { metric_name: 'Average Freedom Score', metric_value: avgFreedom, category: 'factors', year: parseInt(year), region: 'GLOBAL' },
        { metric_name: 'Average Generosity', metric_value: avgGenerosity, category: 'factors', year: parseInt(year), region: 'GLOBAL' },
        { metric_name: 'Average Corruption Score', metric_value: avgCorruption, category: 'factors', year: parseInt(year), region: 'GLOBAL' },
        { metric_name: 'Total Countries', metric_value: data.length, category: 'overview', year: parseInt(year), region: 'GLOBAL' }
      ]
      
      // Insert analytics
      const { error: analyticsError } = await supabase
        .from('happiness_analytics')
        .upsert(analytics, { onConflict: 'metric_name,region,year' })
      
      if (analyticsError) {
        console.error(`❌ Error inserting analytics for ${year}:`, analyticsError)
      } else {
        console.log(`✅ Generated analytics for ${year}`)
      }
    }
    
    // Generate regional analytics
    const regionalData = {}
    happinessData.forEach(row => {
      if (row.region) {
        if (!regionalData[row.region]) {
          regionalData[row.region] = []
        }
        regionalData[row.region].push(row)
      }
    })
    
    for (const [region, data] of Object.entries(regionalData)) {
      const avgHappiness = data.reduce((sum, row) => sum + (row.happiness_score || 0), 0) / data.length
      
      const { error: regionalError } = await supabase
        .from('happiness_analytics')
        .upsert([{
          metric_name: 'Regional Average Happiness',
          metric_value: avgHappiness,
          category: 'regional',
          region: region,
          year: latestYear // Use latest detected year for regional data
        }], { onConflict: 'metric_name,region,year' })
      
      if (regionalError) {
        console.error(`❌ Error inserting regional analytics for ${region}:`, regionalError)
      } else {
        console.log(`✅ Generated regional analytics for ${region}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error generating analytics:', error)
  }
}

// Function to create sample happiness clusters
async function createHappinessClusters() {
  try {
    console.log('🎯 Creating happiness clusters...')
    
    // Determine latest year with available data
    const { data: latestYearRow, error: latestYearError } = await supabase
      .from('happiness_data')
      .select('year')
      .order('year', { ascending: false })
      .limit(1)

    if (latestYearError || !latestYearRow || latestYearRow.length === 0) {
      console.error('❌ Error determining latest year for clusters:', latestYearError)
      return
    }

    const latestYear = latestYearRow[0].year

    // Get latest year data for clustering
    const { data: latestData, error } = await supabase
      .from('happiness_data')
      .select('*')
      .eq('year', latestYear)
      .order('happiness_score', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching latest data:', error)
      return
    }
    
    // Create clusters based on happiness score ranges
    const clusters = [
      {
        cluster_id: 0,
        cluster_name: 'Very Happy Countries',
        cluster_description: 'Countries with happiness scores above 7.0',
        centroid_data: {
          happiness_score: 7.5,
          economy_gdp_per_capita: 1.8,
          social_support: 1.5,
          healthy_life_expectancy: 0.9,
          freedom_to_make_life_choices: 0.8,
          generosity: 0.2,
          perceptions_of_corruption: 0.3
        },
        countries: [],
        avg_happiness_score: 0,
        size: 0
      },
      {
        cluster_id: 1,
        cluster_name: 'Happy Countries',
        cluster_description: 'Countries with happiness scores between 6.0-7.0',
        centroid_data: {
          happiness_score: 6.5,
          economy_gdp_per_capita: 1.3,
          social_support: 1.2,
          healthy_life_expectancy: 0.8,
          freedom_to_make_life_choices: 0.7,
          generosity: 0.15,
          perceptions_of_corruption: 0.4
        },
        countries: [],
        avg_happiness_score: 0,
        size: 0
      },
      {
        cluster_id: 2,
        cluster_name: 'Moderately Happy Countries',
        cluster_description: 'Countries with happiness scores between 5.0-6.0',
        centroid_data: {
          happiness_score: 5.5,
          economy_gdp_per_capita: 1.0,
          social_support: 1.0,
          healthy_life_expectancy: 0.7,
          freedom_to_make_life_choices: 0.6,
          generosity: 0.1,
          perceptions_of_corruption: 0.5
        },
        countries: [],
        avg_happiness_score: 0,
        size: 0
      },
      {
        cluster_id: 3,
        cluster_name: 'Less Happy Countries',
        cluster_description: 'Countries with happiness scores between 4.0-5.0',
        centroid_data: {
          happiness_score: 4.5,
          economy_gdp_per_capita: 0.7,
          social_support: 0.8,
          healthy_life_expectancy: 0.6,
          freedom_to_make_life_choices: 0.5,
          generosity: 0.05,
          perceptions_of_corruption: 0.6
        },
        countries: [],
        avg_happiness_score: 0,
        size: 0
      },
      {
        cluster_id: 4,
        cluster_name: 'Unhappy Countries',
        cluster_description: 'Countries with happiness scores below 4.0',
        centroid_data: {
          happiness_score: 3.5,
          economy_gdp_per_capita: 0.4,
          social_support: 0.6,
          healthy_life_expectancy: 0.5,
          freedom_to_make_life_choices: 0.4,
          generosity: 0.02,
          perceptions_of_corruption: 0.7
        },
        countries: [],
        avg_happiness_score: 0,
        size: 0
      }
    ]
    
    // Assign countries to clusters
    latestData.forEach(country => {
      const score = country.happiness_score || 0
      let clusterId = 4 // Default to unhappy
      
      if (score >= 7.0) clusterId = 0
      else if (score >= 6.0) clusterId = 1
      else if (score >= 5.0) clusterId = 2
      else if (score >= 4.0) clusterId = 3
      
      clusters[clusterId].countries.push(country.country_name)
      clusters[clusterId].size++
    })
    
    // Calculate average happiness scores for each cluster
    clusters.forEach(cluster => {
      if (cluster.size > 0) {
        const clusterCountries = latestData.filter(country => 
          cluster.countries.includes(country.country_name)
        )
        cluster.avg_happiness_score = clusterCountries.reduce((sum, country) => 
          sum + (country.happiness_score || 0), 0) / clusterCountries.length
      }
    })
    
    // Insert clusters
    const { error: clusterError } = await supabase
      .from('happiness_clusters')
      .upsert(clusters, { onConflict: 'cluster_id' })
    
    if (clusterError) {
      console.error('❌ Error inserting clusters:', clusterError)
    } else {
      console.log('✅ Created happiness clusters')
    }
    
  } catch (error) {
    console.error('❌ Error creating clusters:', error)
  }
}

// Main import function
async function importHappinessData() {
  try {
    console.log('🚀 Starting happiness data import process...')
    
    const dataDir = path.join(__dirname, '../data')
    
    // Check if data directory exists
    if (!fs.existsSync(dataDir)) {
      console.error('❌ Data directory not found. Please create the data/ folder and add your datasets.')
      return
    }
    
    // Find CSV files
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.csv') && /^\d{4}\.csv$/.test(file))
      .sort()
    
    if (files.length === 0) {
      console.log('📁 No happiness CSV files found in data directory')
      console.log('Please add your happiness datasets (2015.csv, 2016.csv, etc.) to the data/ folder')
      return
    }
    
    console.log(`📁 Found ${files.length} happiness CSV files to import`)
    
    let totalImported = 0
    
    for (const file of files) {
      const year = parseInt(file.replace('.csv', ''))
      const filePath = path.join(dataDir, file)
      
      console.log(`\n📊 Processing ${file} (Year: ${year})...`)
      
      try {
        const recordCount = await importHappinessDataForYear(filePath, year)
        totalImported += recordCount
        
        console.log(`✅ Successfully imported ${recordCount} records from ${file}`)
        
      } catch (error) {
        console.error(`❌ Error importing ${file}:`, error)
      }
    }
    
    console.log(`\n🎉 Happiness data import completed!`)
    console.log(`📊 Total records imported: ${totalImported}`)
    
    // Generate analytics and clusters
    await generateHappinessAnalytics()
    await createHappinessClusters()
    
    // Generate summary statistics
    await generateImportSummary()
    
  } catch (error) {
    console.error('❌ Import process failed:', error)
  }
}

async function generateImportSummary() {
  try {
    console.log('\n📈 Generating import summary...')
    
    // Get total records count
    const { count: totalCount, error: totalError } = await supabase
      .from('happiness_data')
      .select('*', { count: 'exact', head: true })
    
    if (totalError) {
      console.error('❌ Error getting total count:', totalError)
    } else {
      console.log(`🌍 Total happiness records: ${totalCount}`)
    }
    
    // Get year distribution
    const { data: yearData, error: yearError } = await supabase
      .from('happiness_data')
      .select('year')
      .range(0, 20000)
    
    if (!yearError && yearData) {
      const yearDistribution = yearData.reduce((acc, row) => {
        const year = row.year
        acc[year] = (acc[year] || 0) + 1
        return acc
      }, {})
      
      console.log('\n📅 Year distribution:')
      Object.entries(yearDistribution).sort().forEach(([year, count]) => {
        console.log(`  ${year}: ${count} countries`)
      })
    }
    
    // Get cluster distribution
    const { data: clusters, error: clusterError } = await supabase
      .from('happiness_clusters')
      .select('*')
    
    if (!clusterError && clusters) {
      console.log('\n🎯 Happiness clusters:')
      clusters.forEach(cluster => {
        console.log(`  ${cluster.cluster_name}: ${cluster.size} countries (avg score: ${cluster.avg_happiness_score?.toFixed(2)})`)
      })
    }
    
    // Get top 10 happiest countries
    const { data: topCountries, error: topError } = await supabase
      .from('happiness_data')
      .select('country_name, happiness_score, year')
      .eq('year', 2024)
      .order('happiness_score', { ascending: false })
      .limit(10)
    
    if (!topError && topCountries) {
      console.log('\n🏆 Top 10 Happiest Countries (2024):')
      topCountries.forEach((country, index) => {
        console.log(`  ${index + 1}. ${country.country_name}: ${country.happiness_score?.toFixed(3)}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error generating summary:', error)
  }
}

// Command line interface
const command = process.argv[2]

switch (command) {
  case 'import':
    importHappinessData()
    break
  case 'summary':
    generateImportSummary()
    break
  default:
    console.log('📋 Available commands:')
    console.log('  npm run import-happiness    - Import all happiness CSV files from data/ folder')
    console.log('  npm run happiness-summary   - Show happiness data import summary')
    break
}

module.exports = { importHappinessData, generateImportSummary }
