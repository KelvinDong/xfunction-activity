import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { forbiddenRegValidator } from 'src/app/ts/base-utils';
import { regDefine } from 'src/app/ts/base-config';
 
@Component({
  selector: 'app-comment-add-form',
  templateUrl: './comment-add-form.component.html',
  styleUrls: ['./comment-add-form.component.css']
})
export class CommentAddFormComponent implements OnInit {


  commentContent = new FormControl('', [
    Validators.required, forbiddenRegValidator(regDefine.comment)]);

  constructor(
    public dialogRef: MatDialogRef<CommentAddFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }


  submit() {
    this.dialogRef.close(this.commentContent.value);
  }

}
