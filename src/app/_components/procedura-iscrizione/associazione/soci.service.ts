//#region ----- IMPORTS ------------------------

import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//components

//services

//models
import { PER_Socio } from 'src/app/_models/PER_Soci';

//#endregion

@Injectable({
  providedIn: 'root'
})
export class SociService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_Socio[]>{
    return this.http.get<PER_Socio[]>(environment.apiBaseUrl+'PER_Soci');
    //http://213.215.231.4/swappX/api/PER_Soci
  }

  get(socioID: any): Observable<PER_Socio>{
    return this.http.get<PER_Socio>(environment.apiBaseUrl+'PER_Soci/'+socioID);
    //http://213.215.231.4/swappX/api/PER_Soci/3
  }

  getByPersona(personaID: any): Observable<PER_Socio>{
    return this.http.get<PER_Socio>(environment.apiBaseUrl+'PER_Soci/GetByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/PER_Soci/GetByPersona/44
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_Soci/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_Soci' , formData);  
  }

  delete(socioID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_Soci/' + socioID);    
  }

}
