FROM node:20-alpine

WORKDIR /usr/src/app

# Lightweight dev tooling
RUN npm install -g nodemon

ENV NODE_ENV=development
ENV PORT=3000
ENV MOCK_EDITOR_PORT=3002

# Project files are provided at runtime via a bind mount volume.
# Install dependencies for mock board editor (React/Vite) if needed
# Then start all dev processes with nodemon.
CMD ["sh", "-c", "cd library/tests/helpers/mockBoardEditor && npm install && chmod +x start-vite.sh && cd /usr/src/app && sleep 2 && nodemon --config nodemon.server.json & nodemon --config nodemon.mockEditorApi.json & nodemon --config nodemon.mockEditor.json & wait"]


