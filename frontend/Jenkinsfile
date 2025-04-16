pipeline{
    agent any
    tools{
        jdk 'jdk17'
        nodejs 'node16'
    }
    environment {
        SCANNER_HOME=tool 'sonar-scanner'
    }
    stages {
        stage('clean workspace'){
            steps{
                cleanWs()
            }
        }
  
        stage('Checkout from Git'){
            steps{
                git branch: 'main', url: 'https://github.com/digmbersingh77/Movies_Music_Recommendation.git'
            }
        }
        stage("Sonarqube Analysis "){
            steps{
                withSonarQubeEnv('sonar-server') {
                    sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=FYP \
                    -Dsonar.projectKey=FYP '''
                }
            }
        }
        stage("quality gate"){
          steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token' 
                }
            } 
        }
        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }
        stage('OWASP FS SCAN') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage('TRIVY FS SCAN') {
            steps {
                script {
                    def exitCode = sh(script: "trivy fs . --exit-code 0", returnStatus: true)
                    if (exitCode != 0) {
                        currentBuild.result = 'UNSTABLE'
                        echo "Trivy scan found vulnerabilities, marking build as UNSTABLE."
                    }
                }
            }
        }
        stage("Building Docker"){
            steps{
                sh "docker build -t app:latest . --no-cache"
            }
        }
        stage("Push to DockerHub"){
            steps{
                script{
                    echo "Pusing the image to DockerHub..."
                    // withCredentials([usernamePassword(credentialsId:"dockerHub",passwordVariable:"dockerHubPass",usernameVariable:"dockerHubUser")]){
                    //     sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPass}"
                    //     sh "docker tag app ${env.dockerHubUser}/app:latest"
                    //     sh "docker push ${env.dockerHubUser}/app:latest" 
                    // }
                    
                }
            }
        }
        stage("TRIVY DockerHub"){
            steps{
                sh "trivy image app:latest > trivy.txt" 
            }
        }
        stage('Check and Stop Existing Container') {
            steps {
                script {
                    def containerId = sh(script: "docker ps -q --filter 'publish=3000'", returnStdout: true).trim()
                    if (containerId) {
                        echo "Stopping and removing existing container on port 3000..."
                        sh "docker stop ${containerId}"
                        sh "docker rm ${containerId}"
                    } else {
                        echo "No container running on port 3000."
                    }
                }
            }
        }

        stage('Deploying Container') {
            steps {
                script {
                    echo "Running Docker container..."
                    sh "docker run -d -p 3000:3000 app:latest"
                }
            }
        }
       

    }
}

