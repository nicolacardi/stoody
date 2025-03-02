import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { PER_ITManager}                        from 'src/app/_models/PER_ITManager';

@Injectable({
  providedIn: 'root'
})

export class ITManagersService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_ITManager[]>{
    return this.http.get<PER_ITManager[]>(environment.apiBaseUrl+'PER_ITManagers');
    //http://213.215.231.4/swappX/api/PER_ITManagers
  }

  get(id: any): Observable<PER_ITManager>{
    return this.http.get<PER_ITManager>(environment.apiBaseUrl+'PER_ITManagers/'+id);
    //http://213.215.231.4/swappX/api/PER_ITManagers/3
  }

  getByPersona(id: any): Observable<PER_ITManager>{
    return this.http.get<PER_ITManager>(environment.apiBaseUrl+'PER_ITManagers/GetByPersona/'+id);
    //http://213.215.231.4/swappX/api/PER_ITManagers/GetByPersona/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_ITManagers/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_ITManagers' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_ITManagers/' + id);    
  }

  deleteByPersona (personaID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'PER_ITManagers/DeleteByPersona/'+personaID);
    //http://213.215.231.4/swappX/api/PER_ITManagers/DeletByPersona/3
  }

}

