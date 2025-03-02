import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { TST_VotoInterr }                       from 'src/app/_models/TST_VotiInterr';


@Injectable({
  providedIn: 'root'
})
export class VotiInterrService {

  constructor(private http: HttpClient) { }
  
  list(): Observable<TST_VotoInterr[]>{
    return this.http.get<TST_VotoInterr[]>(environment.apiBaseUrl+'TST_VotiInterr');
    //http://213.215.231.4/swappX/api/TST_VotiInterr
  }

  listByLezione(lezioneID: number): Observable<TST_VotoInterr[]>{
    return this.http.get<TST_VotoInterr[]>(environment.apiBaseUrl+'TST_VotiInterr/ListByLezione/'+lezioneID);
    //http://213.215.231.4/swappX/api/TST_VotiInterr/ListByLezione/975
  }

  listByClasseSezioneAnno(classeSezioneAnnoID: number): Observable<TST_VotoInterr[]>{
    return this.http.get<TST_VotoInterr[]>(environment.apiBaseUrl+'TST_VotiInterr/listByClasseSezioneAnno/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/TST_VotiInterr/listByClasseSezioneAnno/48
  }

  listByClasseSezioneAnnoAndDocente(classeSezioneAnnoID: number, docenteID: number): Observable<TST_VotoInterr[]>{
    return this.http.get<TST_VotoInterr[]>(environment.apiBaseUrl+'TST_VotiInterr/listByClasseSezioneAnnoAndDocente/'+classeSezioneAnnoID+'/'+docenteID);
    //http://213.215.231.4/swappX/api/TST_VotiInterr/listByClasseSezioneAnnoAndDocente/16/3
  }

  listByAlunno(alunnoID: number): Observable<TST_VotoInterr[]>{
    return this.http.get<TST_VotoInterr[]>(environment.apiBaseUrl+'TST_VotiInterr/ListByAlunno/'+alunnoID);
    //http://213.215.231.4/swappX/api/TST_VotiInterr/ListByAlunno/3
  }


  get(votoID: any): Observable<TST_VotoInterr>{
    return this.http.get<TST_VotoInterr>(environment.apiBaseUrl+'TST_VotiInterr/'+votoID);
    //http://213.215.231.4/swappX/api/TST_VotiInterr/3
  }
  
  post(voto: TST_VotoInterr): Observable <any>{
    return this.http.post( environment.apiBaseUrl  + 'TST_VotiInterr' , voto);  
  }
  
  put(voto: TST_VotoInterr): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'TST_VotiInterr/' + voto.id , voto);    
  }

  deleteByLezione(lezioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TST_VotiInterr/DeleteByLezione/' + lezioneID); 
  //http://213.215.231.4/swappX/api/TST_VotiInterr/DeleteByLezione/975

  }

  delete(votoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'TST_VotiInterr/' + votoID); 
  }
}
