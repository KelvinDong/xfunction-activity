import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatSnackBar, MatSelectChange } from '@angular/material';

import { forbiddenRegValidator, convertDateFromString, getAndSavePath, canvasDataURL } from '../../../ts/base-utils';
import { regDefine, baseConfig, urlDefine } from '../../../ts/base-config';
import { MatHorizontalStepper } from '@angular/material/stepper';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatBottomSheet, MatDialog, TransitionCheckState } from '@angular/material';
import { TicketsBottomComponent } from './tickets-bottom/tickets-bottom.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { UserService, Result } from 'src/app/user/user.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Params } from '@angular/router';
import { Region } from 'src/app/ts/region';


import Quill from 'quill';
import imageResize from 'quill-image-resize-module';
import { Toolbar } from '../../../define/quill-resize/resize-toolbar';
import { Resize } from '../../../define/quill-resize/resize-resize';
Quill.register('modules/imageResize', imageResize);

const fonts = ['SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif'];
const Font = Quill.import('formats/font');
Font.whitelist = fonts; // 将字体加入到白名单 
Quill.register(Font, true);

const sizes = ['10px', '12px', '14px', '16px', '20px', '24px', '36px', '48px', false];
const FontSizeStyle = Quill.import('attributors/style/size');
FontSizeStyle.whitelist = sizes;
Quill.register(FontSizeStyle, true);

const Delta = Quill.imports.delta;


import * as _moment from 'moment';
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

export interface Ticket {
  ticketId: number;
  activityId: number;
  ticketName: string;
  ticketSum: number;
  ticketStatus: boolean;
  ticketRemark: string;
  ticketSold: number;
}

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class CreateActivityComponent implements OnInit {

  @ViewChild(MatHorizontalStepper, { static: false })
  stepper: MatHorizontalStepper;

  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  firstCompleted = false;
  secondCompleted = false;

  showProgress = false;
  title = '活动编辑';

  urlDefine = urlDefine;

  // 控制活动大图显示
  windowWidth: number;
  headWidth: any;

  // 标签
  // visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: string[];

  forms: any[];  // 报名模板

  // 富文本参数
  options = {
    // debug: 'info',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': sizes }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': fonts }],       //把上面定义的字体数组放进来
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']

      ],
      clipboard: {},
      history: {
        delay: 2000,
        maxStack: 500,
        userOnly: true
      },
      imageResize: { modules: ['DisplaySize', Resize, Toolbar] }
    },
    placeholder: '请优先在PC端编辑，以获得最佳显示效果。粘贴过来的的内容，请全选再点击“Tx"格式清洗后，开始编辑',
    theme: 'snow'
  };
  editorDom: any;
  editor: Quill;
  activityContent: any;

  // 票种
  tickets: Ticket[] = [];

  headPicSrc = 'assets/images/default-picture.png';

  activity: any;

  province: any;
  cities: any;


  constructor(
    private fb: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private el: ElementRef,
    public snackBar: MatSnackBar,
    private region: Region,
    private userService: UserService,
    private commandService: CommandService,
  ) { }

  ngOnInit() {

    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };

    this.firstFormGroup = this.fb.group({
      activityTitle: ['', [Validators.required, forbiddenRegValidator(regDefine.activityName)]],
      activityStartDate: [{ value: moment(), disabled: false }, [Validators.required]],
      activityStartTime: [{ value: '12:00', disabled: false }, [Validators.required]],
      activityEndDate: [{ value: moment(), disabled: false }, [Validators.required]],
      activityEndTime: [{ value: '12:00', disabled: false }, [Validators.required]],
      // xfuEntryStart: [{ value: '', disabled: false }, [Validators.required, forbiddenRegValidator(regDefine.datetime)]],
      entryEndDate: [{ value: moment(), disabled: false }, [Validators.required]],
      entryEndTime: [{ value: '12:00', disabled: false }, [Validators.required]],
      province: ['', Validators.required],
      activityArea: ['', Validators.required],
      activityAddress: ['', [Validators.required, forbiddenRegValidator(regDefine.address)]],
      formId: ['', Validators.required]
    });
    this.secondFormGroup = this.fb.group({
      // activityContent: ['', Validators.required],
      activityPic: ['', Validators.required]
    });

    this.province = this.region.getProvince();
    this.cities = [];
    this.tags = [];

    // 获取 报名模板,再获取或修改的内容
    setTimeout(() => {
      this.commandService.setMessage(3);
      this.showProgress = true;
      this.commandService.setMessage(1);
      this.userService.post(baseConfig.formMyList, { offset: 0, limit: 100 }).subscribe(
        (data: Result) => {
          const result = { ...data };
          if (result.success) {
            this.forms = result.data;
            // 从服务器获得已经保存，提供编辑
            this.activeRoute.params.subscribe((data: Params) => {
              if (data.id !== undefined) { // 编辑
                setTimeout(() => {
                  this.getActivity(data);
                }, 100);
              }
            });
          } else {
            this.userService.showError1(result, () => { this.ngOnInit(); });
          }
          this.showProgress = false;
          this.commandService.setMessage(0);
        },
        (error: Result) => {
          this.userService.showError1(error, () => {this.ngOnInit(); });
          this.showProgress = false;
          this.commandService.setMessage(0);
        }
      );
      }, 100);

  }

  getActivity( data ){
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityMyGet, { activityId: parseInt(data.id, 10) }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.activity = result.data;

          this.activity.province = this.activity.activityArea.substr(0, 2) + '0000';
          this.cities = this.region.getCity(this.activity.province);

          let datatime = this.activity.activityStart.split(' ');
          this.activity.activityStartDate = moment(datatime[0]);
          this.activity.activityStartTime = datatime[1];

          datatime = this.activity.activityEnd.split(' ');
          this.activity.activityEndDate = moment(datatime[0]);
          this.activity.activityEndTime = datatime[1];

          datatime = this.activity.entryEnd.split(' ');
          this.activity.entryEndDate = moment(datatime[0]);
          this.activity.entryEndTime = datatime[1];


          this.firstFormGroup.patchValue(this.activity);
          this.secondFormGroup.patchValue(this.activity);
          this.activityContent = this.activity.activityContent;

          this.tags = this.activity.activityTags.split(',');
          this.headPicSrc = environment.media + '/activity/images' + this.activity.activityPic;
          setTimeout(() => {
            this.listTickets();
          }, 100);
        } else {
          this.userService.showError1(result, () => {this.ngOnInit()});
        }
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.ngOnInit(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      () => { this.showProgress = false; this.commandService.setMessage(0);}
    );
  }

  resetWindow() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 800) {
      this.headWidth = (800) * 9 / 16 + 'px';
    } else {
      this.headWidth = (this.windowWidth) * 9 / 16 + 'px';
    }
  }

  listTickets() {
    // console.log('list.....');
    this.tickets = [];
    this.commandService.setMessage(1);
    this.showProgress = true;
    this.userService.post(baseConfig.ticketMyList, { activityId: parseInt(this.activity.activityId, 10) }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          result.data.forEach(element => {
            this.tickets.push(element);
          });
          this.tickets.splice(0, 1); // 删除第一第系统票种
        } else {
          this.userService.showError1(result, () => {this.listTickets(); });
        }
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.listTickets(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      () => { this.showProgress = false; this.commandService.setMessage(0);}
    );

  }
  get activityTitle() {
    return this.firstFormGroup.get('activityTitle');
  }
  get activityStartDate() {
    return this.firstFormGroup.get('activityStartDate');
  }

  get activityStartTime() {
    return this.firstFormGroup.get('activityStartTime');
  }

  get activityEndDate() {
    return this.firstFormGroup.get('activityEndDate');
  }
  get activityEndTime() {
    return this.firstFormGroup.get('activityEndTime');
  }

  get entryEndDate() {
    return this.firstFormGroup.get('entryEndDate');
  }
  get entryEndTime() {
    return this.firstFormGroup.get('entryEndTime');
  }

  get activityAddress() {
    return this.firstFormGroup.get('activityAddress');
  }

  provinceChange(event: MatSelectChange) {
    // console.log(event.value);
    this.cities = this.region.getCity(event.value);
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim() && this.tags.length <= 2) {
      this.tags.push(value.trim());
    } else if ((value || '').trim() && this.tags.length > 2) {
      this.snackBar.open('标签数不超过3个', '', { duration: 3000 });
    }

    if (input) {
      input.value = '';
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onFirstFormSubmit() {

    console.log(this.firstFormGroup.value);

    if (this.firstFormGroup.valid && this.tags.length === 0) {
      this.snackBar.open('标签为必填荐哦', '', { duration: 3000 });
      return;
    }

    const resutlValue = this.firstFormGroup.value;
    resutlValue.activityStart = resutlValue.activityStartDate.format('YYYY-MM-DD') + ' ' + resutlValue.activityStartTime;
    resutlValue.activityEnd = resutlValue.activityEndDate.format('YYYY-MM-DD') + ' ' + resutlValue.activityEndTime;
    resutlValue.entryEnd = resutlValue.entryEndDate.format('YYYY-MM-DD') + ' ' + resutlValue.entryEndTime;

    if (convertDateFromString(resutlValue.activityStart).getTime() > convertDateFromString(resutlValue.activityEnd).getTime()) {
      this.snackBar.open('请注意活动开始和结束时间的前后有关系', '', { duration: 3000 });
      return;
    }
    if (convertDateFromString(resutlValue.entryEnd).getTime() > convertDateFromString(resutlValue.activityEnd).getTime()) {
      this.snackBar.open('限制报名时间必须在活动结束之前', '', { duration: 3000 });
      return;
    }

    // 输入均合法，填表完成
    this.firstCompleted = true;

    if (this.activity !== null && this.activity !== undefined) {
      resutlValue.activityId = this.activity.activityId;
    }
    resutlValue.activityTags = this.tags.toString();


    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityMyAddUpdate, resutlValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          if (this.activity === null || this.activity === undefined) {
            this.activity = { activityId: result.data };
          }
          this.stepper.next();
          this.initEditor();
        } else {
          this.userService.showError1(result, () => {this.onFirstFormSubmit(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.onFirstFormSubmit(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );


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
    postData.append('activityId', that.activity.activityId);
    // console.log(this.activity);
    // debugger;
    // postData.append('size', 'dd');
    that.commandService.setMessage(1);
    that.showProgress = true;
    that.userService.postFormData(baseConfig.activityUpPic, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          that.secondFormGroup.patchValue({
            activityPic: result.data
          });
          that.headPicSrc = environment.media + '/activity/images' + result.data;
        } else {
          that.userService.showError1(result, () => { that.upHeadPic(bob, that); });
        }
        that.showProgress = false;
        that.commandService.setMessage(0);
      },
      (error: Result) => {
        that.userService.showError1(error, () => { that.upHeadPic(bob, that); });
        that.showProgress = false;
        that.commandService.setMessage(0);
      }
    );
  }

  // init editor
  initEditor() {
    this.editorDom = this.el.nativeElement.querySelector('.editor');
    this.editor = new Quill(this.editorDom, this.options);
    this.editor.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
      return new Delta().insert(node.data);
    });
    const toolbar = this.editor.getModule('toolbar');
    toolbar.addHandler('image', this.imageHandler.bind(this));
    if (this.activityContent) {
      this.editorDom.querySelector('.ql-editor').innerHTML = this.activityContent;
    }
  }


  imageHandler() {
    const Imageinput = document.createElement('input');
    Imageinput.setAttribute('type', 'file');
    Imageinput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
    Imageinput.classList.add('ql-image');

    Imageinput.addEventListener('change', () => {
      const file = Imageinput.files[0];
      const reader = new FileReader();
      const that = this;
      reader.onload = function(e) {
        // console.log(this.result);
        canvasDataURL(this.result, 800, that, that.upImage);  // 处理完后调用uploadPic()
      };
      reader.readAsDataURL(file);
    });

    Imageinput.click();
  }

  upImage(bob: Blob, that) {
    const postData: FormData = new FormData();
    postData.append('file', bob, 'up.jpg');
    postData.append('activityId', that.activity.activityId);
    that.showProgress = true;
    that.commandService.setMessage(1);
    that.userService.postFormData(baseConfig.activityUpPic, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        that.showProgress = false;
        that.commandService.setMessage(0);
        if (result.success) {
          const range = that.editor.getSelection(true);
          // const index = range.index + range.length;
          that.editor.insertEmbed(range.index, 'image', environment.media + '/activity/images' + result.data, 'user');
        } else {
          that.userService.showError1(result, () => { that.upImage(bob, that); });
        }
      },
      (error: Result) => {
        that.userService.showError1(error, () => { that.upImage(bob, that); });
        that.showProgress = false;
        that.commandService.setMessage(0);
      }
    );
  }

  onSecondFormSubmit() {
    this.secondCompleted = true;
    const postData = this.secondFormGroup.value;
    postData.activityContent = this.editorDom.querySelector('.ql-editor').innerHTML;
    postData.activityId = this.activity.activityId;
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityMyAddUpdate, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.stepper.next();
        } else {
          this.userService.showError1(result, () => {this.onSecondFormSubmit(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.onSecondFormSubmit();});
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );

  }

  showAddEditTicket(ticket: Ticket) {

    const dialogRef = this.dialog.open(TicketFormComponent, {
      // height: '400px',
      // width: '90%',
      data: { para: ticket }
    });
    dialogRef.afterClosed().subscribe((result: Ticket) => {
      if (result) {
        if (result.ticketId === 0) {  // 新增
          result.ticketId = null;
        } else {                      // 更新
        }
        result.activityId = this.activity.activityId;
        // 提交
        this.setTicket(result);
      }
    });
  }

  setTicket(result){
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.ticketMyAddUpdate, result).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.listTickets();
        } else {
          this.userService.showError1(result, () => {this.setTicket(result); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.setTicket(result); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }

  showTicketBottom(ticket: Ticket, e: any) {

    const bottomSheetRef = this.bottomSheet.open(TicketsBottomComponent, { data: { para: ticket } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      switch (bottomSheetRef.instance.operType) {
        case 1: // toggle
          this.slideChangr(ticket);
          break;
        case 2: // edit
          this.showAddEditTicket(ticket);
          break;
        default: // none
          break;
      }

    });
  }


  slideChangr(ticket: Ticket) {

    ticket.ticketStatus = !ticket.ticketStatus;
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.ticketMyAddUpdate, ticket).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {

        } else {
          this.userService.showError1(result, () => { this.slideChangr(ticket); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.slideChangr(ticket); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }


}
