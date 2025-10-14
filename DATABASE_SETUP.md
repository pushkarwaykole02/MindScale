# Database Setup Guide

This guide will help you set up the Supabase database for the Customer Behavior Mining System.

## 🚀 Quick Setup

### Step 1: Run Database Schema

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Open your project dashboard

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute Schema**
   - Copy the contents of `database/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Copy and Execute Sample Data**
   - Copy the contents of `database/sample_data.sql`
   - Paste it into a new query
   - Click "Run" to execute

### Step 2: Verify Setup

Check that the following tables were created:
- ✅ `analytics` - Dashboard metrics
- ✅ `predictions` - ML predictions
- ✅ `clusters` - Customer segments
- ✅ `association_rules` - Product relationships
- ✅ `customer_data` - Customer information
- ✅ `transactions` - Transaction records
- ✅ `ml_models` - Model information
- ✅ `data_sources` - Imported datasets

## 🛠️ Alternative Setup (Using Scripts)

### Prerequisites
```bash
# Install additional dependencies
npm install csv-parser
```

### Run Setup Script
```bash
# Set up database schema and sample data
npm run setup-db
```

## 📊 Database Schema Overview

### Core Tables

#### 1. Analytics Table
```sql
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL NOT NULL,
    category VARCHAR(50),
    year INTEGER,
    month INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Customer Data Table
```sql
CREATE TABLE customer_data (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    age INTEGER,
    income DECIMAL,
    purchase_frequency DECIMAL,
    avg_order_value DECIMAL,
    total_spent DECIMAL,
    preferred_category VARCHAR(50),
    last_purchase_days INTEGER,
    region VARCHAR(50),
    cluster_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) REFERENCES customer_data(customer_id),
    product_category VARCHAR(50),
    product_name VARCHAR(100),
    quantity INTEGER,
    price DECIMAL,
    total_amount DECIMAL,
    transaction_date DATE,
    region VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Clusters Table
```sql
CREATE TABLE clusters (
    id SERIAL PRIMARY KEY,
    cluster_id INTEGER NOT NULL,
    cluster_name VARCHAR(100) NOT NULL,
    cluster_data JSONB NOT NULL,
    centroid_data JSONB NOT NULL,
    size INTEGER NOT NULL,
    revenue DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Association Rules Table
```sql
CREATE TABLE association_rules (
    id SERIAL PRIMARY KEY,
    antecedent JSONB NOT NULL,
    consequent JSONB NOT NULL,
    confidence DECIMAL NOT NULL,
    support DECIMAL NOT NULL,
    lift DECIMAL NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Security & Permissions

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Analytics**: Readable by authenticated users
- **Predictions**: Users can only see their own predictions
- **Clusters**: Readable by authenticated users
- **Association Rules**: Readable by authenticated users
- **Customer Data**: Readable by authenticated users
- **Transactions**: Readable by authenticated users

### Authentication
The system uses Supabase's built-in authentication:
- Email/password authentication
- JWT tokens for API access
- User session management

## 📈 Sample Data

The setup includes sample data for:

### Analytics Data
- Total customers, revenue, conversion rates
- Year-over-year trends (2020-2024)
- Monthly trends for 2024
- Category breakdowns

### Customer Clusters
- 5 distinct customer segments
- High Value, Frequent Buyers, Occasional, New, At-Risk
- Cluster characteristics and centroids
- Revenue distribution

### Association Rules
- 10 sample product relationships
- Confidence, support, and lift metrics
- Category-based rules

### Customer Data
- 20 sample customer records
- Complete demographic and behavioral data
- Cluster assignments

### Transaction Data
- 20 sample transaction records
- Product categories and pricing
- Customer relationships

## 🚀 Adding Your Own Data

### 1. Prepare Your Data

Create CSV files following the templates in `data/templates/`:

**Customer Data Format:**
```csv
customer_id,age,income,purchase_frequency,avg_order_value,total_spent,preferred_category,last_purchase_days,region
CUST_001,28,45000,2.1,89.50,1256.80,electronics,15,North
```

**Transaction Data Format:**
```csv
transaction_id,customer_id,product_category,product_name,quantity,price,total_amount,transaction_date,region
TXN_001,CUST_001,electronics,Smartphone,1,899.99,899.99,2024-01-15,North
```

### 2. Import Your Data

```bash
# Place your CSV files in the data/ folder
cp your_data.csv data/

# Import the data
npm run import-data
```

### 3. Verify Import

```bash
# Check import summary
npm run data-summary
```

## 🔧 Database Maintenance

### Backup
```sql
-- Create backup of all tables
pg_dump -h db.gahuqejspazatzgzujxp.supabase.co -U postgres -d postgres > backup.sql
```

### Cleanup
```sql
-- Clear all data (use with caution)
TRUNCATE TABLE analytics, predictions, clusters, association_rules, customer_data, transactions, ml_models, data_sources RESTART IDENTITY CASCADE;
```

### Performance Optimization
```sql
-- Analyze tables for better performance
ANALYZE analytics;
ANALYZE customer_data;
ANALYZE transactions;
ANALYZE clusters;
ANALYZE association_rules;
```

## 📊 Monitoring & Analytics

### Database Metrics
- Table sizes and row counts
- Index usage statistics
- Query performance metrics
- Storage utilization

### Application Metrics
- User authentication events
- API endpoint usage
- Data import statistics
- ML model performance

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check RLS policies
   - Verify user authentication
   - Ensure proper API keys

2. **Import Failures**
   - Validate CSV format
   - Check data types
   - Verify foreign key relationships

3. **Performance Issues**
   - Add appropriate indexes
   - Optimize queries
   - Monitor resource usage

### Debug Queries

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public';
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Best Practices](https://supabase.com/docs/guides/database/best-practices)

---

Your database is now ready for the Customer Behavior Mining System! 🎉
