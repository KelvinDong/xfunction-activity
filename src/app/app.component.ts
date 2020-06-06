import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Result, UserService } from './user/user.service';
import { baseConfig, lsDefine, urlDefine } from './ts/base-config';
import { getUserToken , getUserAvatar, getUserMobile} from './ts/base-utils';
import { MediaMatcher } from '@angular/cdk/layout';
import { environment } from 'src/environments/environment';
import { LoginDialogComponent } from './define/login-dialog/login-dialog.component';
import { MatDialog, MatIconRegistry } from '@angular/material';
import { constant as CONSTANT } from './ts/base-config';
import { MultilevelNodes } from './define/left-menu/multilevel-menu.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommandService } from './user/command.service';

@Component({
  selector: 'app-root',
  // template: `<router-outlet></router-outlet>`,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  // styles:['h1 { font-weight:normal;}']
})
export class AppComponent implements OnInit {

  // 检测 终端屏幕变量
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  progressShow = false;
  navShow = false;

  urlDefine = urlDefine;
  userToken: string;
  userAvatar: string;
  baseUrl = environment.media + '/activity/images';

  appitems: MultilevelNodes[] = CONSTANT.appItems;
  config = CONSTANT.sidebarConfigurations;

  /*
  完成必要的整个项目的初始化工作，如重新获取用户的基本信息，包括token更新
  */
  constructor(
    private userService: UserService,
    // public snackBar: MatSnackBar,
    // private router: Router,
    private commandService: CommandService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    public aboutDialog: MatDialog,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {

    /*
    iconRegistry.addSvgIcon(
      'psychology',
      sanitizer.bypassSecurityTrustResourceUrl('assets/psychology.svg'));
    iconRegistry.addSvgIcon(
      'activePsychology',
      sanitizer.bypassSecurityTrustResourceUrl('assets/brain.svg'));
    */
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    // 订阅指令消息
    this.commandService.messageObserve.subscribe((res: any) => {
      switch (res) {
        case 0: // 隐藏进度条
          this.progressShow = false;
          break;
        case 1: // 显示进度条
          this.progressShow = true;
          break;
        case 2: // 隐藏头
          this.navShow = false;
          /* TODO 隐藏left */
          break;
        case 3: // 显示头
          this.navShow = true;
          /* TODO 显示left */
          break;
        case 4: // 刷新登录项目
          this.userToken = getUserToken();
          this.userAvatar = getUserAvatar();
          break;
        default:
          break;
      }
     });
   }

  ngOnInit() {
    // 更新用户 token
    if (getUserToken()) {
      this.userService.post(baseConfig.userGet, {}).subscribe(
        (data: Result) => {
          const result = { ...data };
          if (result.success) {
            // this.userInfo = result.data;
            window.localStorage.setItem(lsDefine.userInfo, JSON.stringify(result.data));
          } else { // 基本信息不完整 ，转到首页去，
            //this.userService.showError1(result);
            //this.router.navigateByUrl(urlDefine.indexUrl);
          }
          //this.showProgress = false;
        },
        (error: Result) => { // 基本信息不完整 ，转到首页去，
          // this.userService.showError1(error);
          // this.router.navigateByUrl(urlDefine.indexUrl);
          // this.showProgress = false;
        }
      );
    }

    this.userToken = getUserToken();
    this.userAvatar = getUserAvatar();

  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  login() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      // height: '400px',
      // width: '90%',
      data: { userMoble: getUserMobile() }
    });
    /* 不需要特别处理，由sevice 消息处理了
    dialogRef.afterClosed().subscribe((resultData: any) => {
      if (resultData) {
        this.userToken = getUserToken();
        this.userAvatar = getUserAvatar();
      }
    });
    */
  }

  logout() {
    window.localStorage.removeItem(lsDefine.userInfo);
    // 强制导航
    window.location.href = urlDefine.indexUrl;
    // 路由导航不行，如果在当前页就不刷新了
    // this.router.navigateByUrl(urlDefine.indexUrl);
  }

  selectedItem($event) {
    console.log('selectedItem');
    console.log($event);
    if (!$event.link && $event.url){
      window.open($event.url, '_blank');
    }
  }

  selectedLabel($event) {
    console.log('selectedLabel');
    console.log($event);
  }
}
