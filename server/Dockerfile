FROM node:lts-alpine
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN npx -p typescript tsc
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "./dist/src/index.js"]
