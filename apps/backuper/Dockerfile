FROM node:22-slim AS runtime

# install pg_dump
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*


WORKDIR /app
COPY . /app

RUN ls -la /app
RUN npm install

ENV NODE_ENV=production

CMD ["npm", "start"]