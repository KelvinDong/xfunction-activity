import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ControlBase } from '../control-base';
import { ControlService } from '../control.service';
import { isNumber, isEmpty } from '../../../ts/base-utils';
import { lsDefine } from 'src/app/ts/base-config';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
  providers: [ControlService]
})
export class DynamicFormComponent implements OnInit {

  @Input() questions: ControlBase<any>[] = [];
  @Input() editTag = true;   // 用作表单编辑时，需要更多的编辑功能
  @Output() formSubmit: EventEmitter<any> = new EventEmitter();
  form: FormGroup;
  payLoad = '';

  constructor(
    private controlService: ControlService
  ) { }

  ngOnInit() {
    this.form = this.controlService.toFormGroup(this.questions);

    const userInfo: string = window.localStorage.getItem(lsDefine.userInfo);

    if (isEmpty(userInfo) || this.editTag) {  // 使用用户基本信息 预填信息
    } else {
      const userJson = JSON.parse(userInfo);
      const formValue = {};
      for (let i = 0; i < this.questions.length; i++) {  // 数组
        const key = this.questions[i].key;
        if (isNumber(key)) {
        } else {
          const tmp = key.split('_');
          Object.keys(userJson).forEach((item) => {
            if (item === tmp[0]) {
              formValue[key] = userJson[item];
            }
          });
        }
      } // for
      // console.log(this.questions);
      // console.log(formValue);
      this.form.patchValue(formValue);
    }

  }

  // bug fix
  rebuild(t: any) {
    this.form = this.controlService.toFormGroup(t);
  }


  onSubmit() {

    if (this.editTag) {
      alert(JSON.stringify(this.form.value));
    } else {
      // console.log(this.form.value);
      this.formSubmit.emit(JSON.stringify(this.form.value));
    }

  }

  removeControl(item: any) {
    const index = this.questions.indexOf(item);
    this.questions.splice(index, 1);

    for (let i = 0; i < this.questions.length; i++) {  // 数组
      this.questions[i].order = i + 1;
    }

  }

  moveControlUp(item: any) {
    const index = this.questions.indexOf(item);
    if (index > 0) {
      this.questions[index] = this.questions.splice(index - 1, 1, this.questions[index])[0];
    }
    for (let i = 0; i < this.questions.length; i++) {  // 数组
      this.questions[i].order = i + 1;
    }

  }
  moveControlDown(item: any) {
    const index = this.questions.indexOf(item);
    if (index < this.questions.length - 1) {
      this.questions[index] = this.questions.splice(index + 1, 1, this.questions[index])[0];
    }
    for (let i = 0; i < this.questions.length; i++) {  // 数组
      this.questions[i].order = i + 1;
    }

  }


}
