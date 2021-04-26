import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StockData } from '../stock-data';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

 
  private _url: string =`http://localhost:3000/invest/`;
  constructor(private _http: HttpClient) { }
  
  getTicker(userTicker){
   return this._http.get<any>(this._url+`${userTicker.ticker}`)
      
  }
}
