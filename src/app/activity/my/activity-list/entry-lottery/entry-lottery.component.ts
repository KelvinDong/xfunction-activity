import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { UserService, Result, PageQuery } from 'src/app/user/user.service';
import { baseConfig, regDefine } from 'src/app/ts/base-config';
import { DomSanitizer } from '@angular/platform-browser';
import { EventManager } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { getAndSavePath, getNowTime, forbiddenRegValidator, getUserToken, canvasDataURL, isExplorer } from 'src/app/ts/base-utils';
import { Ticket } from '../../create-activity/create-activity.component';
import { ColorPickerControl } from '@iplab/ngx-color-picker';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-entry-lottery',
  templateUrl: './entry-lottery.component.html',
  styleUrls: ['./entry-lottery.component.css'],
  animations: [
    trigger('openClose', [
      state('open', style({
        transform: 'rotateY(0deg)',
      })),
      state('closed', style({
        transform: 'rotateY(90deg)',
      })),
      transition('open => closed', [
        animate('0.3s ease-out')
      ]),
      transition('closed => open', [
        animate('0.3s 0.3s ease-in')
      ]),
    ]),
  ],
})
export class EntryLotteryComponent implements OnInit {

  screenX = window.screen.width;
  screenY = window.screen.height;
  showProgress = false;

  query: PageQuery = { offset: 0, limit: 10 };
  toEnd = false;

  activityId: number;
  // 票种
  tickets: Ticket[] = [];
  settings: any;
  entries: any[] = [];
  // 抽奖记录
  results: any[] = [];

  // 背景图片 需示安全转义
  backImg: any;
  
  // 记时器
  timing = 0; // -1 不启动

  // 抽奖步骤

  step = 0;
  stepEnough = true; // 每批init时判断还有没有人了
  stepName = '';
  stepSum = 0;
  stepStep = 0; // 非批量生成，一次生成一个。
  stepStepStr = ''; // 非批量生成，当前生成的其中一个
  stepBatch = false;
  stepLog: any;
  stepTotal = 0;
  stepInteval = 0;
  stepResult: any[] = [];
  stepRunning = false;
  hasResult = false;
  // tabelCol = 1;

  autoTimer: any;

  cellBorderTypeControl = new FormControl('');
  // 版面
  formatEditing = false;
  format = {   // 原则上此变量是可以整合到 setting中的
    titleColor: 'rgba(187, 101, 0, 1)',
    titleSize: '45px',
    subTitleColor: 'rgba(26, 25, 25, 1)',
    subTitleSize: '15px',
    centerBackColor: 'rgba(255, 255, 255, 0.84)',
    tableBackColor: 'rgba(229, 198, 70, 0.94)',
    tableFontColor: 'rgba(148, 0, 255, 1)',
    tableFontSize: '17px',
    // buttonFontColor: 'rgba(255, 255, 255, 1)',
    // buttonFontSize: '14px',
    cellWidth: 133,
    cellHeight: 34,
    // cellPadding: 0,
    cellMargin: 0,
    cellBorderWidth: 1,
    cellBorderStyle: 'dotted',
    cellBorderColor: 'rgba(20, 20, 20, 0.35)',
    showLog: true,
    top: -6,
    left: 42,
    back: null
  };

  settingForm: any = new FormGroup({
    title: new FormControl('', [Validators.required]),
    tickets: new FormControl('', [Validators.required]),
    inCancle: new FormControl(true, []),
    inUnSign: new FormControl(true, []),
    canRepeat: new FormControl(false, []),
    turnNames: this.fb.array([
      this.fb.control('', [Validators.required])
    ]),
    turnSums: this.fb.array([
      this.fb.control('0', [forbiddenRegValidator(regDefine.biggerThanZero)])
    ]),
    turnBatch: this.fb.array([
      this.fb.control('', [])
    ]),
    oneOne: this.fb.array([
      this.fb.control('0', [forbiddenRegValidator(regDefine.zeroThanFive)])
    ]),
  });

  isOpen = true;

  isChrome = false;

  warm = new Audio(environment.media + '/activity/audio/633353257.mp3');
  done = new Audio(environment.media + '/activity/audio/12316.wav');

  toggle() {
    this.done.play();
    this.isOpen = !this.isOpen;
  }

  muteDone(e: any) {
    if (e) {
      this.done.muted = e.target.checked;
      this.warm.muted = e.target.checked;
    }
  }

  addMusic(event: any) {
    const file = event.target.files[0];
    const url = window.URL.createObjectURL(file);
    this.warm.src = url;
    this.warm.play();
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private commandService: CommandService,
    private el: ElementRef,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private eventManager: EventManager,
    private activeRoute: ActivatedRoute,
    // private router: Router,
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit() {

    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.isChrome = isExplorer('chrome');

    this.warm.loop = true;

    this.backImg = 'url(/assets/images/lottery.jpg)';
    this.backImg = this.sanitizer.bypassSecurityTrustStyle(this.backImg);

    this.eventManager.addGlobalEventListener('window', 'keydown.space', () => {
      this.keySpace();
    });

    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        this.activityId = parseInt(data.id, 10);
        setTimeout(() => {
          this.getSetting();
          this.commandService.setMessage(3);
        }, 100);
        
      } else {
        this.snackBar.open('参数错误', '', { duration: 3000 });
      }
    });
  }

  getSetting() {
    this.showProgress = true;
    this.commandService.setMessage(1);
    // 送服务器
    this.userService.post(this.activityId === 1 ?
      baseConfig.activityMyLotterySettingsGetDemo : baseConfig.activityMyLotterySettingsGet, {
      activityId: this.activityId,
    }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // console.log(result.data.settings);
          if (result.data.settings) {
            this.settings = JSON.parse(result.data.settings);
            this.format = this.settings.format;
            if (this.format.back && this.format.back !== 'null') {
              this.backImg = 'url(' + environment.media + '/activity/images' + this.format.back + ') ';
            } else {
              this.backImg = 'url(/assets/images/lottery.jpg)';
            }
            this.backImg = this.sanitizer.bypassSecurityTrustStyle(this.backImg);
            // 初始化控件
            for (let i = 1; i < this.settings.turnNames.length; i++) {
              this.addTurn(null);
            }
            this.settingForm.patchValue(this.settings);

            // 加载抽奖记录
            this.getResults();
            this.listTickets();

          } else if (result.data.activityTitle) {
            this.settingForm.patchValue({ title: result.data.activityTitle });
          }

        } else {
          this.userService.showError1(result, () => { this.getSetting(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.getSetting(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

  listTickets() {
    // console.log('list.....');
    this.tickets = [];
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(this.activityId === 1 ?
      baseConfig.ticketMyListDemo : baseConfig.ticketMyList, { activityId: this.activityId }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          result.data.forEach(element => {
            this.tickets.push(element);
          });
          // this.tickets.splice(0, 1); // 删除第一第系统票种
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

  dlResults() {
    const userToken = getUserToken();
    const params = { activityId: this.activityId }; // body的参数
    this.http.post(environment.api + (this.activityId === 1 ?
      baseConfig.activityMyLotteryResultDlDemo : baseConfig.activityMyLotteryResultDl), params, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json').append('token', userToken === undefined ? '' : userToken)
    }).subscribe(resp => {
      // resp: 文件流
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const blob = new Blob([resp], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = Date.now() + '.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);

    });
  }

  getResults() {
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(this.activityId === 1 ? baseConfig.activityMyLotteryResultGetDemo : baseConfig.activityMyLotteryResultGet, {
      activityId: this.activityId,
      offset: this.query.offset,
      limit: this.query.limit
    }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          result.data.forEach(element => {
            this.results.push(element);
          });
          if (result.data.length <= 0) { // 服务侧因为返回了总数，所以超过总是返回最后一页，所以判断结束方法随之改变。
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
        } else {
          this.userService.showError1(result, () => {this.getResults(); });
        }
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.getResults(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      () => { this.showProgress = false; this.commandService.setMessage(0); }
    );
  }

  resetResult() {
    this.query = { offset: 0, limit: 10 };
    this.results = [];
    this.getResults();
  }

  scrollBottom(e: any) {
    //console.log(e);
    const offsetH = e.target.offsetHeight;
    const scrollT = e.target.scrollTop;
    const height = e.target.scrollHeight;
    // div 距离底部 = 列表的总高度 -（滚动的距离 + 窗口可视高度）
    const bottom = height - (scrollT + offsetH);
    if (bottom < 10 && !this.showProgress && !this.toEnd) {
      // console.log('到底了');
      this.getResults();
    }
  }

  get turnNames() {
    return this.settingForm.get('turnNames').controls;
  }
  get turnSums() {
    return this.settingForm.get('turnSums').controls;
  }
  get turnBatch() {
    return this.settingForm.get('turnBatch').controls;
  }
  get oneOne() {
    return this.settingForm.get('oneOne').controls;
  }

  addTurn(e: any) {
    if (e !== null && e !== undefined) {
      e.stopPropagation();
      e.preventDefault();
    }
    const turnNames: FormArray = this.settingForm.get('turnNames');
    turnNames.insert(turnNames.length, new FormControl('', [Validators.required]));
    const turnSums: FormArray = this.settingForm.get('turnSums');
    turnSums.insert(turnSums.length, new FormControl('0', [forbiddenRegValidator(regDefine.biggerThanZero)]));
    const turnBatch: FormArray = this.settingForm.get('turnBatch');
    turnBatch.insert(turnBatch.length, new FormControl('', []));
    const oneOne: FormArray = this.settingForm.get('oneOne');
    oneOne.insert(oneOne.length, new FormControl('0', [forbiddenRegValidator(regDefine.zeroThanFive)]));
  }

  removeTurn(e: any) {
    e.stopPropagation();
    e.preventDefault();
    const turnNames: FormArray = this.settingForm.get('turnNames');
    turnNames.removeAt(turnNames.length - 1);
    const turnSums: FormArray = this.settingForm.get('turnSums');
    turnSums.removeAt(turnSums.length - 1);
    const turnBatch: FormArray = this.settingForm.get('turnBatch');
    turnBatch.removeAt(turnBatch.length - 1);
    const oneOne: FormArray = this.settingForm.get('oneOne');
    oneOne.removeAt(oneOne.length - 1);
  }

  formSubmit() {
    this.settings = this.settingForm.value;
    this.settings.format = this.format;
    this.showProgress = true;
    this.commandService.setMessage(1);
    // 送服务器
    this.userService.post(this.activityId === 1 ? baseConfig.activityMyLotterySettingsDemo : baseConfig.activityMyLotterySettings, {
      activityId: this.activityId,
      settings: JSON.stringify(this.settings)
    }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('设置保存成功', '', { duration: 3000 });
        } else {
          this.userService.showError1(result, () => {this.formSubmit(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.formSubmit(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

  cellBorderTypeChange(e: any) {
    this.format.cellBorderStyle = e.target.value;
  }



  start() {
    // 开始抽奖了
    // 首先获得所有用户数据
    this.commandService.setMessage(2);
    this.formatEditing = false;
    this.settings = this.settingForm.value;
    this.getEntries();
    this.formSubmit();
    this.warm.play();
  }

  edit() {
    // 开始抽奖了
    // 首先获得所有用户数据
    this.commandService.setMessage(2);
    this.formatEditing = true;
    this.cellBorderTypeControl.setValue(this.format.cellBorderStyle);
    this.settings = this.settingForm.value;

    // 制造模拟数据
    let prepare = 0 ;
    this.settings.turnSums.forEach(element => {
      prepare = prepare + parseInt(element, 10);
    });

    this.entries = [];
    for (let i = 0; i < prepare + 1 ; i++ ) {
      this.entries.push({entryId: i + 1 , showStr: '测试数据' + i});
    }

    this.stepResult = [];
    this.nextStep(); // 开始第一步

    this.warm.play();
    this.formSubmit();
    
  }

  getEntries() {   // inCancle  inUnSign  
    this.showProgress = true;
    this.commandService.setMessage(1);
    // 送服务器
    this.userService.post(this.activityId === 1 ? baseConfig.activityMyLotteryEntriesDemo : baseConfig.activityMyLotteryEntries, {
      activityId: this.activityId,
      checkin: this.settings.inUnSign ? null : true,
      cancel: this.settings.inCancle ? null : false,
      tickets: this.settings.tickets
    }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.entries = result.data;
          if (this.entries.length === 0){
            this.snackBar.open('参与名单总数为0，无法抽奖！', '', { duration: 3000 });
            this.showProgress = false;
            this.commandService.setMessage(0);
            return;
          }
          this.stepResult = [];
          this.nextStep(); // 开始第一步
        } else {
          this.userService.showError1(result, () => {this.getEntries(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.getEntries(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

  returnSettings() {
    this.commandService.setMessage(3);
    this.step = 0;
    this.stepRunning = false;
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    // 重新刷新历史记录
    this.resetResult();
    this.warm.pause();
  }

  headPic(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const that = this;
    reader.onload = function(e) {
        // console.log(this.result);
      canvasDataURL(this.result, 1920, that, that.upHeadPic);  // 处理完后调用uploadPic()
    };
    reader.readAsDataURL(file);

  }

  upHeadPic(bob: Blob, that) {
    const postData: FormData = new FormData();
    postData.append('file', bob, 'up.jpg');
    postData.append('funType', '3');
    postData.append('activityId', that.activityId.toString());
    that.showProgress = true;
    that.commandService.setMessage(1);
    that.userService.postFormData(that.activityId === 1 ? baseConfig.activityUpPicDemo : baseConfig.activityUpPic, postData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          that.format.back = result.data;
          that.backImg = 'url(' + environment.media + '/activity/images' + result.data + ')';
          that.backImg = that.sanitizer.bypassSecurityTrustStyle(that.backImg);
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

  /*  以下是抽奖相关  */

  keySpace() {
    if (this.step > 0 ) {
      if ( this.stepRunning ) {
        this.controlStep(false);
      } else {
        if (this.hasResult) {
          this.nextStep();
        } else {
          this.controlStep(true);
        }
      }
    }
  }

  nextStep() {

    const el = document.documentElement;
    const rfs = el.requestFullscreen;
    if (rfs !== undefined && rfs) {
      rfs.call(el);
    }

    if (this.step < this.settings.turnNames.length) {

      if (this.settings.canRepeat) { // 返回到列表中
        for (let i = 0; i < this.stepResult.length; i++) {

          if (this.stepResult[i].entryId !== 0) { this.entries.push(this.stepResult[i]); }
          // stepResult不作删除， 初始化会另赋值
        }
      }
      // 充足吗
      const m = this.entries.length;
      if (m <= 0) {
        this.snackBar.open('参与名单不足，无法抽奖！', '', { duration: 3000 });
        this.stepEnough = false;
        return;
      }
      this.stepEnough = true;

      this.step++;
      this.initStep();
    }
  }

  resetStep() {
    // if (this.step < this.settings.turnNames.length) {
    // if (this.settings.canRepeat) { // 返回到列表中
    console.log(this.stepResult);
    for (let i = 0; i < this.stepResult.length; i++) {
      if (this.stepResult[i].entryId !== 0) { this.entries.push(this.stepResult[i]); }
      // stepResult不作删除， 初始化会另赋值
    }
    // }
    this.initStep();
    // }
  }

  private startTime() {
    if (this.stepRunning) {
      this.timing++;
      setTimeout(() => {
        this.startTime();
      }, 1000);
    }
  }

  private initStep() {

    let m = this.entries.length;
    // 洗牌
    while (m) {
      // Pick a remaining element…
      const i = Math.floor(Math.random() * m--);
      // And swap it with the current element.
      const t = this.entries[m];
      this.entries[m] = this.entries[i];
      this.entries[i] = t;
    }
    this.timing = 0 ;
    this.stepStep = 0;
    this.hasResult = false;
    this.stepName = this.settings.turnNames[this.step - 1];
    if (this.settings.turnBatch[this.step - 1]) {
      this.stepBatch = false;
    } else {
      this.stepBatch = true;
    }
    const dev = this.settings.oneOne[this.step - 1];
    this.stepInteval = parseInt(dev, 10) * 1000;
    this.stepSum = parseInt(this.settings.turnSums[this.step - 1], 10);
    // if (this.stepSum === 1) { this.tabelCol = 1; }
    // if (this.stepSum === 2) { this.tabelCol = 2; }
    // if (this.stepSum > 2) { this.tabelCol = Math.ceil(this.stepSum / 10); }
    this.stepResult = [];
    this.stepTotal = this.entries.length;
    if (this.stepSum > this.stepTotal) {this.stepSum = this.stepTotal; }
    for (let i = 0; i < this.stepSum ; i++) {
      this.stepResult.push({ entryId: 0, showStr: '共创新，迎未来' });
      // this.stepResult.push(this.entries[0]);
      // this.entries.splice(0, 1);
    }

    console.log(this.stepResult.length);
    console.log(this.entries.length);
  }

  private autoControl() {
    if (this.stepBatch === false && this.stepRunning && this.stepInteval !== 0) {
      this.controlStep(false);
      this.autoTimer = setTimeout(() => {
        this.autoControl();
      }, this.stepInteval);
    }
  }

  // 一次性完成以上的，中途不想一个个来了。
  public autoControlRest() {
    this.stepStep = this.stepSum - 1;
    this.controlStep(false);
    if (this.autoTimer) { this.autoTimer.unref(); }
  }

  controlStep(action: boolean) {
    if (action) { // running
      // console.log(this.stopButton);
      this.timing = 0;
      this.stepRunning = true;
      this.startTime();
      this.selfRun();

      this.autoTimer = setTimeout(() => { // 是否自动抽取，由进程自己判断
        this.autoControl();
      }, this.stepInteval);

    } else {  // 尝试stop

      this.stepStepStr = this.stepResult[this.stepStep].showStr;
      if (this.stepBatch === false && this.stepStep < this.stepSum - 1) { // one by one 且还没有抽完
        // 放动画  stepStepStr
        this.toggle();
        setTimeout(() => {
          this.toggle();
        }, 1500);

        this.stepStep++;

        this.stepRunning = true;
        this.selfRun();
        return;
      }
      // if (this.stepBatch === false) {
      if (true) {
        this.stepStep++;
        //最后一个放动画, 或批量只有一个动画
        this.toggle();
        setTimeout(() => {
          this.toggle();
        }, 1500);
      }

      this.timing = 0;
      this.stepRunning = false;
      this.hasResult = true;
      // 记录 log
      this.stepLog = this.el.nativeElement.querySelector('.lotteryStepLog');
      if (this.stepLog !== null && this.stepLog !== undefined) {
        let str = '';
        this.stepResult.forEach(element => {
          str = str + '<span style="margin-right:10px">' + element.showStr + '</span>';
        });
        this.stepLog.innerHTML = '<h4>' + this.stepName + '</h4>' +
          '<small>' + getNowTime() + '</small>' +
          '<p>' + str + '</p>' + this.stepLog.innerHTML;
      }

      // 结果送服务器
      if ( !this.formatEditing ) {this.saveToServer(); }
    }

  }

  private saveToServer() {

    this.showProgress = true;
    this.commandService.setMessage(1);
    // 送服务器
    this.userService.post(this.activityId === 1 ? baseConfig.activityMyLotteryResultSaveDemo : baseConfig.activityMyLotteryResultSave, {
      activityId: this.activityId,
      result: JSON.stringify(this.stepResult),
      remark: this.stepName
    }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // this.snackBar.open('设置保存成功', '', { duration: 3000 });
        } else {
          this.userService.showError1(result, () => { this.saveToServer();});
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.saveToServer(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

  private selfRun() {
    let from = 0;
    if (this.stepBatch === false) { // one by one
      from = this.stepStep;
    }
    for (let i = from; i < this.stepSum  && this.stepRunning; i++) {
      if (this.stepResult[i].entryId !== 0) { this.entries.push(this.stepResult[i]); }
      let pos = parseInt((Math.random() * (this.entries.length)) + '', 10);
      if (pos > this.entries.length - 1) { pos = 0; }  // 保护一下
      this.stepResult.splice(i, 1, this.entries[pos]);
      this.entries.splice(pos, 1);
    }

    if (this.stepRunning) {
      setTimeout(() => {
        this.selfRun();
      }, 100);
    }
  }

  colorChange(color: string) { }

}




