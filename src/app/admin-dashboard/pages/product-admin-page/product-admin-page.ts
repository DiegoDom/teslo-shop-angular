import { Component, effect, inject } from '@angular/core';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductsService } from '@products/services/products.service';
import { ProductDetails } from './product-details/product-details';

@Component({
  selector: 'app-product-admin-page',
  imports: [LoaderComponent, ProductDetails],
  templateUrl: './product-admin-page.html',
})
export class ProductAdminPage {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);

  productId = toSignal(this.activatedRoute.params.pipe(map((params) => params['id'])));

  productResource = rxResource({
    params: () => ({
      id: this.productId(),
    }),
    stream: ({ params }) => this.productsService.getProductById(params.id),
  });

  redirectEffect = effect(() => {
    if (this.productResource.error()) {
      this.router.navigate(['/admin/products']);
    }
  });
}
