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

        // stage('Install Tools If Needed') {
        //     steps {
        //         sh '''
        //         echo "Installing dependencies if missing..."
        //         which trivy || sudo apt-get install -y trivy
        //         which ansible || sudo apt-get install -y ansible
        //         '''
        //     }
        // }

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

        
        // stage('Determine Changed Services') {
        //     steps {
        //         script {
        //             // Initialize flags to false
        //             env.AUTH_CHANGED = "false"
        //             env.ORDER_CHANGED = "false"
        //             env.PAYMENT_CHANGED = "false"
        //             env.RESTAURANT_CHANGED = "false"

        //             // Check for changes in the last commit (HEAD~1 to HEAD)
        //             // If running on a fresh clone or first build, this might need adjustment to diff against a main branch or previous successful build
        //             def changedFiles = sh(script: "git diff --name-only HEAD~1 HEAD", returnStdout: true).trim()
                    
        //             echo "Changed files:\n${changedFiles}"

        //             if (changedFiles.contains("auth-service/")) {
        //                 env.AUTH_CHANGED = "true"
        //                 echo "Changes detected in Auth Service"
        //             }
        //             if (changedFiles.contains("order-service/")) {
        //                 env.ORDER_CHANGED = "true"
        //                 echo "Changes detected in Order Service"
        //             }
        //             if (changedFiles.contains("payment-service/")) {
        //                 env.PAYMENT_CHANGED = "true"
        //                 echo "Changes detected in Payment Service"
        //             }
        //             if (changedFiles.contains("restaurant-service/")) {
        //                 env.RESTAURANT_CHANGED = "true"
        //                 echo "Changes detected in Restaurant Service"
        //             }
                    
        //             // Optional: If changes are in common areas (like Jenkinsfile or ansible), maybe rebuild all?
        //             // For now, sticking strictly to microservice folders as requested.
        //         }
        //     }
        // }

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



// pipeline {
//     agent {
//         kubernetes {
//             yaml '''
// apiVersion: v1
// kind: Pod
// metadata:
//   labels:
//     app: jenkins-agent
// spec:
//   serviceAccountName: jenkins
//   containers:
//   - name: docker
//     image: docker:latest
//     command:
//     - cat
//     tty: true
//     volumeMounts:
//     - mountPath: /var/run/docker.sock
//       name: docker-sock
//   - name: ansible
//     image: willhallonline/ansible:2.14-alpine
//     command:
//     - cat
//     tty: true
//   - name: trivy
//     image: aquasec/trivy:latest
//     command:
//     - cat
//     tty: true
//     volumeMounts:
//     - mountPath: /var/run/docker.sock
//       name: docker-sock
//   volumes:
//   - name: docker-sock
//     hostPath:
//       path: /var/run/docker.sock
//       type: Socket
// '''
//         }
//     }

//     environment {
//         DOCKERHUB_CREDENTIALS_ID = 'docker-hub-credentials'
//         DOCKERHUB_USERNAME = 'manishr09'
//         NAMESPACE = 'food-app'
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Security Scan (SAST)') {
//             steps {
//                 container('trivy') {
//                     script {
//                         echo "Running Trivy Security Scan (Filesystem)..."
//                         // Scan the current directory for vulnerabilities in code/deps
//                         // --exit-code 0 means don't fail the build, just report
//                         sh 'trivy fs --exit-code 0 --severity HIGH,CRITICAL --no-progress .'
//                     }
//                 }
//             }
//         }

//         stage('Build Docker Images') {
//             steps {
//                 container('docker') {
//                     script {
//                         sh 'docker build -t $DOCKERHUB_USERNAME/auth-service:latest ./auth-service'
//                         sh 'docker build -t $DOCKERHUB_USERNAME/order-service:latest ./order-service'
//                         sh 'docker build -t $DOCKERHUB_USERNAME/payment-service:latest ./payment-service'
//                         sh 'docker build -t $DOCKERHUB_USERNAME/restaurant-service:latest ./restaurant-service'
//                     }
//                 }
//             }
//         }

//         stage('Scan Docker Images') {
//             steps {
//                 container('trivy') {
//                     script {
//                         echo "Scanning Docker Images for Vulnerabilities..."
//                         sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/auth-service:latest'
//                         sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/order-service:latest'
//                         sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/payment-service:latest'
//                         sh 'trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $DOCKERHUB_USERNAME/restaurant-service:latest'
//                     }
//                 }
//             }
//         }

//         stage('Push to Docker Hub') {
//             steps {
//                 container('docker') {
//                     script {
//                         withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
//                             sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            
//                             sh 'docker push $DOCKERHUB_USERNAME/auth-service:latest'
//                             sh 'docker push $DOCKERHUB_USERNAME/order-service:latest'
//                             sh 'docker push $DOCKERHUB_USERNAME/payment-service:latest'
//                             sh 'docker push $DOCKERHUB_USERNAME/restaurant-service:latest'
//                         }
//                     }
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes') {
//             steps {
//                 container('ansible') {
//                     script {
//                         // Install python kubernetes client needed for ansible k8s module
//                         sh 'pip install kubernetes'
                        
//                         dir('ansible') {
//                             sh 'ansible-playbook deploy-all-services.yml'
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }
