FROM mhart/alpine-node:7.5.0

COPY . /app
WORKDIR /app

RUN npm install --unsafe-perm

EXPOSE 8080

CMD npm run start
