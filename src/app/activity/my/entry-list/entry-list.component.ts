import { Component, OnInit } from '@angular/core';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatBottomSheet, MatDialog } from '@angular/material';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import {
  faHeart, faSquare, faCalendarAlt, faBookmark, faMapMarkerAlt, faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { EntryListBottomComponent } from './entry-list-bottom/entry-list-bottom.component';
import { convertDateFromString, getAndSavePath } from 'src/app/ts/base-utils';
import { Region } from 'src/app/ts/region';
import { EntryListDialogComponent } from './entry-list-dialog/entry-list-dialog.component';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  title = '我的报名';
  baseUrl = environment.media + '/activity/images';


  // 控制活动大图显示
  windowWidth: number;
  headWidth: any;

  // http相关
  showProgress = false;
  toEnd = false;
  query: PageQuery = { offset: 0, limit: 10 };

  // 图标
  faCircle = faCircle;
  faCalendarAlt = faCalendarAlt;
  faHeart = faHeart;
  faBookmark = faBookmark;
  faMapMarkerAlt = faMapMarkerAlt;
  farHeart = farHeart;

  // 主体
  entries: any[] = [];


  constructor(
    private userService: UserService,
    private router: Router,
    private region: Region,
    public dialog: MatDialog,
    private activeRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {
    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };
    this.getMyEntries();
  }

  resetWindow() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 800) {
      this.headWidth = (800) * 4 / 16 + 'px';
    } else {
      this.headWidth = (this.windowWidth) * 4 / 16 + 'px';
    }
  }

  getMyEntries() {
    this.showProgress = true;
    this.userService.post(baseConfig.entryMyList, this.query).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          // console.log(result);
          result.data.rows.forEach(element => {

            if (convertDateFromString(element.activity.activityEnd) < new Date()) {
              element.activity.expired = true;
            } else {
              element.activity.expired = false;
            }
            element.activity.activityArea = this.region.getName(element.activity.activityArea);

            this.entries.push(element);
          });
          if (result.data.rows.length <= 0) {
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
      this.getMyEntries();
    }
  }

  showBottom(entry: any) {
    const bottomSheetRef = this.bottomSheet.open(EntryListBottomComponent, { data: { para: entry } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      switch (bottomSheetRef.instance.operType) {
        case 1: // view
          this.router.navigate([urlDefine.publicActivity, entry.activityId]);
          break;
        case 2: // 出示
          this.showDialog(entry, 2);
          break;
        case 3: // 扫码
          this.showDialog(entry, 3);
          break;
        case 4: // 自主
          //  当前地址，和报名id,向服务器请求信息。1、服务器判断当前时间是否活动结束；2、用户是否存在有效票种 3、位置是地址范围2公里内。
          break;
        case 5: // 取消
          this.cancelEntry(entry);
          break;
        default:
          break;
      }
    }
    );
  }

  showDialog(entry: any, type: number) {

    const dialogRef = this.dialog.open(EntryListDialogComponent, {
      // height: '400px',
      // width: '90%',
      data: { entry, type }
    });
    dialogRef.afterClosed().subscribe((result: any) => { });
  }

  cancelEntry(entry: any) {
    this.showProgress = true;
    this.userService.post(baseConfig.entryMyCancel, {entryId: entry.entryId}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          entry.cancel = 'Cancel';
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; }
    );
  }

}
