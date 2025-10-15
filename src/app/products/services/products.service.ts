import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductResponse } from '@products/interfaces/product.interface';
import { environment } from 'src/environments/environment';

const baseURL = environment.baseUrl;

interface productsResponseParams {
  limit?: number;
  offset?: number;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  getProducts(params: productsResponseParams): Observable<ProductResponse> {
    const { gender = '', limit = 9, offset = 0 } = params;

    return this.http.get<ProductResponse>(`${baseURL}/products`, {
      params: {
        gender,
        limit,
        offset,
      },
    });
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    return this.http.get<Product>(`${baseURL}/products/${idSlug}`);
  }
}
