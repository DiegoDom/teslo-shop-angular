import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { AuthService } from '@auth/services/auth.service';

interface RegisterForm {
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, ReactiveFormsModule, LoaderComponent],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  authService = inject(AuthService);
  router = inject(Router);

  hasError = signal(false);
  isPosting = signal(false);

  registerForm = new FormGroup<RegisterForm>({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password, fullName } = this.registerForm.value;

    console.log({ email, password, fullName });

    this.authService.register(email!, password!, fullName!).subscribe((isAuthenticated) => {
      console.log(isAuthenticated);
      if (isAuthenticated) {
        this.router.navigateByUrl('/');
        this.registerForm.reset();
        return;
      }

      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
    });
  }
}
