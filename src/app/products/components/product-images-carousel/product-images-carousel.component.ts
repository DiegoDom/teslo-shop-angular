import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnChanges,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'product-images-carousel',
  imports: [ProductImagePipe],
  templateUrl: './product-images-carousel.component.html',
  styles: `
    .swiper {
      height: 500px;
      width: 100%;
    }
  `,
})
export class ProductImagesCarouselComponent implements AfterViewInit, OnChanges {
  images = input.required<string[]>();
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');

  swiper: Swiper | undefined = undefined;

  ngAfterViewInit(): void {
    this.swiperInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'].firstChange) {
      return;
    }

    if (!this.swiper) return;

    this.swiper.destroy(true, true);

    const paginationEl: HTMLDivElement =
      this.swiperDiv().nativeElement?.querySelector('.swiper-pagination');
    if (paginationEl) {
      paginationEl.innerHTML = '';
    }

    this.swiper = undefined;

    setTimeout(() => {
      this.swiperInit();
    }, 100);
  }

  swiperInit() {
    const element = this.swiperDiv().nativeElement;
    if (!element) return;

    this.swiper = new Swiper(element, {
      direction: 'horizontal',
      loop: true,
      modules: [Navigation, Pagination],
      pagination: {
        el: '.swiper-pagination',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });
  }
}
