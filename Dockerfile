FROM node:${NODE_VERSION:-20}
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE ${NODE_PORT:-3000}
CMD ["npm", "run", "dev"]
