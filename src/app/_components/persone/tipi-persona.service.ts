import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

//classes
import { PER_TipoPersona } from 'src/app/_models/PER_Persone';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class TipiPersonaService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_TipoPersona[]>{
    return this.http.get<PER_TipoPersona[]>(environment.apiBaseUrl+'PER_TipiPersona');
    //http://213.215.231.4/swappX/api/PER_TipiPersona
  }

  listByLivello(livelloMax: number): Observable<PER_TipoPersona[]>{

    return this.http.get<PER_TipoPersona[]>(environment.apiBaseUrl+'PER_TipiPersona')
      .pipe (
        map(val=>val.filter(val=>(val.livello<=livelloMax)))
      );
    //http://213.215.231.4/swappX/api/PER_TipiPersona
  }

  get(tipoPersonaID: any): Observable<PER_TipoPersona>{
    return this.http.get<PER_TipoPersona>(environment.apiBaseUrl+'PER_TipiPersona/'+tipoPersonaID);
    //http://213.215.231.4/swappX/api/PER_TipiPersona/3
  }

  getByDescrizione(descrizione: string): Observable<PER_TipoPersona>{
    return this.http.get<PER_TipoPersona>(environment.apiBaseUrl+'PER_TipiPersona/GetByDescrizione/'+descrizione);
    //http://213.215.231.4/swappX/api/PER_TipiPersona/GetByDescrizione/Alunno
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_TipiPersona/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_TipiPersona' , formData);  
  }

  delete(tipoPersonaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_TipiPersona/' + tipoPersonaID);    
  }
}
