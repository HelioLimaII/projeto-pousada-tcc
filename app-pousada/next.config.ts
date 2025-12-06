/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Modo estrito do React (bom para desenvolvimento)
  images: {
    // Domínios/Padrões remotos permitidos para otimização de imagem
    remotePatterns: [
      /*{
        // Permite imagens do seu backend FastAPI (fotos dos quartos)
        protocol: 'http', // Mude para 'https' se o seu backend usar HTTPS
        hostname: 'localhost',
        port: '8000', // Porta do seu backend
        pathname: '/static/images/**', // Permite qualquer imagem dentro desta pasta
      },*/
      {
        // **** ADICIONADO: Permite imagens do Cloudinary ****
        protocol: 'https', // Cloudinary usa HTTPS
        hostname: 'res.cloudinary.com', // << CONFIRME SE ESTE É O HOSTNAME DA SUA URL
        port: '', // Porta padrão (vazio)
        pathname: '/**', // Permite qualquer imagem da sua conta Cloudinary
        // Pode ser mais específico se quiser, ex: '/SEU_CLOUD_NAME/image/upload/**'
      },
      // Pode adicionar mais padrões para outros serviços de imagem aqui
    ],
  },
};

module.exports = nextConfig;

