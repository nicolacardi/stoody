import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';


//il metodo che segue presume tutti i component standalone: true e NON usa app.module
// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));  

//in questo modo, in alternativa, si usa l'approccio vecchio, nel quale si utilizzava app.module
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));