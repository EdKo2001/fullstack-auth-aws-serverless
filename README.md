# AuthFlow: Serverless Authentication Platform

## 🚀 Key Features

- User Authentication
  - Secure JWT-based registration/login
  - Session management with localStorage
- Profile Management
  - Image upload/preview (S3 integration)
  - Profile data updates (DynamoDB)
- Cloud Infrastructure
  - Auto-scaling serverless backend
  - CI/CD pipelines (CodePipeline/CodeBuild)
  - Infrastructure-as-Code (CloudFormation)

## 🛠 Tech Stack

**Frontend**  
React 19 TypeScript Material-UI

**Backend**  
Node.js 18 AWS Lambda API Gateway DynamoDB S3

**DevOps**  
AWS CloudFormation CodePipeline CodeBuild CloudFront

## ⚙️ Setup Guide

### 1. Prerequisites

- AWS Account
- Node.js 18.x & npm
- Git

### 2. Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm start
```

Access: http://localhost:3000

# Clone repository

git clone https://github.com/yourrepo/authflow.git
cd authflow

# Install dependencies

npm install

# Start dev server

npm start

Access: http://localhost:3000

### 3. Configuration

Set environment variables:

env

# Frontend .env

REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.region.amazonaws.com/prod
REACT_APP_S3_BUCKET=authflow-profile-images

## 🔄 Deployment Pipeline

1. **Source Stage**: GitHub repo monitoring
2. **Build Stage**:
   - Frontend: npm run build + S3 upload
   - Backend: Lambda function packaging
3. **Deploy Stage**:
   - CloudFormation stack updates
   - Lambda function deployments

## 🔒 Security Features

- **Data Protection**
  - AES-256 encryption (S3/DynamoDB)
  - SSL/TLS everywhere
- **Access Control**
  - IAM least-privilege roles
  - Cognito Identity Pools (optional)
- **Credentials**
  - bcrypt password hashing
  - JWT expiration (1h access tokens)

---

**Note**: Before production deployment:

1. Enable CloudFront distribution for frontend
2. Configure WAF for API Gateway
3. Set up CloudWatch monitoring alarms
