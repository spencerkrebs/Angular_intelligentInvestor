import { Component, OnInit } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import {SearchService} from '../services/search.service';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  r = {
    results: []
   };
  constructor(private fb: FormBuilder, private _searchService: SearchService) { }

  searchForm = this.fb.group({
    ticker: ['']
  })
  ngOnInit() {
  }
  onSubmit(){
    console.log(this.searchForm.value);
    this._searchService.getTicker(this.searchForm.value)
    .subscribe(res=> {
      this.r.results = [res];
      console.dir(this.r)
      console.dir('array length'+this.r.results.length)
    });
  }
}
