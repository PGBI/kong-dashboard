# Kong Dashboard

[**Kong**](https://getkong.org/) is a scalable, open source API Layer (also known as a API Gateway, or API Middleware). Kong runs in front of any RESTful API and provide functionalities
and services such as requests routing, authentication, rate limiting, etc.

**Kong dashboard** is a UI tool that will let you manage your Kong Gateway setup.

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

### Global installation

```bash
# Install kong-dashboard
npm install -g kong-dashboard

# Launch Kong Dashboard
kong-dashboard start

# To launch kong dashboard on a custom port
kong-dashboard start -p [port]
```

### Local installation

```bash
# Install with git and npm...
git clone https://github.com/PGBI/kong-dashboard.git
npm install

# ... or with npm only
npm install kong-dashboard

# Launch Kong Dashboard
npm start

# To launch kong dashboard on a custom port
npm start -- -p [port]
```
    
## Use

You can now browse your kong dashboard at http://localhost:8080
