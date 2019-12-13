import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { forbiddenRegValidator } from 'src/app/ts/base-utils';
import { regDefine } from 'src/app/ts/base-config';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css']
})
export class TicketFormComponent implements OnInit {

  ticketForm: any;

  constructor(
    public dialogRef: MatDialogRef<TicketFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.ticketForm = new FormGroup({
      ticketId: new FormControl(this.data.para ? this.data.para.ticketId : 0), // 模板不展示
      ticketName: new FormControl(this.data.para ? this.data.para.ticketName : '',
        [Validators.required, forbiddenRegValidator(regDefine.ticketName)]),
      ticketSum: new FormControl(this.data.para ? this.data.para.ticketSum : 100,
        [Validators.required, forbiddenRegValidator(regDefine.ticketNumber)]),
      ticketStatus: new FormControl(this.data.para ? this.data.para.ticketStatus : false, [Validators.required]), // 模板不展示
      ticketRemark: new FormControl(this.data.para ? this.data.para.ticketRemark : '',
       [Validators.required, forbiddenRegValidator(regDefine.ticketRemark)])
    });
  }

  get ticketName(){
    return this.ticketForm.get('ticketName');
  }
  get ticketSum(){
    return this.ticketForm.get('ticketSum');
  }
  get ticketRemark(){
    return this.ticketForm.get('ticketRemark');
  }

  ticketSubmit() {
    this.dialogRef.close(this.ticketForm.value);
  }

}
