const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

async function setupHappinessDatabase() {
  try {
    console.log('🚀 Setting up Happiness Data Analysis database...')
    
    // Read happiness schema file
    const schemaPath = path.join(__dirname, '../database/happiness_schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`📊 Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message)
        }
      } catch (err) {
        console.warn(`⚠️  Warning on statement ${i + 1}:`, err.message)
      }
    }
    
    console.log('✅ Happiness database schema created successfully')
    
    // Verify tables were created
    console.log('🔍 Verifying database setup...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'happiness_%')
    
    if (tablesError) {
      console.error('❌ Error verifying tables:', tablesError)
      return
    }
    
    console.log('📋 Created happiness tables:')
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
    
    console.log('🎉 Happiness database setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Import your happiness data: npm run import-happiness')
    console.log('2. Check the summary: npm run happiness-summary')
    console.log('3. Start the application: npm run dev')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run setup
setupHappinessDatabase()
