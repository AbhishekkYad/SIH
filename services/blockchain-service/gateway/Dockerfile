FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

# Build TypeScript if necessary (or rely on a pre-build step)
RUN npm install typescript -g
RUN tsc

EXPOSE 7051

CMD [ "node", "dist/server.js" ]
