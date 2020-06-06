import { Component, OnInit, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import {
   faHeart,  faSquare, faCalendarAlt, faBookmark, faMapMarkerAlt, faCircle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

import { convertDateFromString, getAndSavePath, isExplorer } from 'src/app/ts/base-utils';
import { MatSnackBar } from '@angular/material';
import { Region } from 'src/app/ts/region';
import { windowToggle } from 'rxjs/operators';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-public-list',
  templateUrl: './public-list.component.html',
  styleUrls: ['./public-list.component.css']
})
export class PublicListComponent implements OnInit {

  
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

  activities: any[] = [];

  constructor(
    private el: ElementRef,
    private userService: UserService,
    private commandService: CommandService, 
    public snackBar: MatSnackBar,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private region: Region
  ) { }


  ngOnInit() {

    getAndSavePath(this.activeRoute);

    const favListStr = window.localStorage.getItem('favList');
    if ( favListStr !== null && favListStr !== undefined)
    {
      this.favSponsorGroup = favListStr.split(',');
    }

    // 为了解决angular的检查机制
    setTimeout(() => {
      this.commandService.setMessage(3);
      this.getActivities();
    }, 100);

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
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.publicActivityList, this.query).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
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

            if (this.favSponsorGroup.indexOf(element.sponsor.sponsorId+'') < 0){
              element.sponsor.like = false ;
            } else {
              element.sponsor.like = true;
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
            this.userService.weixinShare({title: 'MICS SaaS 会展服务平台',
              desc: 'xfunction.cn内的工具多为作者工作和学习历程所提炼所得（固网站中文名为“读书笔记”），具有实用性强、无使用门槛和在线使用的特点，同时与移动互联网的环境做了必要的整合。',
              link: window.location.href,
              imgUrl: environment.web + '/assets/images/trans-black-simple-logo.png'
            });
          }

        } else {
          this.userService.showError1(result, () => {this.getActivities(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
        // console.log(this.activities);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.getActivities();});
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
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

  detail(activity: any) {
    if (activity.isAd) {
      window.open(activity.activityTags, '_blank');
    } else {
      this.router.navigate([this.urlDefine.publicActivity, activity.activityId]);
    }
  }

  likeSponsor(event: any, activity: any) {

    console.log('likeSponsor method');
    console.log(this.favSponsorGroup);

    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.toggleFavi, {sponsorId: activity.sponsor.sponsorId}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // 先删除
          const index = this.favSponsorGroup.indexOf(activity.sponsor.sponsorId+'');
          this.favSponsorGroup.splice(index, 1);
          // 再决定是否增加还是删除
          if (result.data) { // 增加
            this.favSponsorGroup.push(activity.sponsor.sponsorId+'');
            activity.sponsor.like = true;
          } else { // 去除
            activity.sponsor.like = false;
          }
          window.localStorage.setItem('favList', this.favSponsorGroup.toString());
        } else {
          this.userService.showError1(result, () => { this.likeSponsor(event, activity); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.likeSponsor(event, activity); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );

    event.stopPropagation();
  }

  toSponsor(event:any, activity: any){

    this.router.navigate([urlDefine.sponsorActivityList, activity.sponsor.sponsorId]);

    event.stopPropagation();
  }

  test(){
    
  }

}
