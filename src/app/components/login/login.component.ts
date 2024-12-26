
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Login } from 'src/app/models/login';
import { AuthService } from 'src/app/services/auth-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials: Login = {  
    username: '',
    password: '',
    remember: false  
  };
  isLoading: boolean = false; 

  url: any;

  constructor(private authService: AuthService, private router: Router, private actRouter: ActivatedRoute) {
    this.url = this.actRouter.snapshot.queryParams['returnUrl'] || ''
  }
  ngOnInit(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(['']);
    }
  }

  login(): void {
    this.isLoading = true; 
    this.authService.login(this.credentials).subscribe(
      (data) => {
        this.isLoading = false;
        console.log('Login successful');
        this.authService.setToken(data.accessToken, !!this.credentials.remember);

        if (this.credentials.remember) {
          localStorage.setItem('rememberMe', this.credentials.remember.toString());
        } else {
          localStorage.removeItem('rememberMe');
        }

        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie',
          text: 'Vous êtes maintenant connecté.',
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate([this.url]);
      },
      (error) => {
        this.isLoading = false; 
        console.error('Login failed:', error);
        let errorMessage = 'Une erreur est survenue lors de la connexion.';
        if (error.status === 401) {
          errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else if (error.status === 404) {
          errorMessage = 'Nom d\'utilisateur non trouvé.';
        }
        Swal.fire({
          icon: 'error',
          title: 'Échec de la connexion',
          text: errorMessage,
          timer: 3000,
          showConfirmButton: false
        });
      }
    );
  }
  
  
}