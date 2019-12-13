import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { forbiddenRegValidator } from 'src/app/ts/base-utils';
import { regDefine } from 'src/app/ts/base-config';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-activity-comments-reply',
  templateUrl: './activity-comments-reply.component.html',
  styleUrls: ['./activity-comments-reply.component.css']
})
export class ActivityCommentsReplyComponent implements OnInit {

  
  commentReply = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.comment)]);

  constructor(
    public dialogRef: MatDialogRef<ActivityCommentsReplyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }


  submit() {
    this.dialogRef.close(this.commentReply.value);
  }
}