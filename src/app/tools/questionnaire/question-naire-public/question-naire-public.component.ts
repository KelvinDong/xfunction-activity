import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { urlDefine, baseConfig } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import {
  faQrcode, faCalendarAlt, faBookmark, faHome, faDoorClosed, faDoorOpen, faCircle, faCamera,
  faMapMarkerAlt, faIdCard, faQuoteLeft, faQuoteRight, faClock, faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { FormBuilder } from '@angular/forms';
import { MatBottomSheet, MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService, Result } from 'src/app/user/user.service';
import { Region } from 'src/app/ts/region';
import { getAndSavePath, isExplorer, convertDateFromString } from 'src/app/ts/base-utils';
import { DynamicFormComponent } from 'src/app/define/dynamic-form/dynamic-form/dynamic-form.component';
import html2canvas from 'html2canvas';
import { DetailShareDialogComponent } from './detail-share-dialog/detail-share-dialog.component';

@Component({
  selector: 'app-question-naire-public',
  templateUrl: './question-naire-public.component.html',
  styleUrls: ['./question-naire-public.component.css']
})
export class QuestionNairePublicComponent implements OnInit {

  showProgress = false;
  title = '调查问卷';

  // url定义
  urlDefine = urlDefine;
  baseUrl = environment.media + '/activity/images';

  webUrl = environment.web;

  showUP = false;

  // 控制活动大图显示
  windowWidth: number;
  headWidth: any;

  questionnaire: any = {};
  questions;

  // 分享二维码
  sharing = false;
  shareData: string;

  entryRight = true;

  // 图标
  faBookmark = faBookmark;
  faHome = faHome;
  faArrowUp = faArrowUp;
  faCamera = faCamera;

  constructor(
    private fb: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private userService: UserService,
    private region: Region,
    private el: ElementRef,
  ) { }

  ngOnInit() {
    getAndSavePath(this.activeRoute);
    // 从服务器获得已经保存，提供编辑
    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        this.showProgress = true;
        this.userService.post(baseConfig.questionnairePublic, { questionnaireId: parseInt(data.id, 10) }).subscribe(
          (data: Result) => {
            const result = { ...data };
            if (result.success) {
              this.questionnaire = result.data;

              this.title = this.questionnaire.questionnaireName;
              if (convertDateFromString(this.questionnaire.questionnaireExpired) < new Date()) {
                this.questionnaire.expired = true;
              } else {
                this.questionnaire.expired = false;  // 没有上架
              }
              this.questions = JSON.parse(this.questionnaire.questionnaireJson);
              // 准备微信分享内容
              if (isExplorer('micromessenger')) {
                this.userService.weixinShare({
                  title: this.questionnaire.questionnaireName,
                  desc: this.questionnaire.questionnairePre,
                  link: window.location.href,
                  imgUrl: this.baseUrl + this.questionnaire.questionnairePic
                });
              }

            } else {
              this.userService.showError(result);
            }
          },
          (error: Result) => { this.userService.showError(error); this.showProgress = false; },
          () => { this.showProgress = false; }
        );
      } else {
        this.snackBar.open('错误：无法找到', '', { duration: 3000 });

      }

    });

    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };
  }

  resetWindow() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 800) {
      this.headWidth = (800) * 9 / 16 + 'px';
    } else {
      this.headWidth = (this.windowWidth) * 9 / 16 + 'px';
    }
  }

  scrollTop() {
    this.el.nativeElement.querySelector('.my-body').scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }


  entryPrepare(e: any) {
    const dialogRef = this.dialog.open(DetailShareDialogComponent, {
      //width: '320px',
      data: { slide: true }
    });

    dialogRef.afterClosed().subscribe((resultData: any) => {
      if (resultData) {
        this.entry(e, resultData);
      }
    });
  }

  entry(e: any, confirm) {
    if (!this.entryRight) {
      this.snackBar.open('无需重复提交！', '', { duration: 3000 });
      return;
    }
    this.showProgress = true;
    this.userService.post(baseConfig.questionnaireAddEntry, {
      questionnaireId: this.questionnaire.questionnaireId,
      entryContent: e, move: confirm.move, action: confirm.action
    }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.entryRight = false;
          this.snackBar.open('提交成功！', '', { duration: 3000 });
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; }
    );

  }

  scrollBottom(e: any) {
    // console.log(e);
    const offsetH = e.target.offsetHeight;
    const scrollT = e.target.scrollTop;
    const height = e.target.scrollHeight;
    if ( scrollT > height / 3){
      this.showUP = true;
    } else {
      this.showUP = false;
    }
  }

  share() {
    this.sharing = true;
    this.showProgress = true;
    setTimeout(() => {
      let dialogRef: any;
      const shareContent = this.el.nativeElement.querySelector('.screenPrint');
      html2canvas(shareContent, { allowTaint: true, useCORS: true }).then(canvas => {
        this.shareData = canvas.toDataURL('image/jpeg', 1.0);
        // console.log(this.shareData);
        dialogRef = this.dialog.open(DetailShareDialogComponent, {
          data: { srcData: this.shareData }
        });

        dialogRef.afterClosed().subscribe((resultData: any) => {
          this.sharing = false;
          this.showProgress = false;
        });
      }).catch();
    }, 1000);
  }


}
