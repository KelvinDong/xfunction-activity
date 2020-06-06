import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ControlBase } from '../../../define/dynamic-form/control-base';

import { DynamicFormComponent } from '../../../define/dynamic-form/dynamic-form/dynamic-form.component';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { AbstractJsEmitterVisitor } from '@angular/compiler/src/output/abstract_js_emitter';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

import { isNumber, getAndSavePath, forbiddenRegValidator, canvasDataURL } from '../../../ts/base-utils';
import { UserService, Result } from 'src/app/user/user.service';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { baseConfig, urlDefine, regDefine } from 'src/app/ts/base-config';
import { MatSnackBar, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDialog } from '@angular/material';

import * as _moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { environment } from 'src/environments/environment';
import { QuestionnaireAddElementComponent } from './questionnaire-add-element/questionnaire-add-element.component';
import { CommandService } from 'src/app/user/command.service';
// tslint:disable-next-line:no-duplicate-imports
// import {default as _rollupMoment} from 'moment';
// const moment = _rollupMoment || _moment;
const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-question-naire-create',
  templateUrl: './question-naire-create.component.html',
  styleUrls: ['./question-naire-create.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class QuestionNaireCreateComponent implements OnInit {

  @ViewChild(DynamicFormComponent, { static: false })
  df: DynamicFormComponent;

  urlDefine = urlDefine;
  // 初始化默认的几个表单
  questions: ControlBase<any>[] =
    [
      new ControlBase({
        controlType: 'textbox',
        value: '',
        key: 'name_1',
        label: '姓名',
        order: 1,
        required: true
      }),
      new ControlBase({
        controlType: 'radio',
        value: '',
        key: 'sex_2',
        label: '性别',
        order: 2,
        options: [
          { key: 1, value: '男' },
          { key: 2, value: '女' }
        ],
        required: true
      })
    ];

  showProgress = false;
  title = '调查问卷编辑';
  headPicSrc = 'assets/images/default-picture.png';

  questionnaireForm: any;

  questionnaireType = 1;

  questionnaire;

  headWidth;


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private commandService: CommandService,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    public snackBar: MatSnackBar,
    private el: ElementRef,
  ) { }

  ngOnInit() {

    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    if (window.location.href.includes('ginfo-create')) {
      this.questionnaireType = 2;
      this.title = '信息表单编辑';
      this.questions = [
        new ControlBase({
          controlType: 'textbox',
          value: '',
          key: 'name_1',
          label: '姓名',
          order: 1,
          required: true
        }),
        new ControlBase({
          controlType: 'select',
          value: '',
          key: 'sex_2',
          label: '性别',
          order: 2,
          options: [
            { key: 1, value: '男' },
            { key: 2, value: '女' }
          ],
          required: true
        })
      ];
    }

    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };



    this.questionnaireForm = new FormGroup({
      // questionnaireId: new FormControl(''),
      questionnaireName: new FormControl('', [Validators.required, forbiddenRegValidator(regDefine.questionnaireName)]),
      // questionnaireJson: new FormControl('', []), // 提交时程序填写进来
      questionnairePre: new FormControl('', [forbiddenRegValidator(regDefine.questionnaireIntro)]),
      questionnaireAfter: new FormControl('', [forbiddenRegValidator(regDefine.questionnaireIntro)]),
      questionnaireExpiredDate: new FormControl(moment(), [Validators.required]),
      questionnaireExpiredTime: new FormControl('12:00', [Validators.required]),
      questionnairePic: new FormControl('', [Validators.required]),
    });

    // 从服务器获得已经保存的模板，提供编辑
    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        setTimeout(() => {
          this.getForm(data);
          this.commandService.setMessage(3);
        }, 100);
        
      }
    });

  }

  getForm(data){
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.questionnaireFormGet, { questionnaireId: parseInt(data.id, 10) }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // bug hack
          this.questions = JSON.parse(result.data.questionnaireJson);
          this.df.rebuild(this.questions);

          this.questionnaire = result.data;
          const datetime = this.questionnaire.questionnaireExpired.split(' ');
          this.questionnaire.questionnaireExpiredDate = moment(datetime[0]);
          this.questionnaire.questionnaireExpiredTime = datetime[1];
          this.headPicSrc = environment.media + '/activity/images' + this.questionnaire.questionnairePic;

          this.questionnaireForm.patchValue(this.questionnaire);
        } else {
          this.userService.showError1(result, () => {this.getForm(data); });
          }
        this.showProgress = false;
        this.commandService.setMessage(0);
        },
        (error: Result) => {
          this.userService.showError1(error, () => {this.getForm(data); });
          this.showProgress = false;
          this.commandService.setMessage(0);
        }
      );
  }

  resetWindow() {
    this.headWidth = window.innerWidth;
    if (this.headWidth > 800) {
      this.headWidth = (800) * 8 / 16 + 'px';
    } else {
      this.headWidth = (this.headWidth) * 8 / 16 + 'px';
    }
  }

  get questionnaireName() {
    return this.questionnaireForm.get('questionnaireName');
  }
  get questionnairePre() {
    return this.questionnaireForm.get('questionnairePre');
  }
  get questionnaireAfter() {
    return this.questionnaireForm.get('questionnaireAfter');
  }
  get questionnaireExpiredDate() {
    return this.questionnaireForm.get('questionnaireExpiredDate');
  }
  get questionnaireExpiredTime() {
    return this.questionnaireForm.get('questionnaireExpiredTime');
  }

  headPic(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const that = this;
    reader.onload = function (e) {
      // console.log(this.result);
      canvasDataURL(this.result, 800, that, that.upHeadPic);  // 处理完后调用uploadPic()
    };
    reader.readAsDataURL(file);
  }

  upHeadPic(bob: Blob, that) {
    const postData: FormData = new FormData();
    postData.append('file', bob, 'up.jpg');
    if (that.questionnaire) {
      postData.append('questionnaireId', that.questionnaire.questionnaireId);
    }
    that.showProgress = true;
    that.commandService.setMessage(1);
    that.userService.postFormData(baseConfig.questionnaireUpPic, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          that.questionnaireForm.patchValue({ questionnairePic: result.data.questionnairePic });
          that.headPicSrc = environment.media + '/activity/images' + result.data.questionnairePic;
          console.log(that.headPicSrc);
        } else {
          that.userService.showError1(result, () => {that.upHeadPic(bob, that); });
        }
        that.showProgress = false;
        that.commandService.setMessage(0);
      },
      (error: Result) => {
        that.userService.showError1(error, () => {that.upHeadPic(bob, that); });
        that.showProgress = false;
        that.commandService.setMessage(0);
      }
    );
  }


  onQuestionnaireFormSubmit() {

    if (this.questions.length === 0) {
      this.snackBar.open('表单内容不能为空', '', { duration: 3000 });
      return;
    }
    this.showProgress = true;
    this.commandService.setMessage(1);
    // 送服务器
    const resultValue = this.questionnaireForm.value;
    resultValue.questionnaireJson = JSON.stringify(this.questions);
    if (this.questionnaire) {
      resultValue.questionnaireId = this.questionnaire.questionnaireId;
    }
    resultValue.questionnarieExpired = resultValue.questionnaireExpiredDate.format('YYYY-MM-DD')
      + ' ' + resultValue.questionnaireExpiredTime;
    resultValue.questionnaireType = this.questionnaireType;
    this.userService.post(baseConfig.questionnaireFormAddUpdate, resultValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // this.router.navigateByUrl(urlDefine.listQuestionnaireFrom);
          this.snackBar.open('提交成功', '', { duration: 3000 });
        } else {
          this.userService.showError1(result, () => {this.onQuestionnaireFormSubmit(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.onQuestionnaireFormSubmit(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );

  }

  showAddDialog() {

    const dialogRef = this.dialog.open(QuestionnaireAddElementComponent, {
      // height: '400px',
      // width: '90%',
      data: { questionnaireType: this.questionnaireType}
    });
    dialogRef.afterClosed().subscribe((addResutl: any) => {

      if (addResutl) {
        addResutl.order = this.questions.length + 1;

        // 获取现有表单项 序号值，因为存在删除的问题，所以最大的序号+1给新的表单项
        let targetKey = 0;
        for (let i = 0; i < this.questions.length; i++) {  // 数组
          this.questions[i].order = i + 1; // order 并没有用起来。
          const key = this.questions[i].key;
          if (isNumber(key)) {
            if (Number(key) > targetKey) {
              targetKey = Number(key);
            }
          } else {
            const tmp = key.split('_');
            if (Number(tmp[1]) > targetKey) {
              targetKey = Number(tmp[1]);
            }
          }
        }

        const key1 = addResutl.key;
        if (isNumber(key1)) {
          addResutl.key = (targetKey + 1).toString();
        } else {
          const tmp = key1.split('_');
          addResutl.key = tmp[0] + '_' + (targetKey + 1).toString();
        }

        console.log(addResutl);

        this.questions.push(new ControlBase(addResutl));
        this.df.ngOnInit(); // 预览表单重新加载
      }

    });
  }


}
