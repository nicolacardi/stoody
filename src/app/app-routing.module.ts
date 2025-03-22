import { NgModule }                             from '@angular/core';
import { RouterModule, Routes }                 from '@angular/router';

import { AuthGuard }                            from './_user/auth/auth.guard';
import { LoginPageComponent }                   from './_user/login-page.component';
import { LoginComponent }                       from './_user/login/login.component';

import { ProfiloComponent }                     from './_user/profilo/profilo.component';
import { ChangePswComponent }                   from './_user/change-psw/change-psw.component';
import { ImpostazioniComponent }                from './_components/impostazioni/impostazioni.component';

import { HomeComponent }                        from './_components/home/home.component';

import { PersonePageComponent }                 from './_components/persone/persone-page/persone-page.component';

import { AlunniPageComponent }                  from './_components/alunni/alunni-page/alunni-page.component';
import { GenitoriPageComponent }                from './_components/genitori/genitori-page/genitori-page.component';
import { CoordinatoreDashboardComponent }       from './_components/coordinatore/coordinatore-dashboard/coordinatore-dashboard.component';
import { SociPageComponent }                    from './_components/soci/soci-page/soci-page.component';


import { RettePageComponent }                   from './_components/pagamenti/rette-page/rette-page.component';
import { PagamentiPageComponent }               from './_components/pagamenti/pagamenti-page/pagamenti-page.component';
import { ClassiPageComponent }                  from './_components/classi/classi-sezioni-anni-page/classi-sezioni-anni-page.component';
import { UsersPageComponent }                   from './_components/users/users-page/users-page.component';
import { IscrizioniPageComponent }              from './_components/iscrizioni/iscrizioni-page/iscrizioni-page.component';
import { DocentiDashboardComponent }            from './_components/docenti/docenti-dashboard/docenti-dashboard.component';
import { OrarioDocentePageComponent }           from './_components/lezioni/orario-docente-page/orario-docente-page.component';
import { ScadenzeCalendarioComponent }          from './_components/scadenze/scadenze-calendario/scadenze-calendario.component';
import { VerbaliPageComponent }                 from './_components/verbali/verbali-page/verbali-page.component';
import { OrarioPageComponent }                  from './_components/lezioni/orario-page/orario-page.component';
import { ProceduraIscrizioneComponent }         from './_components/procedura-iscrizione/procedura-iscrizione.component';
import { ChangePswExtComponent }                from './_user/change-psw-ext/change-psw-ext.component';
import { SegreteriaDashboardComponent }         from './_components/segreteria/segreteria-dashboard/segreteria-dashboard.component';
import { DocentiPageComponent } from './_components/docenti/docenti-page/docenti-page.component';

const routes: Routes = [

  { path: '', redirectTo: 'user/login', pathMatch: 'full' }, //questo indica che un route vuoto viene tradotto in user/login
  
  { path: 'change-psw-ext',                     component: ChangePswExtComponent }, //per il cambio password a partire da email

  {
      //  { path:'user' , redirectTo: 'user/login', pathMatch: 'full' },
    path: 'user',                               component: LoginPageComponent,
    children: [
      { path: 'login',                          component: LoginComponent },
    ]
  },


  { path:'home',                                component: HomeComponent, canActivate:[AuthGuard]  },

  { path: "calendario",                         component: ScadenzeCalendarioComponent, canActivate:[AuthGuard]},

  { path: "orario-page",                        component: OrarioPageComponent, canActivate:[AuthGuard]},

  
  { path: "persone",                            component: PersonePageComponent,canActivate:[AuthGuard] },

  { path: "alunni",                             component: AlunniPageComponent, canActivate:[AuthGuard]},

  { path: "genitori",                           component: GenitoriPageComponent, canActivate:[AuthGuard]},

  { path: "docenti",                            component: DocentiPageComponent, canActivate:[AuthGuard]},

  { path: "soci",                               component: SociPageComponent,canActivate:[AuthGuard] },

  { path: "iscrizioni",                         component: IscrizioniPageComponent, canActivate:[AuthGuard]},

  { path: "classi",                             component: ClassiPageComponent,canActivate:[AuthGuard] },

  { path: "segreteria-dashboard",               component: SegreteriaDashboardComponent,canActivate:[AuthGuard],data: { roles: ['ITManager', 'DocenteCoord', 'Docente' ] } },

  { path: "coordinatore-dashboard",             component: CoordinatoreDashboardComponent,canActivate:[AuthGuard],data: { roles: ['ITManager', 'DocenteCoord', 'Docente' ] } },

  { path: "calendario-docente",                 component: OrarioDocentePageComponent,canActivate:[AuthGuard],data: { roles: ['ITManager', 'DocenteCoord', 'Docente' ] } },

  { path: "docenti-dashboard",                  component: DocentiDashboardComponent,canActivate:[AuthGuard],data: { roles: ['ITManager', 'DocenteCoord', 'Docente' ] }  },

  { path: "pagamenti",                          component: PagamentiPageComponent,canActivate:[AuthGuard] , data: { roles: ['ITManager', 'NonDocente' ] }},

  { path: "rette",                              component: RettePageComponent,canActivate:[AuthGuard], data: { roles: ['ITManager', 'NonDocente' ] } },

  { path: "verbali",                            component: VerbaliPageComponent,canActivate:[AuthGuard] },

  { path: "users",                              component: UsersPageComponent, canActivate:[AuthGuard], data: { roles: ['ITManager', 'NonDocente' ] } }, 

  { path: "procedura-iscrizione",               component: ProceduraIscrizioneComponent, canActivate:[AuthGuard] },

  { path: "impostazioni",                       component: ImpostazioniComponent, canActivate:[AuthGuard],data: { roles: ['ITManager', 'NonDocente' ] }  },

  { path: "profilo",                            component: ProfiloComponent, canActivate:[AuthGuard] },

  { path: "change-psw",                         component: ChangePswComponent, canActivate:[AuthGuard] },


];

@NgModule({
  //imports: [RouterModule.forRoot(routes)],
  //imports: [RouterModule.forRoot(routes, { useHash: true })], 
  //NC 02/02 https://stackoverflow.com/questions/60527776/uncaught-in-promise-error-cannot-match-any-routes-angular8
  imports: [RouterModule.forRoot(routes, { useHash: false })], //NC 05/08/23 tolto useHash: true
 
  exports: [RouterModule]
})
export class AppRoutingModule { }
