# Data Folder Structure

This folder contains datasets for the Customer Behavior Mining System. You can add your own datasets here for machine learning analysis.

## 📁 Folder Structure

```
data/
├── raw/                    # Raw datasets (original files)
├── processed/              # Processed datasets (cleaned and formatted)
├── models/                 # Trained model files
├── exports/                # Exported results and reports
└── templates/              # Data templates and schemas
```

## 📊 Supported Data Formats

- **CSV files** (.csv) - Comma-separated values
- **JSON files** (.json) - JavaScript Object Notation
- **Excel files** (.xlsx, .xls) - Microsoft Excel format
- **Parquet files** (.parquet) - Columnar storage format

## 🗂️ Dataset Categories

### 1. Customer Data
- **File naming**: `customers_YYYY.csv`
- **Required columns**:
  - `customer_id` (string) - Unique customer identifier
  - `age` (integer) - Customer age
  - `income` (decimal) - Annual income
  - `purchase_frequency` (decimal) - Purchases per month
  - `avg_order_value` (decimal) - Average order value
  - `total_spent` (decimal) - Total amount spent
  - `preferred_category` (string) - Favorite product category
  - `last_purchase_days` (integer) - Days since last purchase
  - `region` (string) - Geographic region

### 2. Transaction Data
- **File naming**: `transactions_YYYY.csv`
- **Required columns**:
  - `transaction_id` (string) - Unique transaction identifier
  - `customer_id` (string) - Customer identifier (foreign key)
  - `product_category` (string) - Product category
  - `product_name` (string) - Product name
  - `quantity` (integer) - Quantity purchased
  - `price` (decimal) - Unit price
  - `total_amount` (decimal) - Total transaction amount
  - `transaction_date` (date) - Date of transaction
  - `region` (string) - Geographic region

### 3. Product Data
- **File naming**: `products_YYYY.csv`
- **Required columns**:
  - `product_id` (string) - Unique product identifier
  - `product_name` (string) - Product name
  - `category` (string) - Product category
  - `subcategory` (string) - Product subcategory
  - `price` (decimal) - Product price
  - `description` (text) - Product description
  - `brand` (string) - Product brand

### 4. Marketing Data
- **File naming**: `marketing_YYYY.csv`
- **Required columns**:
  - `campaign_id` (string) - Campaign identifier
  - `customer_id` (string) - Customer identifier
  - `campaign_type` (string) - Type of campaign
  - `channel` (string) - Marketing channel
  - `response` (boolean) - Customer response
  - `campaign_date` (date) - Campaign date

## 🔧 Data Processing Guidelines

### 1. Data Quality
- Ensure all required columns are present
- Check for missing values and handle appropriately
- Validate data types and ranges
- Remove duplicates if necessary

### 2. Data Cleaning
- Standardize text fields (uppercase, trim spaces)
- Handle missing values (impute, remove, or flag)
- Remove outliers if they're data errors
- Normalize date formats

### 3. Data Validation
- Check referential integrity (customer_id exists in customer data)
- Validate numeric ranges (age > 0, income > 0)
- Ensure date consistency (transaction_date <= current_date)
- Verify category values match predefined lists

## 📈 Machine Learning Datasets

### 1. Customer Segmentation
- **Input features**: age, income, purchase_frequency, avg_order_value, preferred_category
- **Target**: cluster_id (0-4)
- **Algorithm**: K-Means Clustering

### 2. Purchase Prediction
- **Input features**: age, income, purchase_frequency, avg_order_value, preferred_category, last_purchase_days
- **Target**: purchase_probability (0-1)
- **Algorithm**: Naive Bayes

### 3. Association Rules
- **Input**: transaction data with product combinations
- **Output**: association rules with confidence, support, and lift
- **Algorithm**: Apriori

## 🚀 Data Import Process

### 1. Upload Data
```bash
# Place your CSV files in the appropriate folder
cp your_data.csv data/raw/
```

### 2. Process Data
```bash
# Run data processing script
npm run process-data
```

### 3. Import to Database
```bash
# Import processed data to Supabase
npm run import-data
```

## 📋 Data Templates

### Customer Data Template
```csv
customer_id,age,income,purchase_frequency,avg_order_value,total_spent,preferred_category,last_purchase_days,region
CUST_001,28,45000,2.1,89.50,1256.80,electronics,15,North
CUST_002,35,65000,1.8,125.30,892.40,clothing,8,South
```

### Transaction Data Template
```csv
transaction_id,customer_id,product_category,product_name,quantity,price,total_amount,transaction_date,region
TXN_001,CUST_001,electronics,Smartphone,1,899.99,899.99,2024-01-15,North
TXN_002,CUST_001,electronics,Phone Case,1,29.99,29.99,2024-01-15,North
```

## 🔒 Data Privacy & Security

- **PII Protection**: Remove or anonymize personally identifiable information
- **Data Encryption**: Encrypt sensitive data at rest and in transit
- **Access Control**: Implement proper access controls for data files
- **Audit Trail**: Maintain logs of data access and modifications

## 📊 Data Monitoring

### 1. Data Quality Metrics
- Completeness rate
- Accuracy rate
- Consistency score
- Timeliness measure

### 2. Data Volume Metrics
- Record count by dataset
- File size monitoring
- Growth rate tracking
- Storage utilization

## 🛠️ Tools & Scripts

### Data Processing Scripts
- `process_customer_data.py` - Process customer datasets
- `process_transaction_data.py` - Process transaction datasets
- `validate_data.py` - Validate data quality
- `import_to_database.py` - Import data to Supabase

### Data Analysis Scripts
- `explore_data.py` - Exploratory data analysis
- `generate_insights.py` - Generate business insights
- `create_visualizations.py` - Create data visualizations

## 📚 Additional Resources

- [Data Processing Best Practices](docs/data-processing.md)
- [Machine Learning Pipeline](docs/ml-pipeline.md)
- [Data Quality Guidelines](docs/data-quality.md)
- [Privacy & Compliance](docs/privacy-compliance.md)

## 🤝 Contributing

When adding new datasets:

1. Follow the naming conventions
2. Include data documentation
3. Validate data quality
4. Update this README if needed
5. Test data import process

---

For questions or support, please refer to the main project documentation or create an issue in the repository.
