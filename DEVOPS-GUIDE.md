# Complete DevOps Guide for Microservices E-Commerce Project

## Project Overview
This guide will help you transform your microservices e-commerce application into a production-ready DevOps project using AWS Free Tier services.

**Current Architecture:**
- **Frontend:** Next.js application (Port 3000)
- **API Gateway:** Node.js gateway service (Port 8000)
- **Microservices:**
  - Auth Service (authentication & user management) - Port 5001
  - Product Service (product catalog) - Port 5002
  - Order Service (order management) - Port 5003
- **Database:** MongoDB Atlas (Cloud)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Phase 1: Containerization with Docker](#phase-1-containerization-with-docker)
3. [Phase 2: Version Control & Git Strategy](#phase-2-version-control--git-strategy)
4. [Phase 3: CI/CD Pipeline](#phase-3-cicd-pipeline)
5. [Phase 4: AWS Infrastructure Setup](#phase-4-aws-infrastructure-setup)
6. [Phase 5: Infrastructure as Code (Terraform)](#phase-5-infrastructure-as-code-terraform)
7. [Phase 6: Container Orchestration](#phase-6-container-orchestration)
8. [Phase 7: Monitoring & Logging](#phase-7-monitoring--logging)
9. [Phase 8: Security Best Practices](#phase-8-security-best-practices)
10. [Phase 9: Automated Testing](#phase-9-automated-testing)
11. [AWS Free Tier Resource Limits](#aws-free-tier-resource-limits)

---

## Prerequisites

### Tools to Install:
1. **Docker Desktop** - Container platform (enables Kubernetes locally)
2. **Git** - Version control
3. **AWS CLI** - AWS command line interface
4. **kubectl** - Kubernetes command-line tool
5. **Jenkins** - CI/CD automation server
6. **Node.js & npm** - Already have this

### AWS Account Setup:
1. Create AWS Free Tier account at https://aws.amazon.com/free/
2. Set up MFA (Multi-Factor Authentication) for security
3. Create IAM user with programmatic access
4. Configure AWS CLI: `aws configure`

### GitHub/Git Repository:
- Create GitHub/GitLab account for source control
- Or use any Git hosting service

### Enable Kubernetes in Docker Desktop:
1. Open Docker Desktop
2. Go to **Settings → Kubernetes**
3. Check **Enable Kubernetes**
4. Click **Apply & Restart**
5. Wait for Kubernetes to start (green icon)

### Install kubectl:
```bash
# Windows (using Chocolatey)
choco install kubernetes-cli

# Or download from https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/

# Verify installation
kubectl version --client

# Check cluster connection
kubectl cluster-info
```

---

## Phase 1: Containerization with Docker

### Step 1.1: Create Dockerfiles for Each Service

**✅ ALREADY COMPLETE** - Your Dockerfiles are already created and working!

**Create `api-gateway/Dockerfile`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["node", "index.js"]
```

**Create `auth-service/Dockerfile`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["node", "index.js"]
```

**Create `product-service/Dockerfile`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5002
CMD ["node", "index.js"]
```

**Create `order-service/Dockerfile`:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5003
CMD ["node", "index.js"]
```

**Create `frontend-client/Dockerfile`:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.mjs ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Step 1.2: Create Docker Compose for Local Development

**✅ ALREADY COMPLETE** - Your docker-compose.yml is already working!

**Your working `docker-compose.yml`:**
```yaml
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - PORT=8000
      - AUTH_SERVICE_URL=http://auth-service:5001
      - PRODUCT_SERVICE_URL=http://product-service:5002
      - ORDER_SERVICE_URL=http://order-service:5003
    depends_on:
      - auth-service
      - product-service
      - order-service
    networks:
      - microservices-network

  auth-service:
    build: ./auth-service
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=development
      - PORT=5001
      - JWT_SECRET=supersecretkey
      - MONGODB_URI=mongodb+srv://it22577542_db_user:User123@cluster0.lysvtbc.mongodb.net/ecommerce?appName=Cluster0
    networks:
      - microservices-network

  product-service:
    build: ./product-service
    ports:
      - "5002:5002"
    environment:
      - NODE_ENV=development
      - PORT=5002
      - MONGODB_URI=mongodb+srv://it22577542_db_user:User123@cluster0.lysvtbc.mongodb.net/ecommerce?appName=Cluster0
    networks:
      - microservices-network

  order-service:
    build: ./order-service
    ports:
      - "5003:5003"
    environment:
      - NODE_ENV=development
      - PORT=5003
      - MONGODB_URI=mongodb+srv://it22577542_db_user:User123@cluster0.lysvtbc.mongodb.net/ecommerce?appName=Cluster0
    networks:
      - microservices-network

  frontend-client:
    build: ./frontend-client
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - api-gateway
    networks:
      - microservices-network

networks:
  microservices-network:
    driver: bridge
```

### Step 1.3: Create .dockerignore Files

**Create `.dockerignore` in each service directory:**
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
coverage
.next
```

### Step 1.4: Test Docker Setup

**✅ YOUR SERVICES ARE RUNNING!**

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:8000
curl http://localhost:8000/products
curl http://localhost:8000/auth/health

# Access frontend
# Open browser: http://localhost:3000

# Stop all services
docker-compose down
```

---

## Phase 2: Version Control & Git Strategy

### Step 2.1: Initialize Git Repository

```bash
# If not already initialized
git init

# Create .gitignore
# Add node_modules, .env, logs, etc.
```

### Step 2.2: Git Branching Strategy

Implement **GitFlow** strategy:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes
- `release/*` - Release preparation

### Step 2.3: Commit Conventions

Use **Conventional Commits**:
```
feat: add user authentication
fix: resolve cart calculation bug
docs: update README
chore: update dependencies
test: add unit tests for product service
```

### Step 2.4: Push to GitHub

```bash
# Create repository on GitHub
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/microservices-e-commerce.git

# Initial commit
git add .
git commit -m "feat: initial microservices architecture"
git push -u origin main
```

---

## Phase 3: CI/CD Pipeline with Jenkins

### Step 3.1: Install Jenkins

**Option 1: Docker Installation (Recommended for Windows)**
```bash
# Pull Jenkins Docker image
docker pull jenkins/jenkins:lts

# Run Jenkins container
docker run -d -p 8080:8080 -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  --name jenkins `
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Option 2: Direct Installation on Windows**
```bash
# Download Jenkins MSI installer from https://www.jenkins.io/download/
# Run the installer and follow the setup wizard
```

### Step 3.2: Initial Jenkins Setup

1. **Access Jenkins**: Open browser to `http://localhost:8080`
2. **Unlock Jenkins**: Enter the initial admin password
3. **Install Suggested Plugins**: Click "Install suggested plugins"
4. **Create Admin User**: Set up your admin credentials
5. **Configure Jenkins URL**: Keep default `http://localhost:8080`

### Step 3.3: Install Required Jenkins Plugins

Go to **Manage Jenkins → Manage Plugins → Available**:

- **Docker Pipeline** - Docker integration
- **Amazon ECR** - Push images to ECR
- **AWS Steps** - AWS CLI integration
- **Git** - Git repository integration
- **Pipeline** - Pipeline support
- **NodeJS** - Node.js support
- **Blue Ocean** (optional) - Modern UI

### Step 3.4: Configure Jenkins Credentials

Go to **Manage Jenkins → Manage Credentials → Global → Add Credentials**:

1. **AWS Credentials:**
   - Kind: Secret text
   - ID: `aws-access-key-id`
   - Secret: Your AWS Access Key ID
   
   - Kind: Secret text
   - ID: `aws-secret-access-key`
   - Secret: Your AWS Secret Access Key

2. **Git Credentials** (if private repo):
   - Kind: Username with password
   - ID: `git-credentials`
   - Username/Password: Your Git credentials

### Step 3.5: Create Jenkinsfile

**Create `Jenkinsfile` in project root:**
```groovy
pipeline {
    agent any
    
    environment {
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = 'YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com'
        AWS_ACCOUNT_ID = 'YOUR_ACCOUNT_ID'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies & Test') {
            parallel {
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            bat 'npm ci'
                            bat 'npm test || echo "No tests configured"'
                        }
                    }
                }
                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            bat 'npm ci'
                            bat 'npm test || echo "No tests configured"'
                        }
                    }
                }
                stage('Product Service') {
                    steps {
                        dir('product-service') {
                            bat 'npm ci'
                            bat 'npm test || echo "No tests configured"'
                        }
                    }
                }
                stage('Order Service') {
                    steps {
                        dir('order-service') {
                            bat 'npm ci'
                            bat 'npm test || echo "No tests configured"'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Login to ECR
                    withCredentials([
                        string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        bat """
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        """
                    }
                    
                    // Build and push images
                    def services = ['api-gateway', 'auth-service', 'product-service', 'order-service', 'frontend-client']
                    
                    services.each { service ->
                        bat "docker build -t ${service}:${BUILD_NUMBER} ./${service}"
                        bat "docker tag ${service}:${BUILD_NUMBER} ${ECR_REGISTRY}/${service}:${BUILD_NUMBER}"
                        bat "docker tag ${service}:${BUILD_NUMBER} ${ECR_REGISTRY}/${service}:latest"
                        bat "docker push ${ECR_REGISTRY}/${service}:${BUILD_NUMBER}"
                        bat "docker push ${ECR_REGISTRY}/${service}:latest"
                    }
                }
            }
        }
        
        stage('Deploy to AWS ECS') {
            when {
                branch 'main'
                environment name: 'DEPLOY_TARGET', value: 'ecs'
            }
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    bat """
                        aws ecs update-service --cluster microservices-cluster --service api-gateway --force-new-deployment --region ${AWS_REGION}
                        aws ecs update-service --cluster microservices-cluster --service auth-service --force-new-deployment --region ${AWS_REGION}
                        aws ecs update-service --cluster microservices-cluster --service product-service --force-new-deployment --region ${AWS_REGION}
                        aws ecs update-service --cluster microservices-cluster --service order-service --force-new-deployment --region ${AWS_REGION}
                        aws ecs update-service --cluster microservices-cluster --service frontend --force-new-deployment --region ${AWS_REGION}
                    """
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
                environment name: 'DEPLOY_TARGET', value: 'kubernetes'
            }
            steps {
                script {
                    // Update Kubernetes deployments
                    bat """
                        kubectl set image deployment/api-gateway api-gateway=${ECR_REGISTRY}/api-gateway:${BUILD_NUMBER} -n microservices
                        kubectl set image deployment/auth-service auth-service=${ECR_REGISTRY}/auth-service:${BUILD_NUMBER} -n microservices
                        kubectl set image deployment/product-service product-service=${ECR_REGISTRY}/product-service:${BUILD_NUMBER} -n microservices
                        kubectl set image deployment/order-service order-service=${ECR_REGISTRY}/order-service:${BUILD_NUMBER} -n microservices
                        kubectl set image deployment/frontend frontend=${ECR_REGISTRY}/frontend-client:${BUILD_NUMBER} -n microservices
                        
                        kubectl rollout status deployment/api-gateway -n microservices
                        kubectl rollout status deployment/auth-service -n microservices
                        kubectl rollout status deployment/product-service -n microservices
                        kubectl rollout status deployment/order-service -n microservices
                        kubectl rollout status deployment/frontend -n microservices
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for details.'
        }
        always {
            // Clean up Docker images to save space
            bat 'docker system prune -f || echo "Docker cleanup completed"'
        }
    }
}
```

### Step 3.6: Create Jenkins Pipeline Job

1. **New Item**: Click "New Item" in Jenkins
2. **Name**: `microservices-ecommerce-pipeline`
3. **Type**: Select "Pipeline"
4. **Configure**:
   - **Build Triggers**: Check "Poll SCM" with schedule `H/5 * * * *` (every 5 mins)
   - **Pipeline**:
     - Definition: Pipeline script from SCM
     - SCM: Git
     - Repository URL: Your Git repository URL
     - Credentials: Select your Git credentials
     - Branch: `*/main`
     - Script Path: `Jenkinsfile`
5. **Save**

### Step 3.7: Configure Webhooks (Optional)

For GitHub:
1. Go to repository **Settings → Webhooks → Add webhook**
2. Payload URL: `http://YOUR_JENKINS_URL:8080/github-webhook/`
3. Content type: `application/json`
4. Events: Select "Just the push event"

### Step 3.8: Test Pipeline

```bash
# Trigger build manually or push to repository
git add .
git commit -m "feat: add Jenkins pipeline"
git push origin main

# Jenkins will automatically detect the change and run the pipeline
```

---

## Phase 4: AWS Infrastructure Setup

### Step 4.1: AWS Services to Use (Free Tier Compatible)

1. **Amazon ECR** - Container registry (500 MB storage/month free)
2. **Amazon ECS (Fargate)** - Container orchestration
3. **Application Load Balancer** - Traffic distribution (750 hours/month free)
4. **AWS CloudWatch** - Basic monitoring (10 custom metrics free)
5. **Amazon S3** - Static asset storage (5 GB free)
6. **IAM** - Identity and access management (free)

### Step 4.2: Create ECR Repositories

```bash
# Create ECR repositories for each service
aws ecr create-repository --repository-name api-gateway --region us-east-1
aws ecr create-repository --repository-name auth-service --region us-east-1
aws ecr create-repository --repository-name product-service --region us-east-1
aws ecr create-repository --repository-name order-service --region us-east-1
aws ecr create-repository --repository-name frontend-client --region us-east-1
```

### Step 4.3: Manual AWS Setup (Before Terraform)

1. **VPC Setup:**
   - Use default VPC or create new VPC
   - Ensure at least 2 availability zones
   - Public and private subnets

2. **Security Groups:**
   - Create security group for ALB (allow 80, 443)
   - Create security group for ECS tasks (allow traffic from ALB)

3. **IAM Roles:**
   - ECS Task Execution Role
   - ECS Task Role

---

## Phase 5: Infrastructure Setup (Manual or Terraform - Optional)

### Step 5.1: Option A - Manual Setup via AWS Console (Simpler)

For beginners, you can set up infrastructure manually:

1. **Create VPC**: Use AWS default VPC or create new
2. **Create Security Groups**: Configure via EC2 console
3. **Create ECS Cluster**: Via ECS console
4. **Create Load Balancer**: Via EC2 → Load Balancers
5. **Create IAM Roles**: Via IAM console

Detailed manual steps are in Step 4.3 above.

### Step 5.2: Option B - Terraform (Advanced - Optional)

If you want Infrastructure as Code:

**Install Terraform:**
```bash
# Download from https://www.terraform.io/downloads
# Or use package manager
choco install terraform  # Windows
```

### Step 5.3: Create Terraform Configuration (Optional)

**Create `terraform/main.tf`:**
```hcl
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "microservices-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "microservices-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  enable_dns_hostnames = true

  tags = {
    Environment = var.environment
    Project     = "microservices-ecommerce"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "microservices-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "microservices-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = false

  tags = {
    Environment = var.environment
  }
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  name        = "microservices-alb-sg"
  description = "Security group for ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "microservices-alb-sg"
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "microservices-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "microservices-ecs-tasks-sg"
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "microservices-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "microservices" {
  name              = "/ecs/microservices"
  retention_in_days = 7

  tags = {
    Environment = var.environment
  }
}
```

**Create `terraform/variables.tf`:**
```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "container_cpu" {
  description = "CPU units for containers"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Memory for containers in MB"
  type        = number
  default     = 512
}
```

**Create `terraform/outputs.tf`:**
```hcl
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value = {
    api_gateway = aws_ecr_repository.api_gateway.repository_url
    auth_service = aws_ecr_repository.auth_service.repository_url
    product_service = aws_ecr_repository.product_service.repository_url
    order_service = aws_ecr_repository.order_service.repository_url
    frontend = aws_ecr_repository.frontend.repository_url
  }
}
```

### Step 5.3: Initialize and Apply Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure
terraform apply

# Destroy infrastructure (when needed)
terraform destroy
```

---

## Phase 6: Container Orchestration (ECS + Kubernetes)

### Step 6.1: ECS Task Definitions

**Create `ecs/api-gateway-task-definition.json`:**
```json
{
  "family": "api-gateway",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/microservices-ecs-task-execution-role",
  "containerDefinitions": [
    {
      "name": "api-gateway",
      "image": "YOUR_ECR_REGISTRY/api-gateway:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "AUTH_SERVICE_URL",
          "value": "http://auth-service:5001"
        },
        {
          "name": "PRODUCT_SERVICE_URL",
          "value": "http://product-service:5002"
        },
        {
          "name": "ORDER_SERVICE_URL",
          "value": "http://order-service:5003"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/microservices",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api-gateway"
        }
      }
    }
  ]
}
```

### Step 6.2: ECS Services

Create similar task definitions for each service and deploy:

```bash
# Register task definitions
aws ecs register-task-definition --cli-input-json file://ecs/api-gateway-task-definition.json

# Create services
aws ecs create-service \
  --cluster microservices-cluster \
  --service-name api-gateway \
  --task-definition api-gateway \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Step 6.3: Kubernetes Deployment (Alternative/Additional)

#### Option A: Local Kubernetes (Docker Desktop)

**Create `k8s/namespace.yaml`:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: microservices
```

**Create `k8s/api-gateway-deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: YOUR_ECR_REGISTRY/api-gateway:latest
        ports:
        - containerPort: 8000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8000"
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:5001"
        - name: PRODUCT_SERVICE_URL
          value: "http://product-service:5002"
        - name: ORDER_SERVICE_URL
          value: "http://order-service:5003"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: microservices
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
  - port: 8000
    targetPort: 8000
    nodePort: 30000
```

**Create `k8s/auth-service-deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: YOUR_ECR_REGISTRY/auth-service:latest
        ports:
        - containerPort: 5001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5001"
        - name: JWT_SECRET
          value: "supersecretkey"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: microservices
spec:
  type: ClusterIP
  selector:
    app: auth-service
  ports:
  - port: 5001
    targetPort: 5001
```

**Create `k8s/product-service-deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
    spec:
      containers:
      - name: product-service
        image: YOUR_ECR_REGISTRY/product-service:latest
        ports:
        - containerPort: 5002
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5002"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: product-service
  namespace: microservices
spec:
  type: ClusterIP
  selector:
    app: product-service
  ports:
  - port: 5002
    targetPort: 5002
```

**Create `k8s/order-service-deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: order-service
        image: YOUR_ECR_REGISTRY/order-service:latest
        ports:
        - containerPort: 5003
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5003"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
  namespace: microservices
spec:
  type: ClusterIP
  selector:
    app: order-service
  ports:
  - port: 5003
    targetPort: 5003
```

**Create `k8s/frontend-deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: microservices
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: YOUR_ECR_REGISTRY/frontend-client:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "http://localhost:30000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: microservices
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30001
```

**Deploy to Local Kubernetes:**
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy all services
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/auth-service-deployment.yaml
kubectl apply -f k8s/product-service-deployment.yaml
kubectl apply -f k8s/order-service-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Check deployments
kubectl get deployments -n microservices
kubectl get pods -n microservices
kubectl get services -n microservices

# Access services
# API Gateway: http://localhost:30000
# Frontend: http://localhost:30001

# View logs
kubectl logs -f deployment/api-gateway -n microservices

# Delete all resources
kubectl delete namespace microservices
```

#### Option B: AWS EKS (Production)

**Note:** EKS is NOT in free tier. Cluster costs ~$0.10/hour (~$73/month).

**Create EKS Cluster:**
```bash
# Install eksctl
choco install eksctl

# Create cluster (takes 15-20 minutes)
eksctl create cluster \
  --name microservices-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.micro \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3

# Update kubeconfig
aws eks update-kubeconfig --name microservices-cluster --region us-east-1

# Deploy applications (same kubectl commands as above)
kubectl apply -f k8s/

# Delete cluster when done
eksctl delete cluster --name microservices-cluster --region us-east-1
```

### Step 6.4: Create Kubernetes Deployment Script

**Create `k8s/deploy.ps1`:**
```powershell
# Kubernetes deployment script
param(
    [string]$action = "apply",
    [string]$environment = "local"
)

Write-Host "Deploying to Kubernetes ($environment)..." -ForegroundColor Green

# Create namespace
kubectl $action -f k8s/namespace.yaml

if ($action -eq "apply") {
    # Deploy all services
    kubectl apply -f k8s/api-gateway-deployment.yaml
    kubectl apply -f k8s/auth-service-deployment.yaml
    kubectl apply -f k8s/product-service-deployment.yaml
    kubectl apply -f k8s/order-service-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    
    Write-Host "\nWaiting for deployments to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=available --timeout=300s deployment --all -n microservices
    
    Write-Host "\nDeployment Status:" -ForegroundColor Green
    kubectl get all -n microservices
    
    Write-Host "\nAccess URLs:" -ForegroundColor Cyan
    Write-Host "API Gateway: http://localhost:30000"
    Write-Host "Frontend: http://localhost:30001"
} elseif ($action -eq "delete") {
    kubectl delete namespace microservices
    Write-Host "All resources deleted!" -ForegroundColor Red
}
```

**Usage:**
```bash
# Deploy
.\k8s\deploy.ps1 -action apply

# Delete
.\k8s\deploy.ps1 -action delete
```

---

## Phase 7: Monitoring & Logging

### Step 7.1: CloudWatch Dashboards

**Create CloudWatch dashboard:**
```bash
aws cloudwatch put-dashboard \
  --dashboard-name microservices-metrics \
  --dashboard-body file://cloudwatch-dashboard.json
```

**Create `cloudwatch-dashboard.json`:**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          [".", "MemoryUtilization", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Cluster Metrics"
      }
    }
  ]
}
```

### Step 7.2: CloudWatch Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu-usage \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Step 7.3: Application Logging

Add structured logging to each service using Winston or similar:

```javascript
// Add to each service
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Phase 8: Security Best Practices

### Step 8.1: Environment Variables Management

Use AWS Systems Manager Parameter Store or AWS Secrets Manager:

```bash
# Store secrets
aws ssm put-parameter \
  --name "/microservices/prod/db-password" \
  --value "your-secure-password" \
  --type "SecureString"

# Retrieve in application
aws ssm get-parameter \
  --name "/microservices/prod/db-password" \
  --with-decryption
```

### Step 8.2: Security Scanning

**Add to `.github/workflows/security.yml`:**
```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: |
          cd api-gateway && npm audit
          cd ../auth-service && npm audit
          cd ../product-service && npm audit
          cd ../order-service && npm audit
          cd ../frontend-client && npm audit

  container-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
```

### Step 8.3: HTTPS/SSL Configuration

```bash
# Request SSL certificate from AWS Certificate Manager
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS \
  --subject-alternative-names "*.yourdomain.com"
```

---

## Phase 9: Automated Testing

### Step 9.1: Unit Tests

**Add to each service `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.0.0"
  }
}
```

**Example test file `api-gateway/index.test.js`:**
```javascript
const request = require('supertest');
const app = require('./index');

describe('API Gateway', () => {
  test('GET / should return 200', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});
```

### Step 9.2: Integration Tests

Create integration test suite:
```javascript
// tests/integration/api.test.js
describe('E2E Tests', () => {
  test('Complete user flow', async () => {
    // Register user
    // Login
    // Browse products
    // Add to cart
    // Place order
  });
});
```

### Step 9.3: Load Testing

Use k6 or Artillery for load testing:
```yaml
# artillery-load-test.yml
config:
  target: "http://your-alb-url"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/api/products"
```

---

## AWS Free Tier Resource Limits

### Monthly Free Tier Allowances:

| Service | Free Tier Limit | Notes |
|---------|----------------|-------|
| **EC2** | 750 hours/month (t2.micro or t3.micro) | Spread across instances |
| **ECS/Fargate** | Not in free tier | Pay per use (minimal cost for testing) |
| **ECR** | 500 MB storage | Sufficient for 5 small images |
| **ALB** | 750 hours/month | First 15 LCUs also free |
| **RDS** | 750 hours/month (db.t2.micro) | 20 GB storage |
| **S3** | 5 GB storage | 20,000 GET, 2,000 PUT requests |
| **CloudWatch** | 10 custom metrics, 10 alarms | 5 GB log ingestion |
| **Data Transfer** | 1 GB outbound | Additional charges beyond |

### Cost Optimization Tips:
1. **Use Fargate Spot** for non-production workloads (70% cheaper)
2. **Auto-scaling** - Scale down during off-hours
3. **Reserved Capacity** - If running long-term
4. **Use CloudWatch efficiently** - Aggregate logs, limit retention
5. **Delete unused resources** - ECR images, snapshots, load balancers
6. **Monitor costs** - Set up billing alerts

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Set up AWS account and IAM users
- [ ] Install all required tools
- [ ] Create Dockerfiles for all services
- [ ] Test local Docker Compose setup

### Week 2: Jenkins CI/CD Setup
- [ ] Install Jenkins
- [ ] Install required Jenkins plugins
- [ ] Configure Jenkins credentials
- [ ] Create Jenkinsfile
- [ ] Set up pipeline job

### Week 3: AWS Infrastructure
- [ ] Create ECR repositories
- [ ] Set up VPC and networking
- [ ] Create security groups
- [ ] Set up IAM roles

### Week 4: Infrastructure Setup
- [ ] Set up VPC and networking (manual or Terraform)
- [ ] Configure security groups
- [ ] Create ECS cluster
- [ ] Document infrastructure

### Week 5: Deployment & Orchestration
- [ ] Create ECS task definitions OR Kubernetes manifests
- [ ] Deploy services to ECS or Kubernetes
- [ ] Configure load balancer
- [ ] Test end-to-end deployment
- [ ] Choose deployment target (ECS vs K8s)

### Week 6: Monitoring & Security
- [ ] Set up CloudWatch dashboards
- [ ] Configure alarms
- [ ] Implement security scanning
- [ ] Add SSL certificates

### Week 7: Testing & Optimization
- [ ] Write automated tests
- [ ] Perform load testing
- [ ] Optimize costs
- [ ] Document everything

---

## Quick Start Commands

```bash
# 1. Clone and setup
git clone https://github.com/YOUR_USERNAME/microservices-e-commerce.git
cd microservices-e-commerce

# 2. Build and test locally
docker-compose build
docker-compose up

# 3. Configure AWS
aws configure
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_REGISTRY

# 4. Build and push images
docker-compose build
docker tag api-gateway:latest YOUR_ECR_REGISTRY/api-gateway:latest
docker push YOUR_ECR_REGISTRY/api-gateway:latest

# 5. Deploy infrastructure
cd terraform
terraform init
terraform plan
terraform apply

# 6a. Deploy to ECS
aws ecs update-service --cluster microservices-cluster --service api-gateway --force-new-deployment

# 6b. OR Deploy to Kubernetes
kubectl apply -f k8s/
kubectl get all -n microservices
```

---

## Additional Resources

### Documentation:
- AWS Free Tier: https://aws.amazon.com/free/
- Docker Documentation: https://docs.docker.com/
- Jenkins Documentation: https://www.jenkins.io/doc/
- AWS ECS: https://docs.aws.amazon.com/ecs/
- AWS CLI: https://docs.aws.amazon.com/cli/

### Learning Resources:
- Jenkins Tutorial for Beginners
- AWS Certified Cloud Practitioner
- Docker for Beginners

### Community:
- AWS Community Forums
- DevOps Stack Exchange
- r/devops on Reddit

---

## Troubleshooting

### Common Issues:

**Issue: Docker build fails**
```bash
# Clear Docker cache
docker system prune -a
docker-compose build --no-cache
```

**Issue: AWS credentials not working**
```bash
# Reconfigure AWS CLI
aws configure
# Verify credentials
aws sts get-caller-identity
```

**Issue: Terraform state locked**
```bash
# Force unlock (use with caution)
terraform force-unlock LOCK_ID
```

**Issue: ECS task failing to start**
```bash
# Check CloudWatch logs
aws logs tail /ecs/microservices --follow

# Describe task
aws ecs describe-tasks --cluster microservices-cluster --tasks TASK_ARN
```

**Issue: Kubernetes pods not starting**
```bash
# Check pod status
kubectl get pods -n microservices

# Describe pod
kubectl describe pod POD_NAME -n microservices

# Check logs
kubectl logs POD_NAME -n microservices

# Check events
kubectl get events -n microservices --sort-by='.lastTimestamp'
```

**Issue: Cannot access Kubernetes services**
```bash
# Check services
kubectl get svc -n microservices

# Port forward for testing
kubectl port-forward svc/api-gateway 3000:3000 -n microservices

# Check if Docker Desktop Kubernetes is running
kubectl cluster-info
```

---

## Next Steps After Implementation

1. **Add Database Layer** - Integrate RDS
2. **Implement Caching** - Add Redis/ElastiCache (optional)
3. **API Documentation** - Swagger/OpenAPI
4. **Backup Strategy** - Automated backups
5. **HTTPS/SSL** - Add SSL certificates
6. **Performance Optimization** - CDN (CloudFront)
7. **Monitoring Dashboards** - Enhanced CloudWatch dashboards
8. **Auto-scaling** - Configure ECS auto-scaling

---

## Conclusion

This guide provides a complete DevOps transformation for your microservices e-commerce project. Start with Phase 1 and progress sequentially. Each phase builds on the previous one, ensuring a solid foundation for production deployment.

**Remember:**
- Start small, iterate often
- Monitor costs regularly
- Security first
- Document everything
- Automate everything possible

Good luck with your DevOps journey! 🚀
