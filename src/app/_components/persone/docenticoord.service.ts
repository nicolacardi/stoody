import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { PER_DocenteCoord}                        from 'src/app/_models/PER_DocenteCoord';

@Injectable({
  providedIn: 'root'
})

export class DocentiCoordService {

  constructor(private http: HttpClient) { }

  list(): Observable<PER_DocenteCoord[]>{
    return this.http.get<PER_DocenteCoord[]>(environment.apiBaseUrl+'PER_DocentiCoord');
    //http://213.215.231.4/swappX/api/PER_DocentiCoord
  }

  get(id: any): Observable<PER_DocenteCoord>{
    return this.http.get<PER_DocenteCoord>(environment.apiBaseUrl+'PER_DocentiCoord/'+id);
    //http://213.215.231.4/swappX/api/PER_DocentiCoord/3
  }

  getByPersona(id: any): Observable<PER_DocenteCoord>{
    return this.http.get<PER_DocenteCoord>(environment.apiBaseUrl+'PER_DocentiCoord/GetByPersona/'+id);
    //http://213.215.231.4/swappX/api/PER_DocentiCoord/GetByPersona/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'PER_DocentiCoord/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'PER_DocentiCoord' , formData);  
  }

  delete(id: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'PER_NonDocenti/' + id);    
  }

  deleteByDocente (docenteID: number) {
    return this.http.delete( environment.apiBaseUrl  + 'PER_DocentiCoord/DeleteByDocente/'+docenteID);
    //http://213.215.231.4/swappX/api/PER_DocentiCoord/DeleteByDocente/3
  }

}

