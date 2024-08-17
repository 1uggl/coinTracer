# Wähle ein Basis-Image mit Node.js
FROM node:14

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install --production

# Kopiere den Rest des Codes
COPY . .

# Exponiere den Port, den dein Backend verwendet
EXPOSE 3000

# Starte den Backend-Server
CMD ["node", "server.js"]

