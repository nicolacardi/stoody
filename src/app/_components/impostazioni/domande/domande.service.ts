//#region ----- IMPORTS ------------------------

import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//components

//services

//classes
import { _UT_Domanda }                         from '../../../_models/_UT_Domanda';

//#endregion

@Injectable({
  providedIn: 'root'
})
export class DomandeService {

  constructor(private http: HttpClient) { }

  list(): Observable<_UT_Domanda[]>{
    return this.http.get<_UT_Domanda[]>(environment.apiBaseUrl+'_UT_Domande');
    //http://213.215.231.4/swappX/api/_UT_Domande
  }

  listByContestoEIscrizioneConRisposta(contesto: string, iscrizioneID: number): Observable<_UT_Domanda[]>{
    return this.http.get<_UT_Domanda[]>(environment.apiBaseUrl+'_UT_Domande/ListByContestoEIscrizioneConRisposta/'+contesto+'/'+iscrizioneID);
    //http://213.215.231.4/swappX/api/_UT_Domande/ListByContestoEIscrizioneConRisposta/DatiEconomici/328
  }

  get(domandaID: number): Observable<_UT_Domanda>{
    return this.http.get<_UT_Domanda>(environment.apiBaseUrl+'_UT_Domande/'+domandaID);
    //http://213.215.231.4/swappX/api/_UT_Domande/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + '_UT_Domande/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + '_UT_Domande' , formData);  
  }

  delete(materiaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + '_UT_Domande/' + materiaID);    
  }

  updateSeq(seqInitial: number, seqFinal: number): Observable <any>{
    //console.log(seqInitial, seqFinal);
    return this.http.put(environment.apiBaseUrl+'_UT_Domande/UpdateSeq/'+seqInitial+'/'+seqFinal, seqInitial);
    //http://213.215.231.4/swappX/api/_UT_Domande/UpdateSeq/1/2
  }

  renumberSeq() {
    const url = `${environment.apiBaseUrl}_UT_Domande/RenumberSeq`;
    return this.http.put(url, null);
  }

}
