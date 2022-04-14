FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
# For Development
# ENV ALLOWED_ORIGIN=http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:5501,http://localhost:5501

# For Production
ENV NODE_ENV='production'
ENV ALLOWED_ORIGIN=https://lulkafe.github.io/ChatApp

RUN chown -R node /usr/src/app
USER node
CMD ["node", "./dist/src/index.js"]
