import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { TST_VotoCompito }                      from 'src/app/_models/TST_VotiCompiti';


@Injectable({
  providedIn: 'root'
})
export class VotiCompitiService {

  constructor(private http: HttpClient) { }
  
  list(): Observable<TST_VotoCompito[]>{
    return this.http.get<TST_VotoCompito[]>(environment.apiBaseUrl+'TST_VotiCompiti');
    //http://213.215.231.4/swappX/api/TST_VotiCompiti
  }

  listByLezione(lezioneID: number): Observable<TST_VotoCompito[]>{
    return this.http.get<TST_VotoCompito[]>(environment.apiBaseUrl+'TST_VotiCompiti/ListByLezione/'+lezioneID);
    //http://213.215.231.4/swappX/api/TST_VotiCompiti/ListByLezione/975
  }

  listByAlunno(alunnoID: number): Observable<TST_VotoCompito[]>{
    return this.http.get<TST_VotoCompito[]>(environment.apiBaseUrl+'TST_VotiCompiti/ListByAlunno/'+alunnoID);
    //http://213.215.231.4/swappX/api/TST_VotiCompiti/ListByAlunno/3
  }


  get(votoID: any): Observable<TST_VotoCompito>{
    return this.http.get<TST_VotoCompito>(environment.apiBaseUrl+'TST_VotiCompiti/'+votoID);
    //http://213.215.231.4/swappX/api/TST_VotiCompiti/3
  }
  
  post(voto: TST_VotoCompito): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'TST_VotiCompiti' , voto);  
  }
  
  put(voto: TST_VotoCompito): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TST_VotiCompiti/' + voto.id , voto);    
  }

  deleteByLezione(lezioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TST_VotiCompiti/DeleteByLezione/' + lezioneID); 
  //http://213.215.231.4/swappX/api/TST_VotiCompiti/DeleteByLezione/975

  }

  delete(votoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TST_VotiCompiti/' + votoID); 
  }
}
