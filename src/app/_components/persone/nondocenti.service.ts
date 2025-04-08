import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { PER_NonDocente}                        from 'src/app/_models/PER_NonDocente';

@Injectable({
  providedIn: 'root'
})

export class NonDocentiService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_NonDocente[]>{
    return this.http.get<PER_NonDocente[]>(environment.apiBaseUrl+'PER_NonDocenti');
    //http://213.215.231.4/swappX/api/PER_NonDocenti
  }

  get(id: any): Observable<PER_NonDocente>{
    return this.http.get<PER_NonDocente>(environment.apiBaseUrl+'PER_NonDocenti/'+id);
    //http://213.215.231.4/swappX/api/PER_NonDocenti/3
  }

  getByPersona(id: any): Observable<PER_NonDocente>{
    return this.http.get<PER_NonDocente>(environment.apiBaseUrl+'PER_NonDocenti/GetByPersona/'+id);
    //http://213.215.231.4/swappX/api/PER_NonDocenti/GetByPersona/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_NonDocenti/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_NonDocenti' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_NonDocenti/' + id);    
  }

  // deleteByPersona (personaID: number) {
  //   return this.http.delete( environment.apiBaseUrl  + 'PER_NonDocenti/DeleteByPersona/'+personaID);
  //   //http://213.215.231.4/swappX/api/PER_NonDocenti/DeletByPersona/3
  // }

}

