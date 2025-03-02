import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';


import { ALU_TipoGenitore }                     from 'src/app/_models/ALU_Tipogenitore';
import { environment }                          from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipiGenitoreService {

  constructor(private http: HttpClient) { }

  list(): Observable<ALU_TipoGenitore[]>{
    return this.http.get<ALU_TipoGenitore[]>(environment.apiBaseUrl+'ALU_TipiGenitore');
    //http://213.215.231.4/swappX/api/ALU_TipiGenitore
  }

  get(tipoGenitoreID: any): Observable<ALU_TipoGenitore>{
    return this.http.get<ALU_TipoGenitore>(environment.apiBaseUrl+'ALU_TipiGenitore/'+tipoGenitoreID);
    //http://213.215.231.4/swappX/api/ALU_TipiGenitore/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'ALU_TipiGenitore/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'ALU_TipiGenitore' , formData);  
  }

  delete(tipoGenitoreID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'ALU_TipiGenitore/' + tipoGenitoreID);    
  }
}
