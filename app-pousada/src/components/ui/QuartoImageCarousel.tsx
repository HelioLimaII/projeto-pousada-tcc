'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Props {
  fotos: string[];
  titulo: string;
}

// Sub-componente para gerenciar o erro de cada imagem individualmente
function CarouselImageItem({ src, alt, priority }: { src: string, alt: string, priority: boolean }) {
  const PLACEHOLDER = "https://placehold.co/800x600/e2e8f0/1e293b?text=Sem+Foto";
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority={priority}
        onError={() => setImgSrc(PLACEHOLDER)} // Troca segura de estado
      />
    </div>
  );
}

export default function QuartoImageCarousel({ fotos, titulo }: Props) {
  // Placeholder inicial se não houver fotos na lista
  const PLACEHOLDER_LIST = ["https://placehold.co/800x600/e2e8f0/1e293b?text=Sem+Foto"];
  const imageList = (fotos && fotos.length > 0) ? fotos : PLACEHOLDER_LIST;

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {imageList.map((fotoUrl, index) => (
          <CarouselItem key={index}>
            <CarouselImageItem 
              src={fotoUrl} 
              alt={`Foto ${index + 1} - ${titulo}`} 
              priority={index === 0} 
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Botões de navegação só aparecem se houver mais de 1 foto */}
      {imageList.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 bg-white/80 hover:bg-white text-gray-800" />
          <CarouselNext className="absolute right-2 bg-white/80 hover:bg-white text-gray-800" />
        </>
      )}
    </Carousel>
  );
}