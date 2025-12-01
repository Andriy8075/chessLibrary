FROM node:20-alpine

WORKDIR /usr/src/app

# Lightweight dev tooling
RUN npm install -g nodemon

ENV NODE_ENV=development
ENV PORT=3000
ENV MOCK_EDITOR_PORT=3001

# Project files are provided at runtime via a bind mount volume.
# We just start both dev processes with nodemon.
CMD ["sh", "-c", "nodemon --config nodemon.server.json & nodemon --config nodemon.mockEditor.json"]


