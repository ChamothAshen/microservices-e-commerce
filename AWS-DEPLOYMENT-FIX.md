# AWS Deployment Fix Guide

## Issues Fixed

### 1. **AWS Credentials Configuration**
- **Problem**: Using `usernamePassword` credential type which doesn't work with AWS
- **Solution**: Changed to `AmazonWebServicesCredentialsBinding` for proper AWS authentication

### 2. **ECR Login Issue on Windows**
- **Problem**: Direct piping doesn't work properly in Windows batch
- **Solution**: Store password in variable first, then pipe to docker login

### 3. **Missing ECR Repositories**
- **Problem**: Pipeline fails if ECR repositories don't exist
- **Solution**: Added automatic repository creation before pushing images

### 4. **Only One Service Deployed**
- **Problem**: Only `auth-service` was being pushed and deployed
- **Solution**: Updated to handle all 4 services (api-gateway, auth-service, product-service, order-service)

### 5. **Incomplete docker-compose.prod.yml**
- **Problem**: Production compose file only had auth-service
- **Solution**: Added all microservices with proper configuration

## Required Jenkins Credentials

You need to configure these credentials in Jenkins:

### 1. AWS Credentials (`aws-credentials`)
- Type: **AWS Credentials**
- ID: `aws-credentials`
- Access Key ID: Your AWS Access Key
- Secret Access Key: Your AWS Secret Key

### 2. EC2 SSH Key (`ec2-ssh-key`)
- Type: **SSH Username with private key**
- ID: `ec2-ssh-key`
- Username: `ubuntu`
- Private Key: Your EC2 private key (.pem file)

### 3. GitHub Credentials (`github-credentials`)
- Type: **Username with password** or **Personal Access Token**
- ID: `github-credentials`

## Steps to Configure Jenkins Credentials

1. Go to Jenkins Dashboard → Manage Jenkins → Manage Credentials
2. Click on "(global)" domain
3. Click "Add Credentials"

### For AWS Credentials:
- Kind: **AWS Credentials**
- ID: `aws-credentials`
- Description: AWS ECR Access
- Access Key ID: `<your-access-key>`
- Secret Access Key: `<your-secret-key>`

### For EC2 SSH:
- Kind: **SSH Username with private key**
- ID: `ec2-ssh-key`
- Username: `ubuntu`
- Private Key: Enter directly (paste your .pem file content)

## EC2 Instance Prerequisites

Make sure your EC2 instance has:

1. **Docker installed**
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io
   sudo usermod -aG docker ubuntu
   ```

2. **Docker Compose installed**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **AWS CLI installed**
   ```bash
   sudo apt-get install -y awscli
   ```

4. **AWS credentials configured** (for ECR access)
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter region: eu-north-1
   ```

5. **Security Group** allows:
   - Port 22 (SSH)
   - Port 5000 (API Gateway)
   - Port 5001 (Auth Service)
   - Port 5002 (Product Service)
   - Port 5003 (Order Service)

## Testing the Pipeline

After configuring credentials:

1. Commit and push these changes to GitHub
2. Trigger the Jenkins pipeline
3. Monitor each stage - they should all pass now

## Troubleshooting

### If ECR login fails:
- Verify AWS credentials in Jenkins
- Check IAM permissions include ECR (AmazonEC2ContainerRegistryFullAccess)

### If SSH to EC2 fails:
- Verify SSH key is correct
- Check EC2 security group allows your Jenkins server IP

### If Docker push fails:
- Check AWS region is correct (eu-north-1)
- Verify ECR repositories exist or get created automatically

## Changes Made

1. **Jenkinsfile**:
   - Fixed AWS credentials binding
   - Added ECR repository auto-creation
   - Updated to push all 4 services
   - Fixed Windows batch script for ECR login
   - Updated deployment to pull and start all services

2. **docker-compose.prod.yml**:
   - Added product-service
   - Added order-service
   - Added api-gateway with dependencies
   - Configured proper environment variables
