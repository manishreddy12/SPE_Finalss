# Jenkins CI/CD Setup Guide

## 1. Prerequisites
- Minikube running with `jenkins` namespace.
- Jenkins deployed and running (Access via `minikube service jenkins -n jenkins --url`).

## 2. Install Plugins
Ensure the following plugins are installed in Jenkins:
- **Docker Pipeline**
- **Git**
- **Ansible** (if using Ansible plugin, otherwise command line is fine)

## 3. Configure Credentials
You need to add your Docker Hub credentials so Jenkins can push images.

1.  Go to **Manage Jenkins** -> **Manage Credentials**.
2.  Click on **System** -> **Global credentials (unrestricted)**.
3.  Click **Add Credentials**.
4.  **Kind**: Username with password.
5.  **Scope**: Global.
6.  **Username**: `manishr09`
7.  **Password**: *Your Docker Hub Password / Access Token*.
8.  **ID**: `docker-hub-credentials` (Must match the Jenkinsfile).
9.  Click **Create**.

## 4. Install Ansible on Jenkins
The pipeline runs `ansible-playbook`. The Jenkins pod/node must have `ansible` and `kubernetes` python library installed.
If running in a default Jenkins image, you might need to install it:

# Exec into Jenkins pod
kubectl exec -it -n jenkins <jenkins-pod-name> -- /bin/bash
# Install Ansible and Docker CLI
apt-get update && apt-get install -y ansible python3-pip curl
pip3 install kubernetes

# Install Docker CLI
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
exit
```

## 5. Create the Pipeline Job
1.  **New Item** -> **Pipeline**.
2.  Name: `food-ordering-app`.
3.  **Definition**: Pipeline script from SCM.
4.  **SCM**: Git.
5.  **Repository URL**: *Your GitHub Repo URL*.
6.  **Script Path**: `Jenkinsfile`.
7.  Save.

## 6. Configure GitHub Webhook (Optional for Auto-trigger)
1.  Go to your GitHub Repo -> **Settings** -> **Webhooks**.
2.  **Payload URL**: `<jenkins-url>/github-webhook/` (Note: You need to expose Jenkins via ngrok or similar if using local Minikube).
3.  **Content type**: `application/json`.
4.  **Which events?**: Just the push event.
5.  Check **Build triggers** in Jenkins Job: `GitHub hook trigger for GITScm polling`.

## 7. Run
Click **Build Now** to test the pipeline.
