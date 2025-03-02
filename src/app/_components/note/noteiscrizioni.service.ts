import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

import { DOC_NotaIscrizione }                   from 'src/app/_models/DOC_NotaIscrizione';


@Injectable({
  providedIn: 'root'
})
export class NoteIscrizioniService {

  constructor(private http: HttpClient) { }

  list(): Observable<DOC_NotaIscrizione[]>{
    return this.http.get<DOC_NotaIscrizione[]>(environment.apiBaseUrl+'DOC_NotaIscrizioni');
    //http://213.215.231.4/swappX/api/DOC_NotaIscrizioni
  }

  listByClasseSezioneAnno(classeSezioneAnnoID: number): Observable<DOC_NotaIscrizione[]>{
    return this.http.get<DOC_NotaIscrizione[]>(environment.apiBaseUrl+'DOC_NotaIscrizioni/listByClasseSezioneAnno/'+classeSezioneAnnoID);   
    //http://213.215.231.4/swappX/api/DOC_Note/ListByClasseSezioneAnno/listByClasseSezioneAnno/16 
  }

  get(notaID: any): Observable<DOC_NotaIscrizione>{
    return this.http.get<DOC_NotaIscrizione>(environment.apiBaseUrl+'DOC_NotaIscrizioni/'+notaID);
    //http://213.215.231.4/swappX/api/DOC_NoteIscrizioni/1
  }

  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + 'DOC_NotaIscrizioni/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'DOC_NotaIscrizioni' , formData);  
  }

  delete(notaIscrizioneID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'DOC_NotaIscrizioni/' + notaIscrizioneID);    
  }

  deleteByNota(notaID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'DOC_NotaIscrizioni/DeleteByNota/' + notaID);    
  }
}
