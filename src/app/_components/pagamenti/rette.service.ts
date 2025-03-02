import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PAG_Retta, PAG_RettePagamenti_Sum } from 'src/app/_models/PAG_Retta';
import { PAG_RettaPivot } from 'src/app/_models/PAG_RettaPivot';



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

  listByAnnoPivoted(annoID: number): Observable<PAG_RettaPivot[]>{
    return this.http.get<PAG_RettaPivot[]>(environment.apiBaseUrl+'PAG_Rette/ListByAnnoPivot/'+annoID);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListByAnnoPivot/1
  }

  listByAlunnoAnno(alunnoID: number, annoID: number): Observable<PAG_Retta[]>{
    return this.http.get<PAG_Retta[]>(environment.apiBaseUrl+'PAG_Rette/ListByAlunnoAnno/'+alunnoID+"/"+annoID);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListByAlunnoAnno/3/1
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

  listRettePagamenti_Sum(annoID: any): Observable<PAG_RettePagamenti_Sum[]>{
    return this.http.get<PAG_RettePagamenti_Sum[]>(environment.apiBaseUrl+'PAG_Rette/ListRettePagamenti_Sum/'+annoID);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListRettePagamenti_Sum/2
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
