#!/bin/sh

npm install
node_modules/.bin/gulp serve -u http://kong:8001 --verbose
