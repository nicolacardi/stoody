import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { CAL_TipoScadenza }                     from 'src/app/_models/CAL_TipoScadenza';
import { environment }                          from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipiScadenzaService {

  constructor(private http: HttpClient) { }

  list(): Observable<CAL_TipoScadenza[]>{
    return this.http.get<CAL_TipoScadenza[]>(environment.apiBaseUrl+'CAL_TipiScadenza');
    //http://213.215.231.4/swappX/api/CAL_TipiScadenza
  }


  get(tiposcadenzaID: any): Observable<CAL_TipoScadenza>{
    return this.http.get<CAL_TipoScadenza>(environment.apiBaseUrl+'CAL_TipiScadenza/'+tiposcadenzaID);
    //http://213.215.231.4/swappX/api/CAL_TipiScadenza/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_TipiScadenza/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    console.log ("formData", formData);
    return this.http.post( environment.apiBaseUrl  + 'CAL_TipiScadenza' , formData);  
  }

  delete(tiposcadenzaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_TipiScadenza/' + tiposcadenzaID);    
  }

  updateSeq(seqInitial: number, seqFinal: number): Observable <any>{
    //console.log(seqInitial, seqFinal);
    return this.http.put(environment.apiBaseUrl+'CAL_TipiScadenza/UpdateSeq/'+seqInitial+'/'+seqFinal, seqInitial);
    //http://213.215.231.4/swappX/api/CAL_TipiScadenza/UpdateSeq/1/2
  }

  renumberSeq() {
    const url = `${environment.apiBaseUrl}CAL_TipiScadenza/RenumberSeq`;
    return this.http.put(url, null);
  }


}
