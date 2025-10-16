import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap, map, catchError, of } from 'rxjs';

import { AuthResponse } from '@auth/interfaces/auth-response.interface';
import { User } from '@auth/interfaces/user.interface';
import { environment } from 'src/environments/environment';
import { rxResource } from '@angular/core/rxjs-interop';

const baseURL = environment.baseUrl;
type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private http = inject(HttpClient);

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  checkStatusResource = rxResource({
    stream: () => this.checkStatus(),
  });

  user = computed(() => this._user());
  token = computed(() => this._token());

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseURL}/auth/login`, { email, password }).pipe(
      map((resp) => this.handleSuccessAuth(resp)),
      catchError((error: any) => this.handleErrorAuth(error))
    );
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false);
    }

    return this.http
      .get<AuthResponse>(`${baseURL}/auth/check-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((resp) => this.handleSuccessAuth(resp)),
        catchError((error: any) => this.handleErrorAuth(error))
      );
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');
    localStorage.removeItem('token');
  }

  private handleSuccessAuth({ token, user }: AuthResponse): boolean {
    this._user.set(user);
    this._authStatus.set('authenticated');
    this._token.set(token);

    localStorage.setItem('token', token);

    return true;
  }

  private handleErrorAuth(error: any) {
    this.logout();
    return of(false);
  }
}
