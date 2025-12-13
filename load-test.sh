#!/bin/bash
echo "🚀 Starting Load Generation on Auth Service..."
echo "Creating a load-generator pod..."

kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never --namespace=food-app -- /bin/sh -c "while true; do wget -q -O- http://auth-service:3000/ > /dev/null; done"
