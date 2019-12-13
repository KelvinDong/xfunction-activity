import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Ticket } from 'src/app/activity/my/create-activity/create-activity.component';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit {

  ticket: Ticket;
  questions: any;

  constructor(
    public dialogRef: MatDialogRef<EntryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // console.log(this.data);
    this.ticket = this.data.ticket;
    this.questions = JSON.parse(this.data.form.formJson);
  }

  entry(e: any) {
    this.dialogRef.close(e);
  }

}
