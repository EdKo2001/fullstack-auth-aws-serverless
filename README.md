# AuthFlow: Serverless Authentication Platform 🔐

[![AWS Serverless](https://img.shields.io/badge/AWS-Serverless-orange?logo=amazon-aws)](https://aws.amazon.com/serverless/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 🌟 Key Features

### 🔑 User Authentication

- JWT-based secure registration/login flow
- Session management with HTTP-only cookies
- Refresh token rotation mechanism

### 📸 Profile Management

- Image upload/preview with S3 direct uploads
- Real-time profile updates (DynamoDB streams)
- Responsive UI with Material-UI components

### ☁️ Cloud Infrastructure

- Auto-scaling serverless architecture
- CI/CD pipelines with CodePipeline/CodeBuild
- Infrastructure-as-Code (CloudFormation)
- Global CDN distribution via CloudFront

## 🛠 Tech Stack

**Frontend**  
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Material-UI | Component Library |
| Axios | HTTP Client |

**Backend**  
| AWS Service | Purpose |
|-------------|---------|
| Lambda | Business Logic |
| API Gateway | REST API Endpoints |
| DynamoDB | User Data Storage |
| S3 | Profile Image Storage |

**DevOps**  
| Tool | Purpose |
|------|---------|
| CloudFormation | Infrastructure Provisioning |
| CodePipeline | Deployment Automation |
| CloudFront | Content Delivery Network |
| CloudWatch | Monitoring & Logging |

## 🚀 Getting Started

### Prerequisites

- AWS Account with Admin permissions
- Node.js 18.x & npm 9+
- Git 2.40+

### Local Development Setup

bash

# Clone repository

git clone https://github.com/EdKo2001/fullstack-auth-aws-serverless
cd fullstack-auth-aws-serverless/client

# Install dependencies

npm ci # Clean install for consistent dependencies

# Update baseURL for API Gateway inside /src/utils/api.ts

# Start development server

npm run dev
Access the application at: http://localhost:3000

## 🔄 Deployment Pipeline Architecture

1. **Source Stage**

   - Monitors GitHub repo (main branch)
   - Triggers on code commits/PR merges

2. **Build Stage**

   - Frontend:
     - `npm run build`

3. **Deploy Stage**
   - CloudFormation stack updates
   - Automated CloudFront cache invalidation

## 🔒 Security Implementation

### Data Protection

- **At Rest**
  - AES-256 encryption (S3/DynamoDB)
  - KMS-managed encryption keys
- **In Transit**
  - TLS 1.2+ enforcement
  - HSTS headers for web assets

### Access Control

- IAM Least Privilege Roles
- API Gateway Resource Policies
- Cognito User Pool Integration
- JWT Signature Verification

### Credential Security

- bcrypt password hashing (cost factor 12)
- JWT expiration (1h access / 7d refresh tokens)
- Secrets Manager for sensitive configurations
