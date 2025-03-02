import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

import { CAL_Scadenza } from 'src/app/_models/CAL_Scadenza';


@Injectable({
  providedIn: 'root'
})
export class ScadenzeService {

  constructor(private http: HttpClient) { }


  list(): Observable<CAL_Scadenza[]>{
    return this.http.get<CAL_Scadenza[]>(environment.apiBaseUrl+'CAL_Scadenze'); 
    //http://213.215.231.4/swappX/api/CAL_Scadenze
  }

  listByPersona(personaID: number): Observable<CAL_Scadenza[]>{
    return this.http.get<CAL_Scadenza[]>(environment.apiBaseUrl+'CAL_Scadenze/ListByPersona/'+personaID); 
    //http://213.215.231.4/swappX/api/CAL_Scadenze/ListBypersona/17
  }

  listByNota(notaID: number): Observable<CAL_Scadenza[]>{
    return this.http.get<CAL_Scadenza[]>(environment.apiBaseUrl+'CAL_Scadenze/ListByNota/'+notaID); 
    //http://213.215.231.4/swappX/api/CAL_Scadenze/ListByNota/80
  }

  get(scadenzaID: any): Observable<CAL_Scadenza>{
    return this.http.get<CAL_Scadenza>(environment.apiBaseUrl+'CAL_Scadenze/'+scadenzaID);
    //http://213.215.231.4/swappX/api/CAL_Scadenze/1
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_Scadenze/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CAL_Scadenze' , formData);  
  }

  delete(scadenzaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Scadenze/' + scadenzaID);    
  }


  deleteByDate (dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Scadenze/DeleteByDate?dtStart=' + dtStart + '&dtEnd=' + dtEnd);
  }



}
