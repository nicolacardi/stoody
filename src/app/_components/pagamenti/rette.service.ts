import { Injectable }      from '@angular/core';
import { HttpClient }      from '@angular/common/http';
import { Observable }      from 'rxjs';
import { environment }     from 'src/environments/environment';
import { PAG_Retta }       from 'src/app/_models/PAG_Retta';




@Injectable({
  providedIn: 'root'
})

export class RetteService {

  constructor(private http: HttpClient) { }

  list(): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette');
    //http://213.215.231.4/swappX/api/PAG_Rette
  }

  listByAnno(annoID: number): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette/ListByAnno/'+annoID);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListByAnno/1
  }

  getByAlunnoAnno(alunnoID: number, annoID: number): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/GetByAlunnoAnno/'+alunnoID+"/"+annoID);
    //http://213.215.231.4/swappX/api/PAG_Rette/GetByAlunnoAnno/3/1
  }

  getByIscrizione(iscrizioneID: number): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/GetByIscrizione/'+iscrizioneID);
    //http://213.215.231.4/swappX/api/PAG_Rette/GetByIscrizione/1385
  }

  sumConcordateByIscrizione(iscrizioneID: number): Observable <any> {
    return this.http.get( environment.apiBaseUrl  + 'PAG_Rette/sumConcordateByIscrizione/'+iscrizioneID); 
    //http://213.215.231.4/swappX/api/PAG_Rette/sumConcordateByIscrizione/328
  }

  get(rettaID: any): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/'+rettaID);
    //http://213.215.231.4/swappX/api/PAG_Rette/5
  }

  getByAlunnoAnnoMese(alunnoID: number, annoID: number, meseRetta: number): Observable<PAG_Retta>{
    return this.http.get<PAG_Retta>(environment.apiBaseUrl+'PAG_Rette/GetByAlunnoAnnoMese/'+alunnoID+'/'+annoID+'/'+meseRetta);
    //http://213.215.231.4/swappX/api/PAG_Rette/GetByAlunnoAnnoMese/3/2/9
  }



  put(obj: PAG_Retta): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + 'PAG_Rette/' + obj.id , obj);    
  }

  post(obj: PAG_Retta): Observable <any>{
    obj.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'PAG_Rette' , obj);  
  }

  delete(rettaID: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_Rette/' + rettaID);    
  }
}
