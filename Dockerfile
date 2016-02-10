FROM mhart/alpine-node
MAINTAINER Rémi Alvergnat <toilal.dev@gmail.com>

COPY . /data
WORKDIR /data

# bower requires this configuration parameter to allow bower install using root.
RUN echo '{ "allow_root": true }'>.bowerrc

# node-sass doesn't support Alpine, so we need the build toolchain.
RUN apk --update add ca-certificates git python build-base &&\
    npm install && npm run install &&\
    apk del ca-certificates git python build-base &&\
    rm -rf /var/cache/apk/*

EXPOSE 8080

CMD npm run start

