pipeline {
    agent any

    environment {
        GIT_REPO   = 'https://github.com/ChamothAshen/microservices-e-commerce.git'
        GIT_BRANCH = 'main'

        // --- CONFIGURATION: FILL THESE IN ---
        AWS_ACCOUNT_ID = '526801978255'   // e.g. 123456789012
        AWS_REGION     = 'eu-north-1'             // e.g. us-east-1
        EC2_IP         = '13.60.187.103'    // e.g. 54.123.45.67
        
        // --- AUTOMATIC VARIABLES ---
        ECR_REGISTRY   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_NAME     = "auth-service"
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
                    env.GIT_COMMIT_MSG = bat(
                        script: 'git log -1 --pretty=%%B',
                        returnStdout: true
                    ).trim()

                    env.GIT_AUTHOR = bat(
                        script: 'git log -1 --pretty=%%an',
                        returnStdout: true
                    ).trim()

                    env.GIT_COMMIT_SHORT = bat(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    echo "📝 Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "👤 Author: ${env.GIT_AUTHOR}"
                    echo "💬 Message: ${env.GIT_COMMIT_MSG}"
                }
            }
        }

        stage('🔍 Code Quality Check') {
            steps {
                script {
                    if (!fileExists('.gitignore')) {
                        error "❌ .gitignore file is missing!"
                    }

                    def services = [
                        'api-gateway',
                        'auth-service',
                        'product-service',
                        'order-service'
                    ]

                    services.each { service ->
                        if (!fileExists("${service}/package.json")) {
                            error "❌ ${service}/package.json is missing!"
                        }
                    }
                    
                    // Optional: Check frontend-client if exists
                    if (fileExists('frontend-client/package.json')) {
                        echo "✅ frontend-client found"
                    } else {
                        echo "⚠️ frontend-client not yet implemented"
                    }

                    echo "✅ Code structure validated"
                }
            }
        }

        stage('📦 Install Dependencies & Test') {
            parallel {

                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            bat 'npm install'
                            bat 'npm run test --if-present'
                        }
                    }
                }

                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            bat 'npm install'
                            bat 'npm run test --if-present'
                        }
                    }
                }

                stage('Product Service') {
                    steps {
                        dir('product-service') {
                            bat 'npm install'
                            bat 'npm run test --if-present'
                        }
                    }
                }

                stage('Order Service') {
                    steps {
                        dir('order-service') {
                            bat 'npm install'
                            bat 'npm run test --if-present'
                        }
                    }
                }
            }
        }

        stage('🐳 Build Docker Images') {
            steps {
                script {
                    def services = [
                        'api-gateway',
                        'auth-service',
                        'product-service',
                        'order-service'
                    ]

                    services.each { service ->
                        echo "🔨 Building ${service}"
                        bat """
                            docker build -t ${service}:${BUILD_NUMBER} ./${service}
                            docker tag ${service}:${BUILD_NUMBER} ${service}:latest
                        """
                    }
                }
                echo "✅ Docker images built"
            }
        }

        stage('🧪 Docker Compose Validation') {
            steps {
                bat '''
                    docker-compose -f docker-compose.yml config
                    echo Docker Compose file is valid
                '''
            }
        }

        stage('☁️ Push to AWS ECR') {
            steps {
                script {
                    // Login to AWS ECR using credentials
                    withCredentials([usernamePassword(credentialsId: 'aws-access-key-id', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                        // 1. Login
                        bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                        
                        // 2. Tag
                        bat "docker tag ${IMAGE_NAME}:latest ${ECR_REGISTRY}/${IMAGE_NAME}:latest"
                        
                        // 3. Push
                        bat "docker push ${ECR_REGISTRY}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('🚀 Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    script {
                        // 1. Copy the production compose file to the server
                        bat "scp -o StrictHostKeyChecking=no docker-compose.prod.yml ubuntu@${EC2_IP}:/home/ubuntu/docker-compose.yml"
                        
                        // 2. SSH into server and restart the service
                        bat """
                            ssh -o StrictHostKeyChecking=no ubuntu@${EC2_IP} "export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID} && export AWS_REGION=${AWS_REGION} && export MONGODB_URI=mongodb+srv://it22577542_db_user:User123@cluster0.lysvtbc.mongodb.net/ecommerce?appName=Cluster0 && export JWT_SECRET=supersecretkey && aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY} && docker-compose pull auth-service && docker-compose up -d --no-deps auth-service && docker image prune -f"
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline completed successfully!'
            echo "🔖 Commit: ${env.GIT_COMMIT_SHORT}"
            echo "👤 Author: ${env.GIT_AUTHOR}"
            echo '✅ ========================================='
        }

        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline failed!'
            echo '❌ ========================================='
        }

        always {
            bat 'docker system prune -f || echo Cleanup done'
        }
    }
}
