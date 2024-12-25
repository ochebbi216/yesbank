import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'); 

    // Exclude login and register URLs
    if (token && !req.url.includes('/api/auth/signin') && !req.url.includes('/api/auth/signup')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // For login and register requests, proceed without modifying
    return next.handle(req);
  }
}
