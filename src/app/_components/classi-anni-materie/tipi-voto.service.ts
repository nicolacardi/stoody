import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CLS_TipoVoto } from 'src/app/_models/CLS_TipoVoto';


@Injectable({
  providedIn: 'root'
})

export class TipiVotoService {

  constructor(private http: HttpClient) { }

  list(): Observable<CLS_TipoVoto[]>{
    return this.http.get<CLS_TipoVoto[]>(environment.apiBaseUrl+'CLS_TipiVoto');
    //http://213.215.231.4/swappX/api/CLS_TipiVoto
  }
  
}
