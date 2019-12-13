import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from 'src/environments/environment';
import { urlDefine } from 'src/app/ts/base-config';

@Component({
  selector: 'app-entry-list-dialog',
  templateUrl: './entry-list-dialog.component.html',
  styleUrls: ['./entry-list-dialog.component.css']
})
export class EntryListDialogComponent implements OnInit {

  webUrl = environment.web;
  urlDefine = urlDefine;


  constructor(
    public dialogRef: MatDialogRef<EntryListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
