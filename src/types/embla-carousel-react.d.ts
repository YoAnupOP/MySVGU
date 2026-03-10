declare module "embla-carousel-react" {
  type EmblaApi = {
    canScrollPrev(): boolean;
    canScrollNext(): boolean;
    scrollPrev(): void;
    scrollNext(): void;
    on(event: string, callback: (api: EmblaApi) => void): void;
    off(event: string, callback: (api: EmblaApi) => void): void;
  };

  type EmblaOptions = {
    axis?: "x" | "y";
    [key: string]: unknown;
  };

  type EmblaPlugin = unknown;
  type EmblaViewportRef = (element: HTMLElement | null) => void;
  export type UseEmblaCarouselType = [EmblaViewportRef, EmblaApi | undefined];

  export default function useEmblaCarousel(
    options?: EmblaOptions,
    plugins?: EmblaPlugin,
  ): UseEmblaCarouselType;
}
