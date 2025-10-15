import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '@products/services/products.service';
import { LoaderComponent } from '@shared/loader/loader.component';
import { ProductImagesCarouselComponent } from '@products/components/product-images-carousel/product-images-carousel.component';

@Component({
  selector: 'app-product-page',
  imports: [LoaderComponent, ProductImagesCarouselComponent],
  templateUrl: './product-page.component.html',
})
export class ProductPageComponent {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  productIdSlug: string = this.route.snapshot.params['idSlug'];

  productResource = rxResource({
    params: () => ({ idSlug: this.productIdSlug }),
    stream: ({ params }) => {
      return this.productsService.getProductByIdSlug(params.idSlug);
    },
  });
}
