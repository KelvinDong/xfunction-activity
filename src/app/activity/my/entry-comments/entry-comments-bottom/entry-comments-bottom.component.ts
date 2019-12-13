import { Component, OnInit, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'app-entry-comments-bottom',
  templateUrl: './entry-comments-bottom.component.html',
  styleUrls: ['./entry-comments-bottom.component.css']
})
export class EntryCommentsBottomComponent implements OnInit {

  operType = 0;
  constructor(
    private bottomSheetRef: MatBottomSheetRef<EntryCommentsBottomComponent>,
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