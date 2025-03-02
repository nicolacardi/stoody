import { HttpClient }                                 from '@angular/common/http';
import { Injectable }                                 from '@angular/core';
import { Observable }                                 from 'rxjs';
import { CAL_ScadenzaPersone }                        from 'src/app/_models/CAL_Scadenza';
import { PER_Persona }                                from 'src/app/_models/PER_Persone';
import { environment }                                from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScadenzePersoneService {

  constructor(private http: HttpClient) { }

  deleteByScadenza(scadenzaID: any): Observable<any>{
    return this.http.delete(environment.apiBaseUrl+'CAL_ScadenzePersone/DeleteByScadenza/'+scadenzaID);   
    //http://213.215.231.4/swappX/api/CAL_ScadenzePersone/DeleteByScadenza/1
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'CAL_ScadenzePersone' , formData);  
  }


  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_ScadenzePersone/' + formData.id , formData);    
  }

  listByScadenzaOLD(scadenzaID: number): Observable<PER_Persona[]>{
    return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'CAL_ScadenzePersone/listByScadenza/'+scadenzaID)
    //http://213.215.231.4/swappX/api/CAL_ScadenzePersone/listByScadenza/4
  }

  listByScadenza(scadenzaID: number): Observable<CAL_ScadenzaPersone[]>{
    return this.http.get<CAL_ScadenzaPersone[]>(environment.apiBaseUrl+'CAL_ScadenzePersone/listByScadenza/'+scadenzaID)
    //http://213.215.231.4/swappX/api/CAL_ScadenzePersone/listByScadenza/4
  }
  
  listByPersona(personaID: number): Observable<CAL_ScadenzaPersone[]>{
    return this.http.get<CAL_ScadenzaPersone[]>(environment.apiBaseUrl+'CAL_ScadenzePersone/ListByPersona/'+personaID); 
    //http://213.215.231.4/swappX/api/CAL_ScadenzePersone/ListByPersona/3
  }
}