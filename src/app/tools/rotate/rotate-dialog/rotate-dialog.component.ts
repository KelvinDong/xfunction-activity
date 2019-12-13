import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { forbiddenRegValidator } from 'src/app/ts/base-utils';
import { regDefine } from 'src/app/ts/base-config';

@Component({
  selector: 'app-rotate-dialog',
  templateUrl: './rotate-dialog.component.html',
  styleUrls: ['./rotate-dialog.component.css']
})
export class RotateDialogComponent implements OnInit {

  settingFrom;
  constructor(
    public dialogRef: MatDialogRef<RotateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit() {

    if (!this.data.award) {
      const nameArray: FormArray = this.fb.array([]);
      const weightArray: FormArray = this.fb.array([]);
      for (let i = 0; i < 12; i++) {
        nameArray.push(this.fb.control('', [forbiddenRegValidator(regDefine.rotateSettingName)]));
        weightArray.push(this.fb.control('1', [forbiddenRegValidator(regDefine.rotateSettingWeight)]));
      }
      this.settingFrom = new FormGroup({
        names: nameArray, weights: weightArray
      });
      this.settingFrom.patchValue(this.data.setting);
    }

  }

  get names() {
    return this.settingFrom.get('names').controls;
  }

  get weights() {
    return this.settingFrom.get('weights').controls;
  }

  // this.dialogRef.close(addResutl);

  formSubmit() {
    // console.log(this.settingFrom.value);
    const obj: string[] = this.settingFrom.value.names;
    let validSum = 0;
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] !== '') {
        validSum++;
      }
    }
    if (validSum < 2) {
      this.snackBar.open('请确认至少有2个选项', '', { duration: 3000 });
      return;
    }
    this.dialogRef.close(this.settingFrom.value);

  }

}
