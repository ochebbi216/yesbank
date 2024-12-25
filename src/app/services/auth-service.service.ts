import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../models/login';
import { Register } from '../models/register';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://bank-server-fbfac4guggamg9h4.northeurope-01.azurewebsites.net/api/auth'; // Adjust this URL based on your environment

  constructor(private http: HttpClient) {}

  register(user: Register): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  login(credentials: Login): Observable<any> {
    return this.http.post(`${this.baseUrl}/signin`, credentials);
  }

  logout(): void {
    this.deleteToken();
  }

  setToken(token: string, remember: boolean): void {
    if (remember) {
      localStorage.setItem('accessToken', token);
    } else {
      sessionStorage.setItem('accessToken', token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  deleteToken(): void {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
  }

  getPayload(): any {
    const token = this.getToken();
    if (token) {
      const payload = atob(token.split('.')[1]);
      return JSON.parse(payload);
    }
    return null;
  }

  loggedIn(): boolean {
    const payload = this.getPayload();
    if (payload) {
      return payload.exp > Date.now() / 1000; // Check if token is expired
    }
    return false;
  }
}
