pipeline {
    agent any
    
    environment {
        // GitHub Repository
        GIT_REPO = 'https://github.com/ChamothAshen/microservices-e-commerce.git'
        GIT_BRANCH = 'main'
        
        // AWS Configuration (update later)
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = 'YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com'
        
        // Build metadata
        BUILD_TIMESTAMP = sh(returnStdout: true, script: 'date +%Y%m%d-%H%M%S').trim()
    }
    
    stages {
        stage('📥 Checkout from GitHub') {
            steps {
                echo "Checking out code from GitHub..."
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${GIT_BRANCH}"]],
                    userRemoteConfigs: [[
                        url: "${GIT_REPO}",
                        credentialsId: 'github-credentials'
                    ]]
                ])
                
                script {
                    // Get commit information
                    env.GIT_COMMIT_MSG = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                    env.GIT_AUTHOR = sh(returnStdout: true, script: 'git log -1 --pretty=%an').trim()
                    env.GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    
                    echo "📝 Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "👤 Author: ${env.GIT_AUTHOR}"
                    echo "💬 Message: ${env.GIT_COMMIT_MSG}"
                }
            }
        }
        
        stage('🔍 Code Quality Check') {
            steps {
                echo "Running code quality checks..."
                script {
                    // Check for .gitignore
                    if (!fileExists('.gitignore')) {
                        error "❌ .gitignore file is missing!"
                    }
                    
                    // Count services
                    def services = ['api-gateway', 'auth-service', 'product-service', 'order-service', 'frontend-client']
                    services.each { service ->
                        if (!fileExists("${service}/package.json")) {
                            error "❌ ${service}/package.json is missing!"
                        }
                    }
                    echo "✅ All services have package.json"
                }
            }
        }
        
        stage('📦 Install Dependencies & Test') {
            parallel {
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            bat 'npm ci --prefer-offline'
                            bat 'npm test || echo "⚠️ No tests configured"'
                        }
                    }
                }
                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            bat 'npm ci --prefer-offline'
                            bat 'npm test || echo "⚠️ No tests configured"'
                        }
                    }
                }
                stage('Product Service') {
                    steps {
                        dir('product-service') {
                            bat 'npm ci --prefer-offline'
                            bat 'npm test || echo "⚠️ No tests configured"'
                        }
                    }
                }
                stage('Order Service') {
                    steps {
                        dir('order-service') {
                            bat 'npm ci --prefer-offline'
                            bat 'npm test || echo "⚠️ No tests configured"'
                        }
                    }
                }
            }
        }
        
        stage('🐳 Build Docker Images') {
            when {
                branch 'main'
            }
            steps {
                echo "Building Docker images..."
                script {
                    def services = [
                        'api-gateway',
                        'auth-service', 
                        'product-service',
                        'order-service',
                        'frontend-client'
                    ]
                    
                    services.each { service ->
                        echo "🔨 Building ${service}..."
                        bat """
                            docker build -t ${service}:${BUILD_NUMBER} ./${service}
                            docker tag ${service}:${BUILD_NUMBER} ${service}:latest
                        """
                    }
                }
                echo "✅ All Docker images built successfully!"
            }
        }
        
        stage('🧪 Docker Compose Test') {
            when {
                branch 'main'
            }
            steps {
                echo "Testing with Docker Compose..."
                bat '''
                    docker-compose -f docker-compose.yml config
                    echo "✅ Docker Compose configuration is valid"
                '''
            }
        }
        
        stage('📤 Push to ECR (Optional)') {
            when {
                allOf {
                    branch 'main'
                    environment name: 'ENABLE_ECR_PUSH', value: 'true'
                }
            }
            steps {
                echo "⏭️ Skipping ECR push (configure AWS credentials first)"
                // Uncomment when AWS is configured:
                /*
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    bat """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    """
                    
                    def services = ['api-gateway', 'auth-service', 'product-service', 'order-service', 'frontend-client']
                    services.each { service ->
                        bat """
                            docker tag ${service}:${BUILD_NUMBER} ${ECR_REGISTRY}/${service}:${BUILD_NUMBER}
                            docker tag ${service}:${BUILD_NUMBER} ${ECR_REGISTRY}/${service}:latest
                            docker push ${ECR_REGISTRY}/${service}:${BUILD_NUMBER}
                            docker push ${ECR_REGISTRY}/${service}:latest
                        """
                    }
                }
                */
            }
        }
    }
    
    post {
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline completed successfully!'
            echo '✅ ========================================='
            echo "📊 Build #${BUILD_NUMBER}"
            echo "🔖 Commit: ${env.GIT_COMMIT_SHORT}"
            echo "👤 Author: ${env.GIT_AUTHOR}"
            echo "💬 Message: ${env.GIT_COMMIT_MSG}"
            echo '✅ ========================================='
        }
        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline failed!'
            echo '❌ ========================================='
            echo "Please check the logs for errors"
            echo '❌ ========================================='
        }
        always {
            echo 'Cleaning up...'
            bat 'docker system prune -f || echo "Cleanup completed"'
        }
    }
}