# Kong Dashboard

[![](https://badge.imagelayers.io/pgbi/kong-dashboard:latest.svg)](https://imagelayers.io/?images=pgbi/kong-dashboard:latest 'Get your own badge on imagelayers.io')

[**Kong**](https://getkong.org/) is a scalable, open source API Layer (also known as a API Gateway, or API Middleware).
Kong runs in front of any RESTful API and provide functionalities
and services such as requests routing, authentication, rate limiting, etc.

**Kong dashboard** is a UI tool that will let you manage your Kong Gateway setup.

## Compatibility

Current version of Kong dashboard is compatible with Kong 0.6.x, 0.7.x, 0.8.x and 0.9.x.

## Presentation

Click thumbnails to enlarge.

### Managing APIs

[![Listing APIs](screenshots/apis_list_thumbnail.jpg)](screenshots/apis_list.jpg?raw=true)
[![Adding API](screenshots/api_add_thumbnail.jpg)](screenshots/api_add.jpg?raw=true)

### Managing Consumers

[![Listing Consumers](screenshots/consumers_list_thumbnail.jpg)](screenshots/consumers_list.jpg?raw=true)
[![Editing Consumer](screenshots/consumer_edit_thumbnail.jpg)](screenshots/consumer_edit.jpg?raw=true)

### Managin Plugins

[![Listing Plugins](screenshots/plugins_list_thumbnail.jpg)](screenshots/plugins_list.jpg?raw=true)
[![Adding Plugin](screenshots/plugin_add_thumbnail.jpg)](screenshots/plugin_add.jpg?raw=true)

## Prerequisites

You will need:

1. a running Kong gateway. https://getkong.org/install/
2. nodejs and npm.

## Installation

### With Npm

```bash
# Install Kong Dashboard
npm install -g kong-dashboard

# Start Kong Dashboard
kong-dashboard start

# To start Kong Dashboard on a custom port
kong-dashboard start -p [port]

# To start Kong Dashboard with basic auth
kong-dashboard start -a user=password

# You can set basic auth user with environment variables
# Do not set -a parameter or this will be overwritten
set kong-dashboard-name=admin&& set kong-dashboard-pass=password&& kong-dashboard start
```

### From sources

```bash
# Pull repository
git clone https://github.com/PGBI/kong-dashboard.git
cd kong-dashboard

# Build Kong Dashboard
npm install

# Start Kong Dashboard
npm start

# To start Kong Dashboard on a custom port or with basic auth
npm start -- [-p port] [-a user=password]
```

### With Docker

```bash
# Start Kong Dashboard
docker run -d -p 8080:8080 pgbi/kong-dashboard

# Start Kong Dashboard on a custom port
docker run -d -p [port]:8080 pgbi/kong-dashboard
```


### With Vagrant

```bash
# Pull repository
git clone https://github.com/PGBI/kong-dashboard.git
cd kong-dashboard

# Start VM
vagrant up
```

## Use

You can now browse your kong dashboard at http://localhost:8080/dashboard/
