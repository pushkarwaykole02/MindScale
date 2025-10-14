# Happiness Data Analysis System

This system analyzes World Happiness Report datasets (2015-2024) using machine learning algorithms to understand happiness trends and factors.

## 🌍 Your Data

You have **World Happiness Report** datasets for years 2015-2024, which is perfect for:
- **Trend Analysis**: Track happiness changes over time
- **Country Clustering**: Group countries by happiness patterns
- **Factor Analysis**: Understand what drives happiness
- **Predictive Modeling**: Predict happiness scores

## 📊 Data Structure

Your CSV files contain:
- **Country name** - Country identifier
- **Happiness Rank** - Ranking among all countries
- **Happiness Score** - Overall happiness score (0-10)
- **Economy (GDP per Capita)** - Economic factor
- **Social Support** - Social relationships factor
- **Healthy Life Expectancy** - Health factor
- **Freedom to Make Life Choices** - Freedom factor
- **Generosity** - Generosity factor
- **Perceptions of Corruption** - Trust in government factor

## 🚀 Quick Setup

### Step 1: Set Up Happiness Database
```bash
# Set up the happiness-specific database schema
npm run setup-happiness-db
```

### Step 2: Import Your Data
```bash
# Import all your happiness CSV files (2015-2024)
npm run import-happiness
```

### Step 3: Check Import Summary
```bash
# View import statistics and data overview
npm run happiness-summary
```

## 🎯 Machine Learning Features

### 1. Happiness Clustering (K-Means)
- **Very Happy Countries** (Score > 7.0)
- **Happy Countries** (Score 6.0-7.0)
- **Moderately Happy Countries** (Score 5.0-6.0)
- **Less Happy Countries** (Score 4.0-5.0)
- **Unhappy Countries** (Score < 4.0)

### 2. Happiness Prediction (Naive Bayes)
- Predict happiness scores based on factors
- Input: Economy, Social Support, Health, Freedom, Generosity, Corruption
- Output: Predicted happiness score and confidence

### 3. Factor Correlation Analysis
- Analyze relationships between happiness factors
- Identify which factors most influence happiness
- Regional and temporal correlation patterns

## 📈 Analytics Dashboard

The system will provide:

### Global Trends
- Year-over-year happiness changes
- Regional happiness comparisons
- Factor evolution over time

### Country Analysis
- Individual country happiness trajectories
- Factor breakdowns by country
- Comparative analysis tools

### Clustering Insights
- Country groupings by happiness patterns
- Cluster characteristics and trends
- Migration between clusters over time

## 🔧 Database Schema

### Core Tables
- **happiness_data** - All happiness report data
- **happiness_clusters** - ML clustering results
- **happiness_predictions** - Prediction results
- **happiness_analytics** - Dashboard metrics
- **happiness_trends** - Trend analysis data
- **happiness_correlations** - Factor correlations

## 📊 Sample Insights You'll Get

### Top Happiest Countries (2024)
1. Finland: 7.741
2. Denmark: 7.583
3. Iceland: 7.525
4. Sweden: 7.344
5. Israel: 7.341

### Happiness Factors Impact
- **Economy**: Strong correlation with happiness
- **Social Support**: Critical for high happiness
- **Health**: Important but not the only factor
- **Freedom**: Significant for overall well-being
- **Generosity**: Moderate impact
- **Corruption**: Negative correlation

### Regional Patterns
- **Nordic Countries**: Consistently high happiness
- **Western Europe**: Generally high happiness
- **North America**: Moderate to high happiness
- **Asia**: Mixed results
- **Africa**: Generally lower happiness scores

## 🎨 Customized Dashboard

The system will be adapted to show:

### Happiness Analytics Dashboard
- Global happiness trends (2015-2024)
- Regional happiness heatmaps
- Factor importance charts
- Country ranking visualizations

### Country Dashboard
- Individual country happiness profiles
- Factor breakdowns and trends
- Comparison with similar countries
- Prediction tools for policy impact

### Clustering Dashboard
- Interactive cluster visualization
- Country movement between clusters
- Cluster characteristics analysis
- Factor-based clustering

## 🚀 Getting Started

1. **Set up the database**:
   ```bash
   npm run setup-happiness-db
   ```

2. **Import your data**:
   ```bash
   npm run import-happiness
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

4. **Access the dashboard**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📋 Data Processing

The system will automatically:
- ✅ Parse different CSV formats (2015-2024 have slight variations)
- ✅ Handle missing values and data inconsistencies
- ✅ Normalize factor scores across years
- ✅ Create time-series data for trend analysis
- ✅ Generate regional aggregations
- ✅ Calculate correlation matrices

## 🎯 Machine Learning Pipeline

### 1. Data Preprocessing
- Clean and normalize happiness data
- Handle missing values
- Create feature vectors

### 2. Clustering Analysis
- K-Means clustering on happiness factors
- Silhouette analysis for optimal clusters
- Cluster interpretation and naming

### 3. Predictive Modeling
- Train models to predict happiness scores
- Feature importance analysis
- Cross-validation and performance metrics

### 4. Correlation Analysis
- Calculate factor correlations
- Identify key happiness drivers
- Regional and temporal patterns

## 📊 Expected Results

After importing your data, you'll have:
- **1,000+ happiness records** across 10 years
- **150+ countries** with complete data
- **6 happiness factors** analyzed
- **5 happiness clusters** identified
- **Predictive models** for happiness scoring
- **Interactive dashboards** for exploration

## 🔍 Data Quality

The system handles:
- **Format variations** between years
- **Missing data** imputation
- **Outlier detection** and handling
- **Data validation** and cleaning
- **Consistency checks** across years

## 🎉 Ready to Analyze!

Your World Happiness Report data is perfect for:
- **Policy Analysis**: Which factors should countries focus on?
- **Trend Prediction**: How will happiness change?
- **Country Comparison**: Which countries are most similar?
- **Factor Impact**: What drives happiness most?

Start the setup and let's analyze the world's happiness! 🌍😊
