import { Injectable }                  from '@angular/core';
import { HttpClient}                   from '@angular/common/http';
import { Observable }                  from 'rxjs';
import { environment }                 from 'src/environments/environment';
import { PAG_RettePagamenti_Sum }      from 'src/app/_models/PAG_Retta';
import { PAG_ScadenzeRettaPivot }      from 'src/app/_models/PAG_ScadenzeRettaPivot';
import { PAG_ScadenzaRetta }           from 'src/app/_models/PAG_ScadenzaRetta';



@Injectable({
  providedIn: 'root'
})

export class ScadenzeRetteService {

  constructor(private http: HttpClient) { }

  list(): Observable<PAG_ScadenzaRetta[]>{
    return this.http.get<PAG_ScadenzaRetta[]>(environment.apiBaseUrl+'PAG_ScadenzeRette');
    //http://213.215.231.4/swappX/api/PAG_Rette
  }

  listByAnnoPivot(annoID: number): Observable<PAG_ScadenzeRettaPivot[]>{
    return this.http.get<PAG_ScadenzeRettaPivot[]>(environment.apiBaseUrl+'PAG_ScadenzeRette/ListByAnnoPivot/'+annoID);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListByAnnoPivot/1
  }

  getByAlunnoAnnoMese(alunnoID: number, annoID: number, meseRetta: number): Observable<PAG_ScadenzaRetta>{
    return this.http.get<PAG_ScadenzaRetta>(environment.apiBaseUrl+'PAG_ScadenzeRette/GetByAlunnoAnnoMese/'+alunnoID+'/'+annoID+'/'+meseRetta);
    //http://213.215.231.4/swappX/api/PAG_Rette/GetByAlunnoAnnoMese/3/2/9
  }

  listRettePagamenti_Sum(annoID: any): Observable<PAG_RettePagamenti_Sum[]>{
    return this.http.get<PAG_RettePagamenti_Sum[]>(environment.apiBaseUrl+'PAG_Rette/ListRettePagamenti_Sum/'+annoID);
    //http://213.215.231.4/swappX/api/PAG_Rette/ListRettePagamenti_Sum/2
  }


  aggiornaQuotaTotale(rettaID: any): Observable<any>{
    let form = {};
    return this.http.put<PAG_ScadenzaRetta>(environment.apiBaseUrl+'PAG_ScadenzeRette/AggiornaQuotaTotale/'+rettaID, form);
    //http://213.215.231.4/swappX/api/PAG_ScadenzeRette/AggiornaQuotaTotale/5
  }

  get(scadenzaRettaID: any): Observable<PAG_ScadenzaRetta>{
    return this.http.get<PAG_ScadenzaRetta>(environment.apiBaseUrl+'PAG_ScadenzeRette/'+scadenzaRettaID);
    //http://213.215.231.4/swappX/api/PAG_Rette/5
  }

  put(obj: PAG_ScadenzaRetta): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + 'PAG_ScadenzeRette/' + obj.id , obj);    
  }

  post(obj: PAG_ScadenzaRetta): Observable <any>{
    obj.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'PAG_ScadenzeRette' , obj);  
  }

  delete(scadenzaRettaID: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_ScadenzeRette/' + scadenzaRettaID);    
  }
}
