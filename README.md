# 🚀 Social Catalyst - Employee-Powered Advocacy Engine

> **"From Silent Teams to Social Media Superstars"**

An AI-powered employee advocacy system that transforms your team into powerful brand amplification networks.

## 🎯 What is Social Catalyst?

Social Catalyst is an intelligent employee advocacy platform that:
- **Curates** pre-approved, shareable company content
- **Personalizes** content recommendations based on employee expertise
- **Gamifies** advocacy participation to drive consistent engagement
- **Analyzes** network influence for maximum impact
- **Measures** advocacy ROI through comprehensive analytics

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │   MongoDB       │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   AI Engine     │◄─────────────┘
                        │ (Recommendations│
                        │  & Analytics)   │
                        └─────────────────┘
```

## 🚀 Quick Start (1-Week MVP)

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd social-catalyst

# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-catalyst

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Social Media API Keys (for future integrations)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
TWITTER_API_KEY=your-twitter-api-key
```

## 📁 Project Structure

```
social-catalyst/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                 # Express backend API
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── shared/                 # Shared types and utilities
└── docs/                  # Documentation and API specs
```

## 🎮 Core Features

### 1. Smart Content Library
- Curated repository of pre-approved posts
- AI-powered content personalization
- One-click sharing to social platforms
- Real-time content suggestions

### 2. Advocacy Gamification
- Point-based reward system
- Leaderboards and achievements
- Team challenges and competitions
- Progress tracking and analytics

### 3. Network Intelligence
- Employee influence analysis
- Optimal content routing
- Timing recommendations
- Impact measurement

### 4. Analytics Dashboard
- Real-time advocacy metrics
- ROI measurement
- Performance insights
- Business outcome correlation

## 🗓️ Development Roadmap

### Week 1: MVP Foundation
- [x] Project setup and architecture
- [ ] Content management system
- [ ] Employee authentication
- [ ] Basic gamification
- [ ] Content recommendation engine
- [ ] Analytics dashboard
- [ ] Testing and deployment

### Week 2-3: Enhanced Features
- [ ] Advanced AI recommendations
- [ ] Social media integrations
- [ ] Mobile responsiveness
- [ ] Performance optimization

### Week 4+: Scale & Polish
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] API integrations
- [ ] Enterprise features

## 🧪 Testing

```bash
# Run backend tests
npm run test:server

# Run frontend tests
npm run test:client

# Run all tests
npm test
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker-compose up -d
```

## 📊 Success Metrics

- **Content Distribution**: 50+ curated content pieces
- **Employee Participation**: 70%+ opt-in rate
- **Reach Amplification**: 500%+ increase in organic reach
- **Engagement**: 5x increase in content sharing
- **Business Impact**: Measurable leads and referrals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions and support:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**Built with ❤️ by the Tekdi Team**

*Transform your team into brand ambassador superstars! 🪄* 