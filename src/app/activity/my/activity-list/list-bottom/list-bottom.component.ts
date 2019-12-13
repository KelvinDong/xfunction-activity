import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'app-list-bottom',
  templateUrl: './list-bottom.component.html',
  styleUrls: ['./list-bottom.component.css']
})
export class ListBottomComponent implements OnInit {

  operType = 0;
  
  constructor(
    private bottomSheetRef: MatBottomSheetRef<ListBottomComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  openLink(type: number, event: MouseEvent): void {
    this.operType = type;
    this.bottomSheetRef.dismiss();
    event.preventDefault(); 
  }

}
