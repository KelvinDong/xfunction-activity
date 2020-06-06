import { Component, OnInit, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import { urlDefine, baseConfig } from 'src/app/ts/base-config';
import { MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Region } from 'src/app/ts/region';
import { getAndSavePath } from 'src/app/ts/base-utils';
import {
  faHeart,  faSquare, faCalendarAlt, faBookmark, faMapMarkerAlt, faCircle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.css']
})
export class SponsorListComponent implements OnInit {

  title = '我的关注';
  showProgress = false;
  toEnd = false;
  favSponsorGroup: string[] = [];

  baseUrl = environment.media + '/activity/images';
  query: PageQuery = { offset: 0, limit: 10 };

  // 图标
  faCircle = faCircle;
  faCalendarAlt = faCalendarAlt;
  faHeart = faHeart;
  faBookmark = faBookmark;
  faMapMarkerAlt = faMapMarkerAlt;
  farHeart = farHeart;

  // url定义
  urlDefine = urlDefine;

  sponsors: any[] = [];

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

    this.favSponsorGroup = [];
    setTimeout(() => {
      this.getSponsors();
      this.commandService.setMessage(3);
    }, 100);
    
  }

  getSponsors() {
    this.commandService.setMessage(1);
    this.showProgress = true;
    this.userService.post(baseConfig.myFaviList, this.query).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {

          result.data.rows.forEach(element => {
            this.favSponsorGroup.push(element.sponsorId + '');
            element.like = true;
            this.sponsors.push(element);
          });

          window.localStorage.setItem('favList', this.favSponsorGroup.toString());

          if (result.data.rows.length <= 0) {
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
        } else {
          this.userService.showError1(result, () => { this.getSponsors(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
        // console.log(this.activities);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.getSponsors(); });
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
      this.getSponsors();
    }
  }

  likeSponsor(event: any, sponsor: any) {
    this.commandService.setMessage(1);
    this.showProgress = true;
    this.userService.post(baseConfig.toggleFavi, {sponsorId: sponsor.sponsorId}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // 先删除
          const index = this.favSponsorGroup.indexOf(sponsor.sponsorId+'');
          this.favSponsorGroup.splice(index, 1);
          // 再决定是否增加还是删除
          if (result.data) { // 增加
            this.favSponsorGroup.push(sponsor.sponsorId+'');
            sponsor.like = true;
          } else { // 去除
            sponsor.like = false;
          }
          window.localStorage.setItem('favList', this.favSponsorGroup.toString());
        } else {
          this.userService.showError1(result, () => { this.likeSponsor(event, sponsor); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.likeSponsor(event, sponsor); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );

    event.stopPropagation();
  }

  toSponsorActivityList(sponsor){
    this.router.navigate([urlDefine.sponsorActivityList, sponsor.sponsorId]);
  }

}
