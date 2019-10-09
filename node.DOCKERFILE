FROM node:latest
# RUN chown node /home/node/app
USER node
EXPOSE 3000
RUN mkdir -p /home/node/app/
WORKDIR /home/node/app
COPY ./ /home/node/app

