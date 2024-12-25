
import { Component } from '@angular/core';
import { Register } from '../../models/register'; 
import { AuthService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  newUser: Register = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) { }

  register(): void {
    // Check for empty fields
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs manquants',
        text: 'Veuillez remplir tous les champs requis.',
      });
      return;
    }
  
    // Validate email format using a regular expression
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.newUser.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Format d\'email incorrect',
        text: 'Veuillez entrer une adresse email valide.',
      });
      return;
    }
  
    // Proceed with registration if validation passes
    this.authService.register(this.newUser).subscribe(
      response => {
        console.log('User registered successfully!', response);
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie',
          text: 'Votre compte a été créé avec succès.',
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/login']); // Redirect to the login page
      },
      error => {
        console.error('Error registering user', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors de l\'inscription',
          text: 'Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.',
        });
      }
    );
  }
  
}