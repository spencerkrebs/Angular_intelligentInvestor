import { Component, OnInit } from '@angular/core';
import { SearchService } from '../services/search.service';
import { HttpClient } from '@angular/common/http';
import { StockData } from '../stock-data';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {


  stockData : StockData[];

  constructor(public http: HttpClient, private searchService: SearchService) { }

  ngOnInit() {
   // this.getStockDataFromSearchService();
  }

  // getStockDataFromSearchService() {
  //   this.searchService.getTicker()
  //   .subscribe((data:any) => {
  //     console.log(data);
  //     this.stockData = data.data;
  //   });
  //}

}
