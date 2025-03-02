//#region ----- IMPORTS ------------------------

import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//components

//services

//models
import { CLS_IscrizioneRisposta } from 'src/app/_models/CLS_IscrizioneRisposta';


//#endregion
@Injectable({
  providedIn: 'root'
})
export class IscrizioneRisposteService {

  constructor(private http: HttpClient) { }

  list(): Observable<CLS_IscrizioneRisposta[]>{
    return this.http.get<CLS_IscrizioneRisposta[]>(environment.apiBaseUrl+'CLS_IscrizioneRisposte');
    //http://213.215.231.4/swappX/api/CLS_IscrizioneRisposte
  }


  listByIscrizione(iscrizioneID: number): Observable<CLS_IscrizioneRisposta[]>{
    return this.http.get<CLS_IscrizioneRisposta[]>(environment.apiBaseUrl+'CLS_IscrizioneRisposte/ListByIscrizione/'+iscrizioneID);   
    //http://213.215.231.4/swappX/api/CLS_IscrizioneRisposte/ListByIscrizione/328
  }

  listByIscrizioneAndContesto(iscrizioneID: number, contesto: string): Observable<CLS_IscrizioneRisposta[]>{
    return this.http.get<CLS_IscrizioneRisposta[]>(environment.apiBaseUrl+'CLS_IscrizioneRisposte/ListByIscrizioneAndContesto/'+iscrizioneID+'/'+contesto);   
    //http://213.215.231.4/swappX/api/CLS_IscrizioneRisposte/ListByIscrizioneAndContesto/306/DatiEconomici
  }

  get(iscrizioneRispostaID: any): Observable<CLS_IscrizioneRisposta>{
    return this.http.get<CLS_IscrizioneRisposta>(environment.apiBaseUrl+'CLS_IscrizioneRisposte/'+iscrizioneRispostaID);
    //http://213.215.231.4/swappX/api/CLS_IscrizioneRisposte/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_IscrizioneRisposte/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_IscrizioneRisposte' , formData);  
  }

  deleteByIscrizioneAndTipo (iscrizioneID: number, tipo: string) {
    return this.http.delete( environment.apiBaseUrl  + 'CLS_IscrizioneRisposte/DeleteByIscrizioneAndTipo/'+iscrizioneID+'/'+tipo);
    //http://213.215.231.4/swappX/api/CLS_IscrizioneRisposte/DeleteByIscrizioneAndTipo/4/Consensi
  }

  deleteByIscrizioneAndContesto (iscrizioneID: number, contesto: string) {
    return this.http.delete( environment.apiBaseUrl  + 'CLS_IscrizioneRisposte/DeleteByIscrizioneAndContesto/'+iscrizioneID+'/'+contesto);
    //http://213.215.231.4/swappX/api/CLS_IscrizioneRisposte/DeleteByIscrizioneAndContesto/4/Consensi
  }

  delete(iscrizioneRispostaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_IscrizioneRisposte/' + iscrizioneRispostaID);    
  }

}
