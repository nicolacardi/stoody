import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

import { PAG_TipoPagamento } from 'src/app/_models/PAG_TipoPagamento';

@Injectable({
  providedIn: 'root'
})

export class TipiPagamentoService {

  constructor(private http: HttpClient) { }

  list(): Observable<PAG_TipoPagamento[]>{
    return this.http.get<PAG_TipoPagamento[]>(environment.apiBaseUrl+'PAG_TipiPagamento');
        //http://213.215.231.4/swappX/api/PAG_TipiPagamento
  }

//*************** METODO NON USATO ******************/  
  // filterList(searchstring: string): Observable<PAG_TipoPagamento[]>{

  //   return this.http.get<PAG_TipoPagamento[]>(environment.apiBaseUrl+'PAG_TipiPagamento')
  //     .pipe (
  //       map(val=> val.filter(val=>val.descrizione.toLowerCase().includes(searchstring))),
  //     );
  // }
}
