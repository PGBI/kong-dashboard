# Contributing to Kong-Dashboard

## Reporting bugs

Feel free to submit an issue on the github repository if you find a bug using Kong Dashboard. When doing so, please
make sure you submit the following information:
- Kong version
- Kong Dashboard version
- node & npm version

## Contributing to the code

### Development setup

We've built some tools that will help you get started if you want to work on Kong Dashboard.

All you need is to have [docker](https://docs.docker.com) and [docker-compose](https://docs.docker.com/compose/)
installed on your computer.

#### Start kong-dashboard in development mode

```bash
KONG_VERSION=0.9 docker-compose up kong-dashboard
```
This command will start 3 docker containers:
- one running Kong v0.9. You can pick any Kong version after the 0.9 one.
- one running a postgres db for Kong.
- one building and serving Kong dashboard on localhost:8080

Any change made into the `/src` folder will result in Kong Dashboard being automatically rebuilt on
the fly. All you have to do is refreshing the page in your browser to see the change.

#### Running tests

Please make sure tests are still passing before submitting a pull request. To run tests:
```bash
# If not already done, start docker compose
KONG_VERSION=0.9 docker-compose up kong-dashboard

# Run tests
npm test
```
