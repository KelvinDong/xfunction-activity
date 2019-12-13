import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';

@Component({
  selector: 'app-tickets-bottom',
  templateUrl: './tickets-bottom.component.html',
  styleUrls: ['./tickets-bottom.component.css']
})
export class TicketsBottomComponent implements OnInit {

  operType = 0;
  ngOnInit(

  ) {
  }


  constructor(
    private bottomSheetRef: MatBottomSheetRef<TicketsBottomComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {}

  openLink(type: number, event: MouseEvent): void {
    this.operType = type;
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
