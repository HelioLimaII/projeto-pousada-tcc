// Em: src/components/ui/QuartoImageCarousel.tsx

'use client'; // <-- Isto marca-o como um Componente de Cliente

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Define as props que este componente vai receber do servidor
interface Props {
  fotos: string[];
  titulo: string;
}

export default function QuartoImageCarousel({ fotos, titulo }: Props) {
  // Usa um placeholder se o array de fotos estiver vazio
  const imageList = fotos.length > 0 ? fotos : ["/placeholder-5t9d5.png"];

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {imageList.map((fotoUrl, index) => (
          <CarouselItem key={index}>
            <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={fotoUrl}
                alt={`Foto ${index + 1} do ${titulo}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
                // ESTA é a função interativa que causou o erro.
                // Agora está segura dentro de um 'use client'.
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-5t9d5.png'; }}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2" />
      <CarouselNext className="absolute right-2" />
    </Carousel>
  );
}