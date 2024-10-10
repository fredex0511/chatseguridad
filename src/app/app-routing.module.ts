import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { SigninComponent } from './components/signin/signin.component';

// Define las rutas
const routes: Routes = [
    {
        path: 'chat',
        component: ChatComponent
    },
    {
        path: 'login',
        component: SigninComponent
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    }
];

// Importa el RouterModule y configura las rutas
@NgModule({
    imports: [RouterModule.forRoot(routes)], // Usa forRoot para configurar las rutas principales
    exports: [RouterModule]                   // Exporta el RouterModule para que esté disponible en otros módulos
})
export class AppRoutingModule { }