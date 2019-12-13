import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SlideControlComponent } from 'src/app/define/slide-control/slide-control.component';

@Component({
  selector: 'app-detail-share-dialog',
  templateUrl: './detail-share-dialog.component.html',
  styleUrls: ['./detail-share-dialog.component.css']
})
export class DetailShareDialogComponent implements OnInit {

  @ViewChild(SlideControlComponent, {static: false})
  slide: SlideControlComponent;


  constructor(
    public dialogRef: MatDialogRef<DetailShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {

  }

  successMatch({ move, action }) {   // successMatch(myOb: {move: any, action: any}) {  ##解构## 对象,直接作为参数使用。
    this.dialogRef.close({move, action});
  }

  /*
  private reset() {
    this.move = undefined;
    this.action = [];
    this.slide.reset();
  }
  */

}
