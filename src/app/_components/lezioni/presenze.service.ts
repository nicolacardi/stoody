import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { CAL_Presenza }                         from 'src/app/_models/CAL_Presenza';


@Injectable({
  providedIn: 'root'
})
export class PresenzeService {

  constructor(private http: HttpClient) { }
  
  list(): Observable<CAL_Presenza[]>{
    return this.http.get<CAL_Presenza[]>(environment.apiBaseUrl+'CAL_Presenze');
    //http://213.215.231.4/swappX/api/CAL_Presenze
  }

  listByLezione(lezioneID: number): Observable<CAL_Presenza[]>{
    return this.http.get<CAL_Presenza[]>(environment.apiBaseUrl+'CAL_Presenze/ListByLezione/'+lezioneID);
    //http://213.215.231.4/swappX/api/CAL_Presenze/ListByLezione/975
  }

  listByAlunno(alunnoID: number): Observable<CAL_Presenza[]>{
    return this.http.get<CAL_Presenza[]>(environment.apiBaseUrl+'CAL_Presenze/ListByAlunno/'+alunnoID);
    //http://213.215.231.4/swappX/api/CAL_Presenze/ListByAlunno/3
  }


  get(presenzaID: any): Observable<CAL_Presenza>{
    return this.http.get<CAL_Presenza>(environment.apiBaseUrl+'CAL_Presenze/'+presenzaID);
    //http://213.215.231.4/swappX/api/CAL_Presenze/3
  }
  
  post(presenza: CAL_Presenza): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'CAL_Presenze' , presenza);  
  }
  
  put(presenza: CAL_Presenza): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_Presenze/' + presenza.id , presenza);    
  }

  delete(presenzaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_Presenze/' + presenzaID); 
  }
      
}
