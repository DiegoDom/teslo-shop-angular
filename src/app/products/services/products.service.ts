import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Gender, Product, ProductResponse } from '@products/interfaces/product.interface';
import { environment } from 'src/environments/environment';
import { User } from '@auth/interfaces/user.interface';

const baseURL = environment.baseUrl;

interface productsResponseParams {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Unisex,
  tags: [],
  images: [],
  user: {} as User,
};

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
      .pipe(tap((resp) => this.productsCache.set(key, resp)));
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    if (this.singleProductsCache.has(idSlug)) {
      return of(this.singleProductsCache.get(idSlug)!);
    }
    return this.http
      .get<Product>(`${baseURL}/products/${idSlug}`)
      .pipe(tap((product) => this.singleProductsCache.set(idSlug, product)));
  }

  getProductById(id: string): Observable<Product> {
    if (id === 'new') {
      return of(emptyProduct);
    }

    if (this.singleProductsCache.has(id)) {
      return of(this.singleProductsCache.get(id)!);
    }
    return this.http
      .get<Product>(`${baseURL}/products/${id}`)
      .pipe(tap((product) => this.singleProductsCache.set(id, product)));
  }

  updateProduct(id: string, product: Partial<Product>, images?: FileList): Observable<Product> {
    const currentProductImages = product.images ?? [];

    return this.uploadProductImages(images).pipe(
      map((images) => ({
        ...product,
        images: [...currentProductImages, ...images],
      })),
      switchMap((product) => this.http.patch<Product>(`${baseURL}/products/${id}`, product)),
      tap((product) => this.updateProductsCache(product)),
    );
  }

  updateProductsCache(product: Product) {
    const id = product.id;
    this.singleProductsCache.set(id, product);

    this.productsCache.forEach((productResponse) => {
      productResponse.products = productResponse.products.map((currentProduct) =>
        currentProduct.id === id ? product : currentProduct,
      );
    });
  }

  removeProductsCache(id: string) {
    this.singleProductsCache.delete(id);

    this.productsCache.forEach((productResponse) => {
      productResponse.products = productResponse.products.filter(
        (currentProduct) => currentProduct.id !== id,
      );
    });
  }

  createProduct(product: Partial<Product>, images?: FileList): Observable<Product> {
    return this.uploadProductImages(images).pipe(
      switchMap((images) => this.http.post<Product>(`${baseURL}/products`, { ...product, images })),
      tap((product) => this.updateProductsCache(product)),
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http
      .delete<void>(`${baseURL}/products/${id}`)
      .pipe(tap(() => this.removeProductsCache(id)));
  }

  uploadProductImages(images?: FileList): Observable<string[]> {
    if (!images) {
      return of([]);
    }

    const uploadObservables = Array.from(images).map((image) => this.uploadImage(image));

    return forkJoin(uploadObservables).pipe(tap((images) => console.log(images)));
  }

  uploadImage(image?: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', image!);

    return this.http
      .post<{ fileName: string }>(`${baseURL}/files/product`, formData)
      .pipe(map((resp) => resp.fileName));
  }
}
