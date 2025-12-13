pipeline {
    agent any   // 🔥 No Kubernetes — run on Jenkins host

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKERHUB_USERNAME = 'manishr09'
        NAMESPACE = 'food-app'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Tools If Needed') {
            steps {
                sh '''
                echo "Installing dependencies if missing..."

                # Install Trivy if not found
                if ! which trivy > /dev/null; then
                    echo "Installing Trivy..."
                    sudo apt-get update
                    sudo apt-get install -y wget apt-transport-https gnupg lsb-release
                    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
                    echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/trivy.list
                    sudo apt-get update
                    sudo apt-get install -y trivy
                fi

                # Install Ansible if not found
                if ! which ansible > /dev/null; then
                    echo "Installing Ansible..."
                    sudo apt-get update
                    sudo apt-get install -y ansible
                fi
                '''
            }
        }

        stage('Determine Changed Services') {
            steps {
                script {
                    echo "Checking changed files..."

                    // Initialize flags
                    env.AUTH_CHANGED = "false"
                    env.ORDER_CHANGED = "false"
                    env.PAYMENT_CHANGED = "false"
                    env.RESTAURANT_CHANGED = "false"

                    // Get commit count on repo
                    def commitCount = sh(
                        script: "git rev-list --count HEAD",
                        returnStdout: true
                    ).trim() as Integer

                    def changedFiles = ""

                    if (commitCount > 1) {
                        // SAFE DIFF (never fails)
                        changedFiles = sh(
                            script: "git diff --name-only HEAD~1 HEAD || true",
                            returnStdout: true
                        ).trim()
                    } else {
                        echo "Only one commit exists — performing full build."
                        changedFiles = "ALL"
                    }

                    echo "Changed files:\n${changedFiles}"

                    if (changedFiles == "ALL" || changedFiles.contains("auth-service/")) {
                        env.AUTH_CHANGED = "true"
                    }
                    if (changedFiles == "ALL" || changedFiles.contains("order-service/")) {
                        env.ORDER_CHANGED = "true"
                    }
                    if (changedFiles == "ALL" || changedFiles.contains("payment-service/")) {
                        env.PAYMENT_CHANGED = "true"
                    }
                    if (changedFiles == "ALL" || changedFiles.contains("restaurant-service/")) {
                        env.RESTAURANT_CHANGED = "true"
                    }

                    echo "Auth changed: ${env.AUTH_CHANGED}"
                    echo "Order changed: ${env.ORDER_CHANGED}"
                    echo "Payment changed: ${env.PAYMENT_CHANGED}"
                    echo "Restaurant changed: ${env.RESTAURANT_CHANGED}"
                }
            }
        }


        stage('Security Scan (SAST)') {
            steps {
                script {
                    echo "Running Trivy Security Scan on Source Code"
                    // We can still scan everything or just changed. Scanning everything is safer and fast enough usually.
                    sh 'trivy fs --exit-code 0 --severity HIGH,CRITICAL --no-progress .'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    if (env.AUTH_CHANGED == "true") {
                        echo "Building Auth Service..."
                        sh 'docker build -t $DOCKERHUB_USERNAME/auth-service:latest ./auth-service'
                    }
                    if (env.ORDER_CHANGED == "true") {
                        echo "Building Order Service..."
                        sh 'docker build -t $DOCKERHUB_USERNAME/order-service:latest ./order-service'
                    }
                    if (env.PAYMENT_CHANGED == "true") {
                        echo "Building Payment Service..."
                        sh 'docker build -t $DOCKERHUB_USERNAME/payment-service:latest ./payment-service'
                    }
                    if (env.RESTAURANT_CHANGED == "true") {
                        echo "Building Restaurant Service..."
                        sh 'docker build -t $DOCKERHUB_USERNAME/restaurant-service:latest ./restaurant-service'
                    }
                }
            }
        }

        stage('Scan Docker Images (Trivy)') {
            steps {
                script {
                    echo "Scanning Built Docker Images..."
                    if (env.AUTH_CHANGED == "true") {
                        sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/auth-service:latest'
                    }
                    if (env.ORDER_CHANGED == "true") {
                        sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/order-service:latest'
                    }
                    if (env.PAYMENT_CHANGED == "true") {
                        sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/payment-service:latest'
                    }
                    if (env.RESTAURANT_CHANGED == "true") {
                        sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/restaurant-service:latest'
                    }
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: DOCKERHUB_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        // Only login if at least one service changed
                        if (env.AUTH_CHANGED == "true" || env.ORDER_CHANGED == "true" || env.PAYMENT_CHANGED == "true" || env.RESTAURANT_CHANGED == "true") {
                             sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                        }

                        if (env.AUTH_CHANGED == "true") {
                            sh 'docker push $DOCKERHUB_USERNAME/auth-service:latest'
                        }
                        if (env.ORDER_CHANGED == "true") {
                            sh 'docker push $DOCKERHUB_USERNAME/order-service:latest'
                        }
                        if (env.PAYMENT_CHANGED == "true") {
                            sh 'docker push $DOCKERHUB_USERNAME/payment-service:latest'
                        }
                        if (env.RESTAURANT_CHANGED == "true") {
                            sh 'docker push $DOCKERHUB_USERNAME/restaurant-service:latest'
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes via Ansible') {
            steps {
                script {
                    sh '''
                        sudo apt-get update
                        sudo apt-get install -y python3-kubernetes
                    '''
                    dir('ansible') {
                        sh 'ansible-playbook deploy-all-services.yml'
                    }
                }
            }
        }

        // stage('Deploy to Kubernetes via Ansible') {
        //     steps {
        //         script {
        //             sh '''
        //                 sudo apt-get update
        //                 sudo apt-get install -y python3-kubernetes
        //             '''
        //             dir('ansible') {
        //                 sh 'ansible-playbook deploy-all-services.yml'
        //             }
        //         }
        //     }
        // }

        stage('Load Test & HPA Verification') {
            steps {
                script {
                    sh 'chmod +x load-test-hpa.sh'
                    sh './load-test-hpa.sh'
                }
            }
        }
    }
}
