import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable, map }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//classes
import { PER_TipoSocio }                        from 'src/app/_models/PER_Soci';

@Injectable({
  providedIn: 'root'
})
export class TipiSocioService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_TipoSocio[]>{
    return this.http.get<PER_TipoSocio[]>(environment.apiBaseUrl+'PER_TipiSocio');
    //http://213.215.231.4/swappX/api/PER_TipiSocio
  }

  get(tipoSocioID: any): Observable<PER_TipoSocio>{
    return this.http.get<PER_TipoSocio>(environment.apiBaseUrl+'PER_TipiSocio/'+tipoSocioID);
    //http://213.215.231.4/swappX/api/PER_TipiSocio/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_TipiSocio/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_TipiSocio' , formData);  
  }

  delete(tipoSocioID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_TipiSocio/' + tipoSocioID);    
  }
}
