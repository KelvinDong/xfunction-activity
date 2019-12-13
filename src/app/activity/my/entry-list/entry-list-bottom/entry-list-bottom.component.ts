import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'app-entry-list-bottom',
  templateUrl: './entry-list-bottom.component.html',
  styleUrls: ['./entry-list-bottom.component.css']
})
export class EntryListBottomComponent implements OnInit {

  operType = 0;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<EntryListBottomComponent>,
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
