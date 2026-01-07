FROM node:22-slim AS runtime

WORKDIR /app
COPY . /app

RUN ls -la /app
RUN npm install

ENV NODE_ENV=production

CMD ["npm", "start"]