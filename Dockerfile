FROM node

MAINTAINER Rémi Alvergnat <toilal.dev@gmail.com>

RUN useradd -ms /bin/bash kong-dashboard

USER kong-dashboard

COPY . /home/kong-dashboard
WORKDIR /home/kong-dashboard

RUN npm install

EXPOSE 8080

CMD npm start

