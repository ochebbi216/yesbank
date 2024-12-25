import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientComponent } from './components/client/client.component';
import { CompteComponent } from './components/compte/compte.component';
import { AuthGuardService } from './guards/auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  {path:'',component:LayoutComponent,children:[
    {
      path: '',
      component:DashboardComponent,
      pathMatch:'full',
      canActivate:[AuthGuardService]
    },
    {
      path: 'clients',
      component: ClientComponent,
      canActivate:[AuthGuardService]
    },
    {
      path: 'comptes',
      component: CompteComponent,
      canActivate:[AuthGuardService]
    }
  ]},  

    {
      path:'login',
      component:LoginComponent,
    },
    {
      path:'register',
      component:RegisterComponent,
    },
    {
      path: '**',
      component: NotFoundComponent, 
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
