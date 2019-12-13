import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ControlBase } from './control-base';

@Injectable()
export class ControlService {
  constructor() { }

  toFormGroup(questions: ControlBase<any>[] ) {
    const group: any = {};

    questions.forEach(question => {
      group[question.key] = question.required ? new FormControl(question.value || '', [Validators.required])
                                              : new FormControl(question.value || '');
    });
    return new FormGroup(group);
  }
}


/*
value?: T,            可选
key?: string,         必填
label?: string,       必填
required?: boolean,   可选
order?: number,       可选
controlType?: string  (
  ControlTextBox,  
  ControlTextMoreBox,
  ControlSelect,   options: {key: string, value: string}[] = []; 必填  multiple 可选
  ControlRadio,    options: {key: string, value: string}[] = [];
  ControlCheckBox  options: {key: string, value: string}[] = [];
  )


*/
