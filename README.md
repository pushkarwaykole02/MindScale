# 🧠 Mind Scale - Mental Health Analysis Platform

A comprehensive full-stack web application for analyzing mental health patterns using the World Happiness Report dataset as a learning model. Mind Scale provides insights into mental well-being trends, regional comparisons, and personalized mental health predictions.

## 🚀 Features

- **📊 Mental Health Analytics Dashboard**: Multi-year mental well-being data analysis with dynamic charts
- **🌍 Global Mental Health Trends**: Line charts showing mental health score evolution over time
- **🗺️ Regional Mental Health Analysis**: Bar charts comparing average mental well-being across world regions
- **🍩 Mental Health Distribution**: Doughnut charts showing population distribution by mental health levels
- **🏆 Top Mental Health Countries**: Year-wise ranking of countries with best mental health indicators
- **🔍 Country-Specific Mental Health Insights**: Detailed analysis for individual countries
- **🎯 AI-Powered Mental Health Prediction**: Machine learning model for predicting mental health scores
- **🔐 User Authentication**: Secure authentication powered by Supabase
- **🌙 Responsive Design**: Modern UI with dark/light theme toggle
- **📱 Mobile-Friendly**: Optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Chart.js** for interactive data visualization
- **React Router** for navigation
- **Lucide React** for modern icons
- **Supabase Client** for authentication and data fetching

### Backend
- **Node.js** with Express.js
- **RESTful API** design
- **CORS** enabled for cross-origin requests
- **Rate limiting** for API protection
- **Helmet** for security headers

### Database & Authentication
- **Supabase** (PostgreSQL + built-in authentication)
- **Real-time subscriptions** support
- **Row-level security** for data protection

## 📁 Project Structure

```
DWM/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Charts/     # Chart components (Line, Bar, Doughnut)
│   │   │   ├── Forms/      # Form components (Login, Signup, Prediction)
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── Associations.jsx
│   │   ├── contexts/      # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── lib/          # Utility libraries
│   │   │   └── supabase.js
│   │   └── utils/        # Helper functions
│   │       └── helpers.js
│   ├── public/           # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   │   ├── happiness.js  # Mental health data endpoints
│   │   └── predictions.js # Mental health prediction endpoints
│   ├── server.js         # Main server file
│   └── package.json
├── data/                 # World Happiness Report CSV data (used as learning model)
│   ├── 2015.csv
│   ├── 2016.csv
│   ├── 2017.csv
│   ├── 2018.csv
│   ├── 2019.csv
│   ├── 2020.csv
│   ├── 2021.csv
│   ├── 2022.csv
│   ├── 2023.csv
│   ├── 2024.csv
│   └── README.md
├── database/             # Database schema
│   └── happiness_schema.sql
├── scripts/              # Database setup scripts
│   ├── import_happiness_data.js
│   └── setup_happiness_database.js
├── DATABASE_SETUP.md     # Database setup guide
├── DEPLOYMENT.md         # Deployment guide
├── HAPPINESS_ANALYSIS.md # Analysis documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DWM
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=5000
   NODE_ENV=development
   ```
   
   Create a `.env` file in the `client/` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   ```bash
   # Set up the mental health database schema
   node scripts/setup_happiness_database.js
   
   # Import the World Happiness data as learning model
   node scripts/import_happiness_data.js
   ```

5. **Start the development servers**
   ```bash
   # Start the backend server (from root directory)
   cd server
   npm start
   
   # Start the frontend server (in a new terminal)
   cd client
   npm run dev
   ```

   This will start:
   - Frontend server on `http://localhost:5173`
   - Backend server on `http://localhost:5000`

## 📊 API Endpoints

### Mental Health Data
- `GET /api/happiness/overview` - Get overall mental health statistics
- `GET /api/happiness/regions?year=YYYY` - Get regional mental health data
- `GET /api/happiness/cluster-distribution?year=YYYY` - Get mental health level distribution
- `GET /api/happiness/countries` - Get list of all countries
- `GET /api/happiness/country-trends?country=NAME` - Get country-specific mental health trends
- `GET /api/happiness/top-countries?year=YYYY` - Get top 10 countries with best mental health

### Mental Health Predictions
- `POST /api/predict` - Predict mental health score based on various factors
- `GET /api/predict/model-info` - Get prediction model information

### Health Check
- `GET /api/health` - Server health status

## 🎯 Key Features

### 1. Mental Health Analytics Dashboard
- **Global Overview**: Total countries analyzed, average mental health score, and year range
- **Mental Health Trends**: Line chart showing global mental well-being evolution (2015-2024)
- **Regional Mental Health Comparison**: Bar chart comparing average mental health across regions
- **Mental Health Distribution**: Doughnut chart showing population distribution by mental health levels
- **Country Filtering**: Dropdown to select and analyze specific countries' mental health
- **Year Filtering**: Dynamic year selection for all mental health charts

### 2. Landing Page
- **Top 10 Mental Health Countries**: Year-wise ranking of countries with best mental health indicators
- **Interactive Year Filter**: Dropdown to view mental health rankings for different years
- **Platform Overview**: Introduction to Mind Scale mental health analysis platform

### 3. User Dashboard
- **Personalized Mental Health Insights**: User-specific mental health predictions
- **Mental Health Prediction Form**: Input form for predicting mental health scores
- **Historical Analysis**: View past mental health predictions and trends

### 4. Mental Health Levels Classification
- **Excellent Mental Health**: Mental health score ≥ 7.0
- **Good Mental Health**: Mental health score 6.0 - 6.9
- **Moderate Mental Health**: Mental health score 5.0 - 5.9
- **Poor Mental Health**: Mental health score 4.0 - 4.9
- **Critical Mental Health**: Mental health score < 4.0

## 📈 Learning Model & Data Sources

Mind Scale uses the **World Happiness Report** dataset (2015-2024) as a comprehensive learning model for mental health analysis. The dataset includes:

- **Mental Health Indicators**: Overall life satisfaction and well-being scores
- **Economic Factors**: GDP per capita and economic stability
- **Social Support**: Social relationships and community support systems
- **Health Factors**: Healthy life expectancy and healthcare access
- **Personal Freedom**: Freedom to make life choices and personal autonomy
- **Generosity**: Community support and charitable behavior
- **Trust & Safety**: Perceptions of corruption and institutional trust
- **Regional Patterns**: Geographic mental health trends and variations

## 🧠 Mental Health Analysis Approach

### Data-Driven Insights
- **Correlation Analysis**: Understanding relationships between various factors and mental health
- **Trend Identification**: Spotting patterns in mental health evolution over time
- **Regional Comparisons**: Analyzing mental health disparities across different regions
- **Predictive Modeling**: Using historical data to predict future mental health trends

### Machine Learning Applications
- **Pattern Recognition**: Identifying common factors in high mental health countries
- **Risk Assessment**: Predicting mental health risks based on various indicators
- **Intervention Planning**: Suggesting areas for mental health improvement
- **Policy Recommendations**: Data-driven insights for mental health policy development

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with persistent storage
- **Interactive Charts**: Hover effects, tooltips, and smooth animations
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: User-friendly error messages and fallbacks
- **Form Validation**: Real-time input validation and feedback
- **Accessibility**: ARIA labels and keyboard navigation support
- **Mental Health Focused**: Calming color schemes and user-friendly interfaces

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `client/dist` folder
3. Set environment variables in your hosting platform

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with Node.js buildpack

### Database (Supabase)
1. Create a new Supabase project
2. Run the database setup scripts
3. Import the World Happiness data as learning model
4. Configure authentication policies

## 📊 Sample Data & Learning Model

The `data/` folder contains World Happiness Report CSV files (2015-2024) used as a learning model for mental health analysis:
- Country names and mental health indicators
- Regional mental health classifications
- Economic and social factors affecting mental health
- Health and freedom metrics
- Community support and trust indicators

## 🔧 Development Scripts

```bash
# Database setup
node scripts/setup_happiness_database.js

# Data import (World Happiness data as learning model)
node scripts/import_happiness_data.js

# Development
npm run dev          # Start both frontend and backend
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [documentation](DATABASE_SETUP.md)
- Review the API endpoints
- Contact the maintainers

## 🔮 Future Enhancements

- **Real-time Mental Health Monitoring**: Live mental health data streaming
- **Advanced Mental Health Visualizations**: 3D charts, heat maps, and geographic mental health visualizations
- **Export Functionality**: PDF/Excel mental health report generation
- **Comparative Mental Health Analysis**: Side-by-side country mental health comparisons
- **Mobile App**: React Native mobile application for mental health tracking
- **Advanced Filtering**: Multi-dimensional mental health data filtering
- **Machine Learning**: Real ML models for mental health prediction and intervention
- **Social Features**: User mental health insights sharing and community support
- **Mental Health Interventions**: AI-powered recommendations for mental health improvement
- **Integration with Health Apps**: Connect with wearable devices and health tracking apps

## 🙏 Acknowledgments

- **World Happiness Report** for providing the comprehensive dataset used as a learning model
- **Supabase** for the excellent backend-as-a-service platform
- **Chart.js** for the powerful charting library
- **React** and **Node.js** communities for the amazing ecosystem
- **Mental Health Research Community** for insights and validation

## ⚠️ Disclaimer

Mind Scale is designed for educational and research purposes. The mental health predictions and analysis are based on the World Happiness Report dataset and should not be considered as professional medical advice. Always consult with qualified mental health professionals for personal mental health concerns.

---

Built with ❤️ using React, Node.js, and Supabase for mental health analysis and awareness
