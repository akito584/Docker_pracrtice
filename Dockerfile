FROM node:22-alpine
WORKDIR /app
COPY . /app
RUN apk add --no-cache openssl libc6-compat
RUN npm install

CMD ["npm", "run", "dev"]