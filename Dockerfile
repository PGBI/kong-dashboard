FROM mhart/alpine-node:7.5.0

COPY . /app
WORKDIR /app

RUN npm install && npm run build && npm prune --production

EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]
