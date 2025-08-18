# 🚀 Social Catalyst - Development Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ 
- MongoDB 6+ (or Docker)
- Git

### 1. Clone & Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd social-catalyst

# Run the setup script
./setup.sh
```

### 2. Start Development
```bash
# Option 1: Manual start
cd server && npm run dev    # Backend on :5000
cd client && npm start      # Frontend on :3000

# Option 2: Docker (recommended)
docker-compose up -d
```

### 3. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🏗️ Project Structure

```
social-catalyst/
├── server/                 # Express Backend API
│   ├── models/            # MongoDB Schemas
│   ├── routes/            # API Endpoints
│   ├── middleware/        # Custom Middleware
│   └── index.js           # Server Entry Point
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI Components
│   │   ├── pages/         # Page Components
│   │   ├── contexts/      # React Contexts
│   │   └── App.js         # Main App Component
│   └── public/            # Static Assets
├── shared/                 # Shared Types & Utils
└── docs/                  # Documentation
```

## 🔧 Development Workflow

### Backend Development
```bash
cd server
npm run dev          # Start with nodemon
npm test            # Run tests
npm run lint        # Lint code
```

### Frontend Development
```bash
cd client
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
```

### Database
```bash
# MongoDB connection
mongodb://localhost:27017/social-catalyst

# Or use Docker
docker-compose up -d mongodb
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Employee registration
- `POST /api/auth/login` - Employee login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Content Management
- `GET /api/content` - Get approved content
- `POST /api/content` - Create content
- `GET /api/content/recommendations/:employeeId` - AI recommendations
- `GET /api/content/trending` - Trending content

### Employee Management
- `GET /api/employees` - Get all employees
- `GET /api/employees/leaderboard` - Gamification leaderboard
- `GET /api/employees/:id/stats` - Employee statistics

### Advocacy Tracking
- `POST /api/advocacy/share` - Record content sharing
- `GET /api/advocacy/employee/:employeeId` - Employee history
- `PUT /api/advocacy/:id/engagement` - Update metrics

### Analytics
- `GET /api/analytics/overview` - Platform overview
- `GET /api/analytics/employees` - Employee performance
- `GET /api/analytics/content` - Content performance
- `GET /api/analytics/business-impact` - Business ROI

## 🎮 Gamification System

### Point System
- **Content Sharing**: 10 points per share
- **Engagement**: 5 points per like/comment
- **Viral Content**: 50 bonus points (1000+ reach)
- **Successful Referrals**: 100 points per hire

### Achievement Badges
- 🏆 **Social Influencer**: 500+ engagements/month
- 🎯 **Talent Magnet**: Successful referral
- 🚀 **Viral Creator**: 1000+ reach content
- 📅 **Consistency Champion**: Weekly sharing streak

## 🤖 AI Features

### Content Personalization
- Role-based recommendations
- Expertise matching
- Network influence analysis
- Optimal timing suggestions

### Network Intelligence
- Employee influence scoring
- Content routing optimization
- Engagement pattern recognition
- Viral content prediction

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
```

### Frontend Tests
```bash
cd client
npm test                   # Run all tests
npm run test:coverage      # Coverage report
```

## 🚀 Deployment

### Development
```bash
npm run dev                # Concurrent dev servers
```

### Production
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

### Docker Production
```bash
# Build and run
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 📈 Performance Monitoring

### Backend Metrics
- API response times
- Database query performance
- Memory usage
- Error rates

### Frontend Metrics
- Page load times
- Component render performance
- Bundle size analysis
- User interaction tracking

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention

## 🌟 Key Features Built

### ✅ Completed (Week 1 MVP)
- [x] Project architecture & setup
- [x] Database models (Employee, Content, Advocacy)
- [x] Authentication system
- [x] Content management API
- [x] Employee management API
- [x] Advocacy tracking API
- [x] Analytics API
- [x] React frontend structure
- [x] Authentication context
- [x] Basic routing & layout
- [x] Docker setup
- [x] Development scripts

### 🚧 In Progress
- [ ] Frontend components (Navbar, Sidebar, Pages)
- [ ] Content recommendation engine
- [ ] Gamification dashboard
- [ ] Analytics visualization
- [ ] Social media integration

### 📋 Next Steps (Week 2)
- [ ] Complete frontend components
- [ ] Implement AI recommendations
- [ ] Add social media sharing
- [ ] Mobile responsiveness
- [ ] Performance optimization

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check MongoDB connection
mongo --eval "db.runCommand('ping')"

# Check environment variables
cat .env
```

**Frontend build fails**
```bash
# Clear node modules
rm -rf client/node_modules
cd client && npm install
```

**Docker issues**
```bash
# Reset containers
docker-compose down -v
docker-compose up -d
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [JWT.io](https://jwt.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Happy coding! 🪄**

*Transform your team into brand ambassador superstars!* 