import { Routes } from '@angular/router';

// Component imports
import { HomeComponent } from './home/home.component';
import { StoreComponent } from './store/store.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './auth/dashboard/dashboard.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPwComponent } from './auth/forgot-pw/forgot-pw.component';
import { MembersComponent } from './auth/members/members.component';

//Authguard
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'store', component: StoreComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'password-reset', component: ForgotPwComponent },

    // protected
    { path: 'members', component: MembersComponent, canActivate: [authGuard]},


    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
