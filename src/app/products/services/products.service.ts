import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
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

  private productsCache = new Map<string, ProductResponse>();
  private singleProductsCache = new Map<string, Product>();

  getProducts(params: productsResponseParams): Observable<ProductResponse> {
    const { gender = '', limit = 9, offset = 0 } = params;

    const key = `${limit}-${offset}-${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http
      .get<ProductResponse>(`${baseURL}/products`, {
        params: {
          gender,
          limit,
          offset,
        },
      })
      .pipe(
        tap((resp) => console.log(resp)),
        tap((resp) => this.productsCache.set(key, resp))
      );
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    if (this.singleProductsCache.has(idSlug)) {
      return of(this.singleProductsCache.get(idSlug)!);
    }
    return this.http.get<Product>(`${baseURL}/products/${idSlug}`).pipe(
      tap((product) => console.log(product)),
      tap((product) => this.singleProductsCache.set(idSlug, product))
    );
  }
}
