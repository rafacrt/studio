# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (melhora cache)
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Gera a build
RUN npm run build

# Etapa de produção
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copia os arquivos necessários para produção
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/.env ./.env

# Porta padrão do Next.js
EXPOSE 3000

# Comando de inicialização
CMD ["npx", "next", "start"]
