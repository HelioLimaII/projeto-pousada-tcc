FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar o código
COPY . .

# Aceitar a URL da API no momento do build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Fazer o build de produção do Next.js
RUN npm run build

# Estágio final (imagem mais leve só para rodar)
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copiar apenas o necessário do build anterior
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000

# Ligar o servidor Next.js standalone
CMD ["node", "server.js"]