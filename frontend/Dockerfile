# Stage de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json* ./
COPY next.config.mjs ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:20-alpine AS runner

WORKDIR /app

# Definir para ambiente de produção
ENV NODE_ENV=production

# Copiar arquivos necessários do stage de build
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expor porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]