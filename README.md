# 🏨 Projeto Pousada Zekas (TCC)

Este é o repositório do projeto de TCC para um sistema completo de gerenciamento de pousada, desenvolvido com um back-end em FastAPI e um front-end em Next.js.

## 📋 Sobre o Projeto

A aplicação permite que os clientes visualizem os quartos e entrem em contato para reservas, enquanto oferece uma área administrativa segura para o gerente da pousada gerenciar a ocupação dos quartos, clientes e reservas.

---

## ✨ Funcionalidades

### Área Pública (Front-end)
- Homepage com quartos em destaque.
- Galeria completa de quartos com detalhes.
- Página de detalhes para cada quarto.
- Formulário de contato com integração para WhatsApp.

### Área Administrativa (Front-end + Back-end)
- Sistema de login seguro com autenticação via Token JWT.
- Dashboard para gerenciamento de status dos quartos.
- CRUD completo para Quartos, Clientes e Reservas.
- Validação de regras de negócio (ex: prevenção de reservas conflitantes).

---

## 🛠️ Tecnologias Utilizadas

* **Back-end:**
    * Python 3.12
    * FastAPI
    * MongoDB com Pymongo
    * Uvicorn & Gunicorn
* **Front-end:**
    * Next.js 14 (App Router)
    * React 18
    * TypeScript
    * Tailwind CSS & shadcn/ui
* **Banco de Dados:**
    * MongoDB Atlas (Cloud)
* **Deployment:**
    * Back-end: Render
    * Front-end: Vercel

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
* Python 3.12+
* Node.js 18+
* Uma instância do MongoDB (local ou no Atlas)

### Back-end (`api-pousada`)
```bash
# 1. Navegue até a pasta do back-end
cd api-pousada

# 2. Crie e ative o ambiente virtual
python3.12 -m venv venv
source venv/bin/activate

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Crie um arquivo .env e adicione sua MONGO_URL

# 5. Rode o servidor
uvicorn api:app --reload

```
### Font-end (`app-pousada`)
```bash
# 1. Navegue até a pasta do front-end
cd app-pousada

# 2. Instale as dependências
npm install

# 3. Crie um arquivo .env.local com NEXT_PUBLIC_API_URL="http://localhost:8000"

# 4. Rode o servidor de desenvolvimento
npm run dev
