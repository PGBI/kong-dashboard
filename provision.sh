#!/bin/bash
cd /vagrant
sudo apt-get update
sudo apt-get install -y nodejs npm git
sudo ln -s /usr/bin/nodejs /usr/bin/node
rm -r node_modules
sudo -u vagrant -H sh -c "npm install"
echo "Successfully Installed Kong Dashboard."
echo "To run Kong Dashboard:"
echo " - ssh into the vagrant box: vagrant ssh"
echo " - start Kong Dashboard: cd /vagrant && npm start"
