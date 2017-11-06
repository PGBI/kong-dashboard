# Contributing to Kong-Dashboard

## Reporting bugs

TODO

## Submitting a PR

### Development setup

We've built some tools that will help you get started if you want to work on Kong dashboard.

All you need is to have [docker](https://docs.docker.com) and [docker-compose](https://docs.docker.com/compose/)
installed on your computer.

#### Start kong-dashboard in dev mode

```
KONG_VERSION=0.9 docker-compose up kong-dashboard
```
This command will start 3 docker containers:
- one running Kong v0.9. You can pick any Kong version after the 0.9 one.
- one running a postgres db for Kong.
- one building and serving Kong dashboard on localhost:8081

Any change made into the `/src` folder will result in Kong dashboard being automatically rebuilt on
the fly. All you have to do is refreshing the page in your browser to see the change.

#### Running tests

```
# If not already done, start docker compose
KONG_VERSION=0.9 docker-compose up kong-dashboard

# Resetting Kong completely before starting tests
docker exec -it kong sh -c "yes | kong migrations reset && kong migrations up"

# Run tests
npm test
```
