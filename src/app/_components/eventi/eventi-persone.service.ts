import { HttpClient }                                 from '@angular/common/http';
import { Injectable }                                 from '@angular/core';
import { Observable }                                 from 'rxjs';
import { CAL_EventoPersone }                        from 'src/app/_models/CAL_Evento';
import { PER_Persona }                                from 'src/app/_models/PER_Persone';
import { environment }                                from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventiPersoneService {

  constructor(private http: HttpClient) { }

  deleteByEvento(eventoID: any): Observable<any>{
    return this.http.delete(environment.apiBaseUrl+'CAL_EventiPersone/DeleteByEvento/'+eventoID);   
    //http://213.215.231.4/swappX/api/CAL_EventiPersone/DeleteByEvento/1
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'CAL_EventiPersone' , formData);  
  }


  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_EventiPersone/' + formData.id , formData);    
  }

  listByEventoOLD(eventoID: number): Observable<PER_Persona[]>{
    return this.http.get<PER_Persona[]>(environment.apiBaseUrl+'CAL_EventiPersone/listByEvento/'+eventoID)
    //http://213.215.231.4/swappX/api/CAL_EventiPersone/listByEvento/4
  }

  listByEvento(eventoID: number): Observable<CAL_EventoPersone[]>{
    return this.http.get<CAL_EventoPersone[]>(environment.apiBaseUrl+'CAL_EventiPersone/listByEvento/'+eventoID)
    //http://213.215.231.4/swappX/api/CAL_EventiPersone/listByEvento/4
  }
  
  listByPersona(personaID: number): Observable<CAL_EventoPersone[]>{
    return this.http.get<CAL_EventoPersone[]>(environment.apiBaseUrl+'CAL_EventiPersone/ListByPersona/'+personaID); 
    //http://213.215.231.4/swappX/api/CAL_EventiPersone/ListByPersona/3
  }
}