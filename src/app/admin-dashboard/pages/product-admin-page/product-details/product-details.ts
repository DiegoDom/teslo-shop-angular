import { Component, input, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabel } from '@admin-dashboard/components/form-error-label/form-error-label';
import { ProductImagesCarouselComponent } from '@products/components/product-images-carousel/product-images-carousel.component';
import { ProductsService } from '@products/services/products.service';
import { Product } from '@products/interfaces/product.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [ProductImagesCarouselComponent, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  product = input.required<Product>();
  formBuilder = inject(FormBuilder);
  productsService = inject(ProductsService);
  router = inject(Router);

  showSnackbar = signal(false);
  tempImages = signal<string[]>([]);
  imageFiles: FileList | undefined = undefined;
  carouselImages = computed(() => [...this.tempImages(), ...this.product().images]);

  productForm = this.formBuilder.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]],
    images: [[]],
    tags: [''],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    this.setFormValues(this.product());
  }

  setFormValues(formLike: Partial<Product>) {
    this.productForm.reset(this.product() as any);

    this.productForm.patchValue({ tags: formLike.tags?.join(',') });
  }

  onGenderChange(gender: string) {
    this.productForm.patchValue({ gender });
  }

  onSizeChange(size: string) {
    const sizes = this.productForm.get('sizes')?.value || [];
    if (sizes.includes(size)) {
      this.productForm.patchValue({ sizes: sizes.filter((s) => s !== size) });
    } else {
      this.productForm.patchValue({ sizes: [...sizes, size] });
    }
  }

  async onSubmit() {
    const isValid = this.productForm.valid;
    if (!isValid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const productLike: Partial<Product> = {
      ...(this.productForm.value as any),
      tags:
        this.productForm.value.tags
          ?.toLocaleLowerCase()
          .split(',')
          .map((tag) => tag.trim()) || [],
    };

    if (this.product().id === 'new') {
      const product = await firstValueFrom(
        this.productsService.createProduct(productLike, this.imageFiles),
      );

      this.router.navigate(['/admin/products/', product.id]);
      return;
    } else {
      await firstValueFrom(
        this.productsService.updateProduct(this.product().id, productLike, this.imageFiles),
      );
    }

    this.showSnackbar.set(true);
    setTimeout(() => {
      this.showSnackbar.set(false);
    }, 3000);
  }

  onDelete() {
    this.productsService.deleteProduct(this.product().id).subscribe({
      next: () => {
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        this.showSnackbar.set(true);
        setTimeout(() => {
          this.showSnackbar.set(false);
        }, 2000);
      },
    });
  }

  onImageFilesChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const fileList = target.files;
    this.tempImages.set([]);

    if (!fileList || fileList.length === 0) return;

    this.imageFiles = fileList;

    const imageUrls = Array.from(fileList ?? []).map((file) => URL.createObjectURL(file));

    this.tempImages.set(imageUrls);
  }
}
