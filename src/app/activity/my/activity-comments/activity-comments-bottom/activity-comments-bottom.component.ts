import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'app-activity-comments-bottom',
  templateUrl: './activity-comments-bottom.component.html',
  styleUrls: ['./activity-comments-bottom.component.css']
})
export class ActivityCommentsBottomComponent implements OnInit {

  operType = 0;
  constructor(
    private bottomSheetRef: MatBottomSheetRef<ActivityCommentsBottomComponent>,
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
