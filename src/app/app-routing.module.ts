import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { UsersComponent } from './users/users.component';
import { TenantsComponent } from './tenants/tenants.component';
import { RolesComponent } from 'app/roles/roles.component';
import { ChangePasswordComponent } from './users/change-password/change-password.component';
import { ElibraryComponent } from './elibrary/elibrary.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';

// import { HomeComponent } from './home/home.component';
// import { AboutComponent } from './about/about.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                children: [
                    //Unused path
                    // { path: 'home', component: HomeComponent,  canActivate: [AppRouteGuard] },
                    // { path: 'about', component: AboutComponent, canActivate: [AppRouteGuard] },

                    //Used path
                    { path: 'users', component: UsersComponent, data: { permission: 'Pages.Users' }, canActivate: [AppRouteGuard] },
                    { path: 'roles', component: RolesComponent, data: { permission: 'Pages.Roles' }, canActivate: [AppRouteGuard] },
                    { path: 'tenants', component: TenantsComponent, data: { permission: 'Pages.Tenants' }, canActivate: [AppRouteGuard] },
                    { path: 'update-password', component: ChangePasswordComponent, canActivate: [AppRouteGuard] },

                    //Our new path
                    // { path: 'library', component: ElibraryComponent, data: { permission: 'Pages.Library' }, canActivate: [AppRouteGuard] }
                    { path: 'library', component: ElibraryComponent, canActivate: [AppRouteGuard] },
                    { path: 'audit-logs', component: AuditLogsComponent, canActivate: [AppRouteGuard] }
                ]
            }
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
