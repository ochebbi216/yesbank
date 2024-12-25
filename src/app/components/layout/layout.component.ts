import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  constructor(private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
}