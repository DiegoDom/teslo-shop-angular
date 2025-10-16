import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { AuthService } from '@auth/services/auth.service';

interface LoginForm {
  email: FormControl<string>;
  password?: FormControl<string>;
}

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, ReactiveFormsModule, LoaderComponent],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  authService = inject(AuthService);
  router = inject(Router);

  hasError = signal(false);
  isPosting = signal(false);

  loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    console.log({ email, password });

    this.authService.login(email!, password!).subscribe((isAuthenticated) => {
      console.log(isAuthenticated);
      if (isAuthenticated) {
        this.router.navigateByUrl('/');
        this.loginForm.reset();
        return;
      }

      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
    });
  }
}
