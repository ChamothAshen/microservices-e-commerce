pipeline {
    agent any

    environment {
        GIT_REPO   = 'https://github.com/ChamothAshen/microservices-e-commerce.git'
        GIT_BRANCH = 'main'
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
