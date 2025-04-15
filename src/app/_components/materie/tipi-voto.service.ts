import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MAT_TipoVoto } from 'src/app/_models/MAT_TipoVoto';


@Injectable({
  providedIn: 'root'
})

export class TipiVotoService {

  constructor(private http: HttpClient) { }

  list(): Observable<MAT_TipoVoto[]>{
    return this.http.get<MAT_TipoVoto[]>(environment.apiBaseUrl+'MAT_TipiVoto');
    //http://213.215.231.4/swappX/api/MAT_TipiVoto
  }
  
}
