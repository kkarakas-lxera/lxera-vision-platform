
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import FeatureCard from "./FeatureCard";

interface Feature {
  title: string;
  description?: string;
  icon?: string;
  [key: string]: unknown;
}

interface PlatformHighlightsCarouselProps {
  features: Feature[];
  cat: string;
}

const PlatformHighlightsCarousel = ({ features }: PlatformHighlightsCarouselProps) => (
  <Carousel opts={{ align: "start", slidesToScroll: 1 }}>
    <CarouselContent>
      {features.map((feature, index) => (
        <CarouselItem
          key={feature.title}
          className="basis-1/3 flex-grow-0"
        >
          <FeatureCard
            feature={feature}
            index={index}
            desktop
          />
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
);

export default PlatformHighlightsCarousel;
