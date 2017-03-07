FROM mhart/alpine-node:7.5.0

COPY . /data
WORKDIR /data

RUN npm install && npm run install

EXPOSE 8080

CMD npm run start
