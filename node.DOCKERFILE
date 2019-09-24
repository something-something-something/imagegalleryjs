FROM node:latest
# RUN chown node /home/node/app
USER node
EXPOSE 3000
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app

