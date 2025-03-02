import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { PER_Dirigente}                        from 'src/app/_models/PER_Dirigente';

@Injectable({
  providedIn: 'root'
})

export class DirigentiService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_Dirigente[]>{
    return this.http.get<PER_Dirigente[]>(environment.apiBaseUrl+'PER_Dirigenti');
    //http://213.215.231.4/swappX/api/PER_Dirigenti
  }

  get(id: any): Observable<PER_Dirigente>{
    return this.http.get<PER_Dirigente>(environment.apiBaseUrl+'PER_Dirigenti/'+id);
    //http://213.215.231.4/swappX/api/PER_Dirigenti/3
  }

  getByPersona(id: any): Observable<PER_Dirigente>{
    return this.http.get<PER_Dirigente>(environment.apiBaseUrl+'PER_Dirigenti/GetByPersona/'+id);
    //http://213.215.231.4/swappX/api/PER_Dirigenti/GetByPersona/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_Dirigenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_Dirigenti' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_Dirigenti/' + id);    
  }

  deleteByPersona (personaID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'PER_Dirigenti/DeleteByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/PER_Dirigenti/DeletByPersona/3
  }

}

