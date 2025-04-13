import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

import { CAL_Evento } from 'src/app/_models/CAL_Evento';


@Injectable({
  providedIn: 'root'
})
export class EventiService {

  constructor(private http: HttpClient) { }


  list(): Observable<CAL_Evento[]>{
    return this.http.get<CAL_Evento[]>(environment.apiBaseUrl+'CAL_Eventi'); 
    //http://213.215.231.4/swappX/api/CAL_Eventi
  }

  listByPersona(personaID: number): Observable<CAL_Evento[]>{
    return this.http.get<CAL_Evento[]>(environment.apiBaseUrl+'CAL_Eventi/ListByPersona/'+personaID); 
    //http://213.215.231.4/swappX/api/CAL_Eventi/ListBypersona/17
  }

  listByNota(notaID: number): Observable<CAL_Evento[]>{
    return this.http.get<CAL_Evento[]>(environment.apiBaseUrl+'CAL_Eventi/ListByNota/'+notaID); 
    //http://213.215.231.4/swappX/api/CAL_Eventi/ListByNota/80
  }

  get(eventoID: any): Observable<CAL_Evento>{
    return this.http.get<CAL_Evento>(environment.apiBaseUrl+'CAL_Eventi/'+eventoID);
    //http://213.215.231.4/swappX/api/CAL_Eventi/1
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_Eventi/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CAL_Eventi' , formData);  
  }

  delete(eventoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Eventi/' + eventoID);    
  }


  deleteByDate (dtStart: any, dtEnd: any) {
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Eventi/DeleteByDate?dtStart=' + dtStart + '&dtEnd=' + dtEnd);
  }



}
