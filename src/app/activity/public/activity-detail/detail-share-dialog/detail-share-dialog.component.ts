import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-detail-share-dialog',
  templateUrl: './detail-share-dialog.component.html',
  styleUrls: ['./detail-share-dialog.component.css']
})
export class DetailShareDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DetailShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
