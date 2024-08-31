FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli
COPY . .
COPY .env .env
RUN nest build
EXPOSE 3000
