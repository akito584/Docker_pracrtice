FROM node:22-alpine
WORKDIR /app
COPY . /app
RUN npm install
COPY . /app
CMD ["npm", "run", "dev"]