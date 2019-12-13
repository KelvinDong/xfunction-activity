import { Component, OnInit, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import {
   faHeart,  faSquare, faCalendarAlt, faBookmark, faMapMarkerAlt, faCircle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { convertDateFromString, getAndSavePath, isExplorer } from 'src/app/ts/base-utils';
import { MatSnackBar } from '@angular/material';
import { Region } from 'src/app/ts/region';
import { windowToggle } from 'rxjs/operators';

@Component({
  selector: 'app-sponsor-activity-list',
  templateUrl: './sponsor-activity-list.component.html',
  styleUrls: ['./sponsor-activity-list.component.css']
})
export class SponsorActivityListComponent implements OnInit {

  title = '主办方';
  showProgress = false;
  toEnd = false;
  favSponsorGroup: string[] = [];

  baseUrl = environment.media + '/activity/images';
  query: PageQuery = { offset: 0, limit: 10 };

  // url定义
  urlDefine = urlDefine;

  // 图标
  faCircle = faCircle;
  faCalendarAlt = faCalendarAlt;
  faHeart = faHeart;
  faBookmark = faBookmark;
  faMapMarkerAlt = faMapMarkerAlt;
  farHeart = farHeart;

  // 控制活动大图显示
  windowWidth: number;
  headWidth: any;

  sponsor: any;

  activities: any[] = [];

  constructor(
    private el: ElementRef,
    private userService: UserService,
    public snackBar: MatSnackBar,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private region: Region
  ) { }


  ngOnInit() {

    getAndSavePath(this.activeRoute);

    const favListStr = window.localStorage.getItem('favList');
    if ( favListStr !== null && favListStr !== undefined) {
      this.favSponsorGroup = favListStr.split(',');
    }

    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        this.sponsor = {sponsorId: data.id};
        this.getActivities();
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
      this.headWidth = (800 ) * 4 / 16 + 'px';
    } else {
      this.headWidth = (this.windowWidth ) * 4 / 16 + 'px';
    }
  }

  getActivities() {

    const formData = { sponsorId: this.sponsor.sponsorId, offset: this.query.offset , limit: this.query.limit };

    this.showProgress = true;
    this.userService.post(baseConfig.sponsorActivityList, formData).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {

          if (this.query.offset === 0) {
            this.sponsor = result.data.dataDictMap.sponsor;
            this.title = this.sponsor.sponsorName;
            if (this.favSponsorGroup.indexOf(this.sponsor.sponsorId + '') < 0) {
              this.sponsor.like = false ;
            } else {
              this.sponsor.like = true;
            }
          }

          // 处理内容
          result.data.rows.forEach(element => {
            element.activityStart = convertDateFromString(element.activityStart);
            element.activityArea = this.region.getName(element.activityArea );
            if (convertDateFromString(element.entryEnd) < new Date()) {
              element.expired = true;
            } else {
              element.expired = false;
            }
            const now = new Date();
            if ( ((now.getTime() - convertDateFromString(element.activityCreate).getTime()) < 1000 * 60 * 60 * 24)
              && ((now.getTime() - convertDateFromString(element.activityCreate).getTime()) > 0)
            ) {
              element.newPublish = true;
            } else {
              element.newPublish = false;
            }


            if (element.activityOrderDict >= 500) {
              element.recommand = true;
            } else {
              element.recommand = false;
            }

            this.activities.push(element);
          });
          if (result.data.rows.length <= 0) {
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }


          // 准备微信分享内容
          if (isExplorer('micromessenger')) {
            this.userService.weixinShare({title: this.sponsor.sponsorName,
              desc: this.sponsor.sponsorIntro,
              link: window.location.href,
              imgUrl: this.baseUrl + this.sponsor.sponsorLogo
            });
          }

        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
        // console.log(this.activities);
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; },
    );
  }

  scrollBottom(e: any) {
    // console.log(e);
    const offsetH = e.target.offsetHeight;
    const scrollT = e.target.scrollTop;
    const height = e.target.scrollHeight;
    // div 距离底部 = 列表的总高度 -（滚动的距离 + 窗口可视高度）
    const bottom = height - (scrollT + offsetH);
    if (bottom < 10 && !this.showProgress && !this.toEnd) {
      // console.log('到底了');
      this.getActivities();
    }
  }

  detail(activity: any) {
    console.log('dd');
    this.router.navigate([this.urlDefine.publicActivity, activity.activityId]);
  }

  likeSponsor(event: any) {

    this.showProgress = true;
    this.userService.post(baseConfig.toggleFavi, {sponsorId: this.sponsor.sponsorId}).subscribe(
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
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; },
    );

    event.stopPropagation();
  }


}
