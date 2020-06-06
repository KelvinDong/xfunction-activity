import { Component, OnInit, ElementRef } from '@angular/core';
import { MatBottomSheet, MatDialog, MatSnackBar } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserService, Result, PageQuery } from 'src/app/user/user.service';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import {
  faQrcode, faCalendarAlt, faBookmark, faHome, faDoorClosed, faDoorOpen, faCircle, faHeart,
  faMapMarkerAlt, faIdCard, faQuoteLeft, faQuoteRight, faClock, faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { Ticket } from '../../my/create-activity/create-activity.component';
import { EntryFormComponent } from './entry-form/entry-form.component';
import { convertDateFromString, getUserToken, getAndSavePath, isExplorer } from 'src/app/ts/base-utils';
import { Region } from 'src/app/ts/region';
import { CommentAddFormComponent } from './comment-add-form/comment-add-form.component';
import html2canvas from 'html2canvas';
import { DetailShareDialogComponent } from './detail-share-dialog/detail-share-dialog.component';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.css']
})
export class ActivityDetailComponent implements OnInit {

  showProgress = false;
  title = '活动详情';

  entryRight = true;

  showUP = false;

  // url定义
  urlDefine = urlDefine;
  baseUrl = environment.media + '/activity/images';

  webUrl = environment.web;

  favSponsorGroup: string[] = [];

  // 控制活动大图显示
  windowWidth: number;
  headWidth: any;

  activity: any = { activityTags: '' };
  tickets: any[] = [];
  sponsor: any = {};
  form: any = {};

  // 分享二维码
  sharing = false;
  shareData: string;

  // 图标
  faBookmark = faBookmark;
  faHome = faHome;
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendarAlt = faCalendarAlt;
  faDoorOpen = faDoorOpen;
  faDoorClosed = faDoorClosed;
  faQrcode = faQrcode;
  faIdCard = faIdCard;
  faCircle = faCircle;
  faHeart = faHeart;
  farHeart = farHeart;
  faQuoteLeft = faQuoteLeft;
  faQuoteRight = faQuoteRight;
  faClock = faClock;
  faArrowUp = faArrowUp;


  comments: any[] = [];
  // query: PageQuery = { offset: 0, limit: 10 };

  constructor(
    private fb: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private userService: UserService,
    private commandService: CommandService,
    private region: Region,
    private el: ElementRef,
  ) { }



  ngOnInit() {

    getAndSavePath(this.activeRoute);

    const favListStr = window.localStorage.getItem('favList');
    if (favListStr !== null && favListStr !== undefined) {
      this.favSponsorGroup = favListStr.split(',');
    }

    // 从服务器获得已经保存，提供编辑
    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        setTimeout(() => {
          this.getActivity(data);
          this.commandService.setMessage(2);
        }, 100);
      } else {
        this.snackBar.open('错误：无法找到此活动', '', { duration: 3000 });
      }

    });

    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };

  }

  getActivity(data){
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.publicActivity, { activityId: parseInt(data.id, 10) }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // console.log(result);

          this.activity = result.data;
          this.tickets = result.data.tickets;
          //this.tickets.splice(0, 1); // 删除第一个系统票种
          this.sponsor = result.data.sponsor;
          this.form = result.data.form;

          this.title = this.activity.activityTitle;

          this.activity.activityContent = this.sanitizer.bypassSecurityTrustHtml(this.activity.activityContent);

          this.activity.activityArea = this.region.getName(this.activity.activityArea);
          if (convertDateFromString(this.activity.entryEnd) < new Date()) {
            this.activity.expired = true;
          } else {
            this.activity.expired = false  // 没有上架
          }
          const now = new Date();
          if (((now.getTime() - convertDateFromString(this.activity.activityCreate).getTime()) < 1000 * 60 * 60 * 24)
            && ((now.getTime() - convertDateFromString(this.activity.activityCreate).getTime()) > 0)
          ) {
            this.activity.newPublish = true;
          } else {
            this.activity.newPublish = false;
          }

          if (parseInt(this.activity.activityOrderDict, 10) >= 500) {
            this.activity.recommand = true;
          } else {
            this.activity.recommand = false;
          }

          if (this.favSponsorGroup.indexOf(this.sponsor.sponsorId + '') < 0) {
            this.sponsor.like = false;
          } else {
            this.sponsor.like = true;
          }

          // 请求 评论列表;

          this.getComments();
          // 准备微信分享内容
          if (isExplorer('micromessenger')) {
            this.userService.weixinShare({title: this.activity.activityTitle,
              desc: this.sponsor.sponsorName + this.sponsor.sponsorIntro,
              link: window.location.href,
              imgUrl: this.baseUrl + this.activity.activityPic
            });
          }

        } else {
          this.userService.showError1(result, () => { this.getActivity(data); });
        }
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.getActivity(data); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      () => { this.showProgress = false; this.commandService.setMessage(0); }
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

  entry(ticket: Ticket) {

    /*
    if (!getUserToken()) {
      this.router.navigateByUrl(urlDefine.loginUrl);
      return;
    }
    */

    const dialogRef = this.dialog.open(EntryFormComponent, {
      // height: '400px',
      // width: '90%',
      data: { ticket, form: this.form }
    });
    dialogRef.afterClosed().subscribe((resultData: string) => {
      if (resultData) {
        // 提交
        this.saveEntry(ticket, resultData);
      }
    });
  }

 saveEntry(ticket, resultData){
  this.showProgress = true;
  this.commandService.setMessage(1);
  this.userService.post(baseConfig.entryMyAdd, {
    activityId: this.activity.activityId,
    ticketId: ticket.ticketId, entryContent: resultData
  }).subscribe(
    (data: Result) => {
      const result = { ...data };
      if (result.success) {
        this.entryRight = false;
        this.snackBar.open('报名成功！', '', { duration: 5000 });
      } else {
        this.userService.showError1(result, () => { this.saveEntry( ticket, resultData); });
      }
      this.showProgress = false;
      this.commandService.setMessage(0);
    },
    (error: Result) => {
      this.userService.showError1(error, () => { this.saveEntry(ticket, resultData); });
      this.showProgress = false;
      this.commandService.setMessage(0);
    }
  );
 }

  likeSponsor(event: any) {

    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.toggleFavi, { sponsorId: this.sponsor.sponsorId }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // 先删除
          const index = this.favSponsorGroup.indexOf(this.sponsor.sponsorId + '');
          this.favSponsorGroup.splice(index, 1);
          // 再决定是否增加还是删除
          if (result.data) { // 增加
            this.favSponsorGroup.push(this.sponsor.sponsorId + '');
            this.sponsor.like = true;
          } else { // 去除
            this.sponsor.like = false;
          }
          window.localStorage.setItem('favList', this.favSponsorGroup.toString());
        } else {
          this.userService.showError1(result, () => {this.likeSponsor(event); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.likeSponsor(event); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );

    event.stopPropagation();
  }

  showPublishComment() {
    const dialogRef = this.dialog.open(CommentAddFormComponent, {
      // height: '400px',
      // width: '90%',
      data: {}
    });
    dialogRef.afterClosed().subscribe((resultData: string) => {
      if (resultData) {
        this.saveComment(resultData);
      }
    });
  }

  saveComment(resultData){
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.publishComment, { activityId: this.activity.activityId, commentContent: resultData }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('发布成功', '', { duration: 5000 });
          this.getComments();
        } else {
          this.userService.showError1(result, () => { this.saveComment(resultData); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.saveComment(resultData); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

  toSponsor(event: any) {

    this.router.navigate([urlDefine.sponsorActivityList, this.activity.sponsor.sponsorId]);

    event.stopPropagation();
  }

  // 仅取了前10条数据
  getComments() {
    this.userService.post(baseConfig.getPublicComments, { activityId: this.activity.activityId }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.comments = result.data.rows;
          this.comments.forEach(element => {
            element.commentCreate = convertDateFromString(element.commentCreate);
          });
        } else {
          this.userService.showError1(result, () => { this.getComments(); });
        }
      },
      (error: Result) => { this.userService.showError1(error, () => {this.getComments(); });  },
    );

  }

  share() {
    this.sharing = true;
    this.showProgress = true;
    this.commandService.setMessage(1);
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
          this.commandService.setMessage(0);
        });
      }).catch();
    }, 1000);
  }

  scrollTop() {
    this.el.nativeElement.querySelector('.my-body-parent-top').scrollTo({ left: 0, top: 0, behavior: 'smooth' });
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
  

}
