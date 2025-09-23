pipeline {
  agent any
  environment {
    REGISTRY = "dassramesh29/jenkins-simple-app"
    TAG = "${env.BUILD_NUMBER}"
    DOCKERHUB = credentials('dockerhub-creds') // create this credential in Jenkins
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install') { steps { sh 'npm ci' } }

    stage('Start app for tests') {
      steps {
        // use port 3000 for the temporary test server to avoid port conflicts
        sh 'PORT=3000 nohup npm start > app.log 2>&1 & echo $! > app.pid'
        sh 'sleep 3'
      }
    }

    stage('Test') {
      steps {
        sh 'PORT=3000 npm test'
      }
      post { always { sh 'if [ -f app.pid ]; then kill $(cat app.pid) || true; rm -f app.pid; fi || true' } }
    }

    stage('Build Docker Image') {
      steps { sh 'docker build -t $REGISTRY:$TAG .' }
    }

    stage('Push to Docker Hub') {
      steps {
        sh 'echo $DOCKERHUB_PSW | docker login -u $DOCKERHUB_USR --password-stdin'
        sh 'docker push $REGISTRY:$TAG'
      }
    }

    stage('Deploy (run container)') {
      steps {
        // map container 8080 to host 8081 so Jenkins (on 8080) doesn't conflict
        sh '''
          docker rm -f jenkins-simple-app || true
          docker run -d --name jenkins-simple-app -p 8081:8080 $REGISTRY:$TAG
        '''
      }
    }
  }
}
