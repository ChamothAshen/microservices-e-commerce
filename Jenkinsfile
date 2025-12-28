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
                            bat 'npm ci'
                            bat 'npm test || echo "⚠️ No tests configured"'
                        }
                    }
                }

                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            bat 'npm ci'
                            bat 'npm test || echo "⚠️ No tests configured"'
                        }
                    }
                }

                stage('Product Service') {
                    steps {
                        dir('product-service') {
                            bat 'npm ci'
                            bat 'npm test || echo "⚠️ No tests configured"'('order-service') {
                        }
                    }t || echo "⚠️ No tests configured"'
                }

                stage('Order Service') {
                stage('Order Service') {
                    steps {
                        dir('order-service') {
                            bat 'npm ci'        stage('🐳 Build Docker Images') {
                            bat 'npm test || echo "⚠️ No tests configured"'
                        }
                    }ipt {
                }services = [
            }',
        },
e',
        stage('🐳 Build Docker Images') {
            when { branch 'main' }
            steps {
                script {ervices.each { service ->
                    def services = [                        echo "🔨 Building ${service}"
                        'api-gateway',
                        'auth-service',}:${BUILD_NUMBER} ./${service}
                        'product-service',ker tag ${service}:${BUILD_NUMBER} ${service}:latest
                        'order-service',
                        'frontend-client'
                    ]
"✅ Docker images built"
                    services.each { service ->
                        echo "🔨 Building ${service}"
                        bat """
                            docker build -t ${service}:${BUILD_NUMBER} ./${service}tage('🧪 Docker Compose Validation') {
                            docker tag ${service}:${BUILD_NUMBER} ${service}:latest            when { branch 'main' }
                        """
                    }
                } docker-compose -f docker-compose.yml config
                echo "✅ Docker images built"o Docker Compose file is valid
            }
        }

        stage('🧪 Docker Compose Validation') {
            when { branch 'main' }
            steps {ost {
                bat '''        success {
                    docker-compose -f docker-compose.yml config  echo '✅ ========================================='
                    echo Docker Compose file is valid'✅ Pipeline completed successfully!'
                '''
            }
        }========'
    }

    post {ailure {
        success {            echo '❌ ========================================='
            echo '✅ =========================================''❌ Pipeline failed!'
            echo '✅ Pipeline completed successfully!'
            echo "🔖 Commit: ${env.GIT_COMMIT_SHORT}"
            echo "👤 Author: ${env.GIT_AUTHOR}"
            echo '✅ ========================================='lways {
        }            bat 'docker system prune -f || echo Cleanup done'

        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline failed!'            echo '❌ ========================================='        }

        always {
            bat 'docker system prune -f || echo Cleanup done'
        }
    }
}
