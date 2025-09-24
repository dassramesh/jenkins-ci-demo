pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "dassramesh29/simple-flask-app"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Docker Image') {
            steps {
                bat "docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% ."
            }
        }
        stage('Test') {
            steps {
                // Run pytest inside the container
                bat "docker run --rm %DOCKER_IMAGE%:%BUILD_NUMBER% pytest -q || exit 1"
            }
        }
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                 usernameVariable: 'DOCKER_USER',
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
                    bat "docker tag %DOCKER_IMAGE%:%BUILD_NUMBER% %DOCKER_IMAGE%:latest"
                    bat "docker push %DOCKER_IMAGE%:%BUILD_NUMBER%"
                    bat "docker push %DOCKER_IMAGE%:latest"
                }
            }
        }
        stage('Deploy (run container)') {
            steps {
                // Stop old container if running and deploy new one
                bat """
                docker ps -q -f name=myapp >nul 2>&1
                if %ERRORLEVEL%==0 (
                    docker rm -f myapp
                )
                docker run -d --name myapp -p 3000:5000 %DOCKER_IMAGE%:latest
                """
            }
        }
    }
    post {
        always {
            echo "✅ Pipeline finished. Check console output for details."
        }
    }
}
