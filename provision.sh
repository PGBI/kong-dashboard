#!/bin/bash
cd /vagrant

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt-get update
apt-get install -y nodejs git

rm -r node_modules
npm install && npm run build && npm prune --production
echo "Successfully Installed Kong Dashboard."
