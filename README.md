# Kong Dashboard

[**Kong**](https://getkong.org/) is a scalable, open source API Layer (also known as a API Gateway, or API Middleware). Kong runs in front of any RESTful API and provide functionalities
and services such as requests routing, authentication, rate limiting, etc.



**Kong dashboard** is a UI tool that will let you manage your Kong Gateway setup.

## Prerequisites

You will need:

1. a running Kong gateway. https://getkong.org/install/
2. nodejs and npm.

## Installation

### Clone this repository

    git clone https://github.com/PGBI/kong-dashboard.git
    
### Install dependencies

    npm install
    npm run build

### Launch Kong Dashboard

    npm run serve
    
## Use

You can now browse your kong dashboard at http://localhost:8000
