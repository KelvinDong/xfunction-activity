import { Component, OnInit } from '@angular/core';
import { UserService, Result, PageQuery } from 'src/app/user/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
  faHeart, faSquare, faCalendarAlt, faBookmark, faMapMarkerAlt, faCircle, faIdCard
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import { MatBottomSheet, MatDialog, MatSnackBar } from '@angular/material';
import { ListBottomComponent } from './list-bottom/list-bottom.component';
import { convertDateFromString, getAndSavePath, getUserMobile } from 'src/app/ts/base-utils';
import { Region } from 'src/app/ts/region';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivityListDialogComponent } from './activity-list-dialog/activity-list-dialog.component';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css']
})
export class ActivityListComponent implements OnInit {

  title = '活动列表';
  baseUrl = environment.media + '/activity/images';
  urlDefine = urlDefine;

  // 控制活动大图显示
  windowWidth: number;
  headWidth: any;

  // http相关
  showProgress = false;
  toEnd = false;
  query: PageQuery = { offset: 0, limit: 10 };
  queryForm: FormGroup;


  // 图标
  faCircle = faCircle;
  faCalendarAlt = faCalendarAlt;
  faHeart = faHeart;
  faBookmark = faBookmark;
  faMapMarkerAlt = faMapMarkerAlt;
  farHeart = farHeart;
  faIdCard = faIdCard;


  activities: any[] = [];

  total: number;

  activityOrderDict: any[];
  activityApplyDict: any[];

  constructor(
    private userService: UserService,
    private router: Router,
    private region: Region,
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private activeRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {
    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.queryForm = this.fb.group({
      activityOrderDict: [],
      activityApplyDict: [],
      showExpired: [true]
    });
    this.getActivities();
    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };
  }

  resetWindow() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 800) {
      this.headWidth = (800) * 4 / 16 + 'px';
    } else {
      this.headWidth = (this.windowWidth) * 4 / 16 + 'px';
    }
  }

  queryChange() {
    this.query = { offset: 0, limit: 10 };
    this.activities = [];
    this.toEnd = false;
    this.getActivities();
  }
  getActivities() {
    this.showProgress = true;
    const temp = this.queryForm.value;
    temp.offset = this.query.offset;
    temp.limit = this.query.limit;
    this.userService.post(baseConfig.activityMyList, temp).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // 第一次加载，处理数据字典
          if (this.query.offset === 0) {
            this.activityOrderDict = result.data.dataDictMap.activityOrderDict;
            this.activityApplyDict = result.data.dataDictMap.activityApplyDict;
            this.total = result.data.total;
          }
          // 处理内容
          result.data.rows.forEach(element => {
            this.activityOrderDict.forEach(dd => {
              if (parseInt(dd.dictValue, 10) === element.activityOrderDict) {  // 数据库中以int存储，数据字典中varchar
                element.activityOrderLabel = dd.dictLabel;
                return;
              }
            });
            this.activityApplyDict.forEach(dd => {
              if (dd.dictValue === element.activityApplyDict) {
                element.activityApplyLabel = dd.dictLabel;
                return;
              }
            });

            let sold = 0;
            element.tickets.forEach(ticket => {
              sold = sold + ticket.ticketSold;
            });
            element.sold = sold;

            element.activityArea = this.region.getName(element.activityArea);
            element.activityTemp.activityArea = this.region.getName(element.activityTemp.activityArea);
            // 此处的过期是活动结束时间来计算， public那边以报名时间来计算过期
            if (convertDateFromString(element.activityEnd) < new Date()) {  // 实际时间，而不是临时表中的结束时间
              element.expired = true;
            } else {
              element.expired = false;
            }
            const now = new Date();
            if (((now.getTime() - convertDateFromString(element.activityCreate).getTime()) < 1000 * 60 * 60 * 24)
              && ((now.getTime() - convertDateFromString(element.activityCreate).getTime()) > 0)
            ) {
              element.newPublish = true;
            } else {
              element.newPublish = false;
            }

            this.activities.push(element);
          });
          if (result.data.total === this.activities.length) {
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; }
    );
  }

  scrollBottom(e: any) {
    //console.log(e);
    let offsetH = e.target.offsetHeight;
    let scrollT = e.target.scrollTop;
    let height = e.target.scrollHeight;
    // div 距离底部 = 列表的总高度 -（滚动的距离 + 窗口可视高度）
    let bottom = height - (scrollT + offsetH);
    if (bottom < 10 && !this.showProgress && !this.toEnd) {
      // console.log('到底了');
      this.getActivities();
    }
  }

  showBottom(activity: any) {
    // console.log(activity);
    const bottomSheetRef = this.bottomSheet.open(ListBottomComponent, { data: { para: activity } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      switch (bottomSheetRef.instance.operType) {
        case 1: // 编辑，前提未过期的
          this.router.navigate([urlDefine.createActiviry, activity.activityId]);
          break;
        case 5: // 报名列表，前提有票种
          this.router.navigate([urlDefine.activityEntries, activity.activityId]);
          break;
        case 3: // 提审，前提编辑/或是转正式+完整（题图+票种）+未过期
          this.activityUp(null, activity);
          break;
        case 4: // 下架 前提上架状态，变为私有的
          this.showProgress = true;
          this.userService.post(baseConfig.activityMyApply, { activityId: activity.activityId, myApplyId: 3 }).subscribe(
            (data: Result) => {
              const result = { ...data };
              if (result.success) {
                activity.activityOrderDict = 0;
                activity.activityOrderLabel = '私有';  // TODO 懒了，需要数据字典
                activity.activityApplyDict = '3';
                activity.activityApplyLabel = '成功'; // TODO 懒了，需要数据字典
                activity.activityTitle = activity.activityTemp.activityTitle;
                activity.activityStart = activity.activityTemp.activityStart;
                activity.activityEnd = activity.activityTemp.activityEnd;
                activity.entryEnd = activity.activityTemp.entryEnd;
                activity.activityArea = activity.activityTemp.activityArea;
                activity.activityAddress = activity.activityTemp.activityAddress;
                activity.activityPic = activity.activityTemp.activityPic;
                activity.activityTags = activity.activityTemp.activityTags;
                if (convertDateFromString(activity.activityEnd) < new Date()) {  // 实际时间，而不是临时表中的结束时间
                  activity.expired = true;
                } else {
                  activity.expired = false;
                }
              } else {
                this.userService.showError(result);
              }
              this.showProgress = false;
            },
            (error: Result) => { this.userService.showError(error); this.showProgress = false; }
          );
          break;
        case 2: // 查看 无前提
          this.router.navigate([urlDefine.publicActivity, activity.activityId]);
          break;
        case 8: // 扫描个人签到码，无前提
          this.showDialog(activity, 8);
          break;
        case 7: // 下载活动签到码，无前提
          this.showDialog(activity, 7);
          break;
        case 6: // 6  活动抽奖
          this.router.navigate([urlDefine.lotterySettings, activity.activityId]);
          break;
        case 9: // 推广
          this.showDialog(activity, 9);
          break;
        case 10: // 10 签到墙
          // this.router.navigate([urlDefine.wall, activity.activityId]);
          window.open('/activity/my/checkin-demo/' + activity.activityId, '_blank');
          break;
        default:
          break;
      }

    });
  }

  activityUp(e: any, activity: any) {
    if (e) { e.stopPropagation(); }
    this.showProgress = true;
    this.userService.post(baseConfig.activityMyApply, { activityId: activity.activityId, myApplyId: 2 }).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) { // 服务端暂没有审核，忽略审核中、审核失败
          activity.activityOrderDict = 1;
          activity.activityOrderLabel = '公开';  // TODO 懒了，需要数据字典
          activity.activityApplyDict = '3';
          activity.activityApplyLabel = '成功'; // TODO 懒了，需要数据字典
          activity.activityTitle = activity.activityTemp.activityTitle;
          activity.activityStart = activity.activityTemp.activityStart;
          activity.activityEnd = activity.activityTemp.activityEnd;
          activity.entryEnd = activity.activityTemp.entryEnd;
          activity.activityArea = activity.activityTemp.activityArea;
          activity.activityAddress = activity.activityTemp.activityAddress;
          activity.activityPic = activity.activityTemp.activityPic;
          activity.activityTags = activity.activityTemp.activityTags;
          if (convertDateFromString(activity.activityEnd) < new Date()) {  // 实际时间，而不是临时表中的结束时间
            activity.expired = true;
          } else {
            activity.expired = false;
          }
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; }
    );
  }

  showDialog(activity: any, type: number) {
    const dialogRef = this.dialog.open(ActivityListDialogComponent, {
      // height: '400px',
      // width: '90%',
      data: { activity, type }
    });
    dialogRef.afterClosed().subscribe((result: any) => { });
  }

  addActivity() {
    const userMobile = getUserMobile();
    if (userMobile === null || userMobile === undefined) {
      this.snackBar.open('请前往“我的”绑定手机号', '', { duration: 5000 });
    } else {
      this.router.navigate([urlDefine.createActiviry]);
    }
  }

}
