-- Happiness Data Analysis Schema
-- Adapted for World Happiness Report datasets (2015-2024)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create happiness_data table for storing all happiness report data
CREATE TABLE IF NOT EXISTS happiness_data (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    happiness_rank INTEGER,
    happiness_score DECIMAL(5,3),
    upper_whisker DECIMAL(5,3),
    lower_whisker DECIMAL(5,3),
    economy_gdp_per_capita DECIMAL(5,3),
    social_support DECIMAL(5,3),
    healthy_life_expectancy DECIMAL(5,3),
    freedom_to_make_life_choices DECIMAL(5,3),
    generosity DECIMAL(5,3),
    perceptions_of_corruption DECIMAL(5,3),
    standard_error DECIMAL(5,3),
    family DECIMAL(5,3),
    trust_government_corruption DECIMAL(5,3),
    dystopia_residual DECIMAL(5,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create happiness_clusters table for ML clustering results
CREATE TABLE IF NOT EXISTS happiness_clusters (
    id SERIAL PRIMARY KEY,
    cluster_id INTEGER NOT NULL,
    cluster_name VARCHAR(100) NOT NULL,
    cluster_description TEXT,
    centroid_data JSONB NOT NULL,
    countries JSONB NOT NULL,
    avg_happiness_score DECIMAL(5,3),
    size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create happiness_predictions table for ML predictions
CREATE TABLE IF NOT EXISTS happiness_predictions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    country_name VARCHAR(100),
    input_data JSONB NOT NULL,
    prediction_result JSONB NOT NULL,
    confidence DECIMAL(5,3),
    model_version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create happiness_analytics table for dashboard metrics
CREATE TABLE IF NOT EXISTS happiness_analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL NOT NULL,
    category VARCHAR(50),
    year INTEGER,
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create happiness_trends table for trend analysis
CREATE TABLE IF NOT EXISTS happiness_trends (
    id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    happiness_score DECIMAL(5,3),
    economy_score DECIMAL(5,3),
    social_support_score DECIMAL(5,3),
    health_score DECIMAL(5,3),
    freedom_score DECIMAL(5,3),
    generosity_score DECIMAL(5,3),
    corruption_score DECIMAL(5,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create happiness_correlations table for correlation analysis
CREATE TABLE IF NOT EXISTS happiness_correlations (
    id SERIAL PRIMARY KEY,
    factor1 VARCHAR(100) NOT NULL,
    factor2 VARCHAR(100) NOT NULL,
    correlation_coefficient DECIMAL(5,3) NOT NULL,
    p_value DECIMAL(10,6),
    significance_level VARCHAR(20),
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_happiness_data_year ON happiness_data(year);
CREATE INDEX IF NOT EXISTS idx_happiness_data_country ON happiness_data(country_name);
CREATE INDEX IF NOT EXISTS idx_happiness_data_region ON happiness_data(region);
CREATE INDEX IF NOT EXISTS idx_happiness_data_score ON happiness_data(happiness_score);
CREATE INDEX IF NOT EXISTS idx_happiness_data_rank ON happiness_data(happiness_rank);

CREATE INDEX IF NOT EXISTS idx_happiness_clusters_cluster_id ON happiness_clusters(cluster_id);
CREATE INDEX IF NOT EXISTS idx_happiness_clusters_name ON happiness_clusters(cluster_name);

CREATE INDEX IF NOT EXISTS idx_happiness_predictions_user_id ON happiness_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_happiness_predictions_country ON happiness_predictions(country_name);

CREATE INDEX IF NOT EXISTS idx_happiness_analytics_metric ON happiness_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_happiness_analytics_year ON happiness_analytics(year);
CREATE INDEX IF NOT EXISTS idx_happiness_analytics_region ON happiness_analytics(region);

CREATE INDEX IF NOT EXISTS idx_happiness_trends_country ON happiness_trends(country_name);
CREATE INDEX IF NOT EXISTS idx_happiness_trends_year ON happiness_trends(year);

CREATE INDEX IF NOT EXISTS idx_happiness_correlations_factors ON happiness_correlations(factor1, factor2);
CREATE INDEX IF NOT EXISTS idx_happiness_correlations_year ON happiness_correlations(year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_happiness_data_updated_at BEFORE UPDATE ON happiness_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_happiness_clusters_updated_at BEFORE UPDATE ON happiness_clusters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_happiness_analytics_updated_at BEFORE UPDATE ON happiness_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE happiness_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE happiness_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE happiness_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE happiness_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE happiness_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE happiness_correlations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Happiness data - readable by authenticated users
CREATE POLICY "Happiness data is viewable by authenticated users" ON happiness_data
    FOR SELECT USING (auth.role() = 'authenticated');

-- Happiness clusters - readable by authenticated users
CREATE POLICY "Happiness clusters are viewable by authenticated users" ON happiness_clusters
    FOR SELECT USING (auth.role() = 'authenticated');

-- Happiness predictions - users can only see their own predictions
CREATE POLICY "Users can view own happiness predictions" ON happiness_predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own happiness predictions" ON happiness_predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Happiness analytics - readable by authenticated users
CREATE POLICY "Happiness analytics are viewable by authenticated users" ON happiness_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Happiness trends - readable by authenticated users
CREATE POLICY "Happiness trends are viewable by authenticated users" ON happiness_trends
    FOR SELECT USING (auth.role() = 'authenticated');

-- Happiness correlations - readable by authenticated users
CREATE POLICY "Happiness correlations are viewable by authenticated users" ON happiness_correlations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
