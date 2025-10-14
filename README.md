# Customer Behavior Mining System (CBMS)

A comprehensive full-stack web application for analyzing customer behavior data using advanced analytics, machine learning algorithms, and predictive modeling.

## 🚀 Features

- **Advanced Analytics Dashboard**: Multi-year customer data analysis with interactive charts
- **Customer Segmentation**: AI-powered clustering using simulated K-Means algorithm
- **Predictive Modeling**: Purchase intent prediction using simulated Naive Bayes classifier
- **Association Rules**: Product relationship discovery using simulated Apriori algorithm
- **User Authentication**: Secure authentication powered by Supabase
- **Responsive Design**: Modern UI with dark/light theme toggle
- **Real-time Insights**: Interactive dashboards with Chart.js visualizations

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Chart.js** for data visualization
- **React Router** for navigation
- **Lucide React** for icons

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
customer-behavior-mining-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── lib/          # Utility libraries
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── package.json
│   └── server.js
├── data/                 # Sample CSV datasets
│   ├── customers_2015.csv
│   ├── customers_2020.csv
│   ├── customers_2024.csv
│   └── transactions_2024.csv
├── env.example          # Environment variables template
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
   cd customer-behavior-mining-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend server on `http://localhost:3000`
   - Backend server on `http://localhost:5000`

## 📊 API Endpoints

### Analytics
- `GET /api/analytics` - Get overall analytics data
- `GET /api/analytics/trends` - Get trend data (yearly/monthly)
- `GET /api/analytics/categories` - Get category breakdown

### Predictions
- `POST /api/predict` - Predict customer behavior
- `GET /api/predict/model-info` - Get model information
- `POST /api/predict/batch` - Batch predictions

### Clusters
- `GET /api/clusters` - Get customer clusters
- `POST /api/clusters/analyze` - Analyze customer data
- `GET /api/clusters/:id` - Get specific cluster details
- `GET /api/clusters/stats` - Get cluster statistics

### Association Rules
- `GET /api/association-rules` - Get association rules
- `POST /api/association-rules/analyze` - Analyze transaction data
- `GET /api/association-rules/stats` - Get rule statistics

## 🎯 Key Features

### 1. Analytics Dashboard
- Year-over-year trend analysis
- Category performance metrics
- Customer segment distribution
- Real-time activity feed

### 2. User Dashboard
- Personalized customer insights
- Behavior prediction form
- Similar customer analysis
- Personalized recommendations

### 3. Association Rules
- Product relationship discovery
- Cross-selling opportunities
- Confidence and lift metrics
- Category-based filtering

### 4. Customer Segmentation
- K-Means clustering simulation
- Segment characteristics
- Revenue distribution
- Growth opportunities

## 🔧 Machine Learning Algorithms

### Simulated K-Means Clustering
- Customer segmentation based on behavior patterns
- 5 default clusters: High Value, Frequent Buyers, Occasional, New, At-Risk
- Silhouette score and performance metrics

### Simulated Naive Bayes
- Purchase probability prediction
- Customer segment classification
- Feature importance analysis
- Confidence scoring

### Simulated Apriori Algorithm
- Market basket analysis
- Association rule mining
- Support, confidence, and lift metrics
- Category-specific insights

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with persistent storage
- **Interactive Charts**: Hover effects, tooltips, and animations
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time input validation

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
2. Set up authentication policies
3. Configure CORS settings

## 📈 Sample Data

The `data/` folder contains sample CSV files with:
- Customer demographics and behavior data (2015-2024)
- Transaction history
- Product categories and associations
- Regional distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Real machine learning model integration
- Advanced visualization options
- Export functionality for reports
- Real-time data streaming
- Mobile app development
- Advanced user permissions
- API rate limiting improvements
- Caching layer implementation

---

Built with ❤️ using React, Node.js, and Supabase
