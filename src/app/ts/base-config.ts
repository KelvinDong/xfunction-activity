import { environment } from 'src/environments/environment';

export const baseConfig = {
    getAuthImage: '/slide/get',
    vertifyAuthImage: '/slide/vertify',
    userBaseRegister: '/user/base/register',
    userBaseLogin: '/user/base/login',
    userGet: '/user/base/get',
    userChangeAuth: '/user/base/changeAuth',
    userUpdateResume: '/user/base/updateResume',
    headPic: '/user/base/picUser',

    sendLoginCode: '/user/base/sendLoginCode',
    userLogin: '/user/base/userLogin',

    sendBindCode: '/user/base/sendBindCode',
    activeMobile: '/user/base/activeMobile',
    sendChangeCode: '/user/base/sendChangeCode',
    sendResetCode: '/user/base/sendResetCode',
    resetUser: '/user/base/resetUser',

    getWxParam: '/user/base/getWxJsParam',
    getWx2Param: '/user/base/getWx2JsParam',

    formMyAddUpdate: '/activity/base/addUpdateMyForm',
    formMyList: '/activity/base/listMyForm',
    formMyGet: '/activity/base/getMyForm',
    ticketMyAddUpdate: '/activity/base/addUpdateMyTicket',
    ticketMyList: '/activity/base/listMyTicket',

    activityMyAddUpdate: '/activity/main/addUpdateMyActivity',
    activityUpPic: '/activity/main/uploadPic',
    activityMyList: '/activity/main/listMyActivity',
    activityMyGet: '/activity/main/getMyActivityTemp',
    activityMyApply: '/activity/main/applyMyActivity',
    activityMyEntryList: '/activity/main/listMyActivityEntries',
    activityMyEntryDl: '/activity/main/dlMyActivityEntries',
    activityMyEntryTempleDl: '/activity/main/dlMyActivityEntriesTemple',
    activityMyEntrySign: '/activity/main/sign', // 代签到
    activityMyEntryCancel: '/activity/main/cancel',  // 代取消
    activityImportEntry: '/activity/main/importEntry',

    activityMyLotterySettings: '/activity/main/saveLotterySettings',
    activityMyLotterySettingsGet: '/activity/main/getLotterySettings',
    activityMyLotteryEntries: '/activity/main/getLotteryEntries',
    activityMyLotteryResultSave: '/activity/main/saveLotteryResult',
    activityMyLotteryResultGet: '/activity/main/getLotteryResults',
    activityMyLotteryResultDl: '/activity/main/dlLotteryResults',

    activityMyLotterySettingsDemo: '/activity/demo/saveLotterySettings',
    activityMyLotterySettingsGetDemo: '/activity/demo/getLotterySettings',
    activityMyLotteryEntriesDemo: '/activity/demo/getLotteryEntries',
    activityMyLotteryResultSaveDemo: '/activity/demo/saveLotteryResult',
    activityMyLotteryResultGetDemo: '/activity/demo/getLotteryResults',
    activityMyLotteryResultDlDemo: '/activity/demo/dlLotteryResults',
    ticketMyListDemo: '/activity/demo/listMyTicket',
    activityUpPicDemo: '/activity/demo/uploadPic',

    activityComments: '/activity/main/listActivityComment',
    activityCommentDel: '/activity/main/applyComment', // 复用回答接口
    activityCommentReplay: '/activity/main/applyComment',

    delMyComment: '/activity/main/delMyComment',
    listMyComment: '/activity/main/listMyComment',
    publishComment: '/activity/main/publishComment',

    entryMyList: '/activity/main/listMyEntry',   // 我的报名
    entryMyAdd: '/activity/main/addMyEntry',
    entryMyCancel: '/activity/main/cancelMyEntry',

    signPerson: '/activity/main/signPerson',
    signActivity: '/activity/main/signActivity',

    publicActivityList: '/activity/public/getActivityList',
    publicActivity: '/activity/public/getActivity',
    getPublicComments: '/activity/public/getPublicComments',

    sponsorActivityList: '/activity/public/getSponsorActivityList',

    toggleFavi: '/activity/base/toggleFavi',
    myFaviList: '/activity/base/myFaviList',
    sponsorGet: '/activity/base/getSponsor',
    sponsorSet: '/activity/base/setSponsor',
    sponsorPic: '/activity/base/picSponsor',


    questionnaireFormGet: '/tools/main/getMyQuestionnaire',   // 限自己的
    questionnaireFormAddUpdate: '/tools/main/setQuestionnaire',
    questionnaireUpPic: '/tools/main/uploadPic',
    questionnaireFormList: '/tools/main/listMyQuestionnaire',
    questionnairePublic: '/tools/main/getPublicQuestionnaire',
    questionnaireAddEntry: '/tools/main/addQuestionnaireEntry',
    questionnaireListEntry: '/tools/main/getQuestionnaireEntries',
    questionnaireDlEntry: '/tools/main/dlQuestionnaireEntries',

    toolGet: '/user/tool/getSettings',
    toolSet: '/user/tool/setSettings',

    activityMyWallSettingsGet: '/activity/main/getWallSetting'
  };

export const urlDefine = {
    indexUrl: 'activity/public/public-list',

    // user
     loginUrl: 'user/login',
     registerUrl: 'user/register',
    myUrl: 'user/my',
     forgetPwd : 'user/forget-pwd',

    createFrom: 'activity/my/create-form',
    createActiviry: 'activity/my/create-activity',
    listFrom: 'activity/my/form-list',
    listActivity: 'activity/my/activity-list',
    activityEntries: 'activity/my/activity-entries',
    myEntries: 'activity/my/entry-list',
    signByWx: 'activity/my/sign-wx',
    myFaviList: 'activity/my/favi-sponsors',
    myComments: 'activity/my/my-comments',
    activityComments: 'activity/my/activity-comments',
    sponsor: 'activity/my/sponsor',
    lotterySettings: 'activity/my/entry-lottery',

    publicActivity: 'activity/public/activity-detail',
    publicActivityList: 'activity/public/public-list',
    sponsorActivityList: 'activity/public/sponsor-activity-list',

    myQuesttionnaires: 'tools/questionnaire-list',
    myGinfos: 'tools/ginfo-list',
    myQuesttionnaire: 'tools/questionnaire-create',
    myGinfo: 'tools/ginfo-create',
    publicQuestionnaire: 'tools/questionnaire-public',
    questionnaireEntryList: 'tools/questionnaire-entry-list',

    rotate: 'tools/rotate',

    wall: 'activity/my/checkin-demo',
  };

export const regDefine = {
  userName: /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/,
  password: /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z]{1,})(?=.*[a-z]{1,})(?=.*[~!@#$%^&*()\\_+`\-={}:";'<>?,\[\] .\/]).*$/,
  activityName: /^.{6,50}$/,
  datetime: /^[1-9]\d{3}-(0[1-9]|1[0-2]|[1-9])-(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])\s(20|21|22|23|[0-1]\d|\d):([0-5]\d|\d)$/,
  date: /^[1-9]\d{3}-(0[1-9]|1[0-2]|[1-9])-(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])$/,
  time: /^(20|21|22|23|[0-1]\d|\d):([0-5]\d|\d)$/,
  address: /^.{2,125}$/,
  ticketName: /^.{1,25}$/,
  ticketRemark: /^[\s\S]{6,125}$/,
  ticketNumber: /^\d{1,3}$/,
  formName: /^.{1,25}$/,

  // 个人基本信息用于填报  可以为空
  resume: /^$|^.{2,45}$/,
  birth: /^$|^[1-9]\d{3}-(0[1-9]|1[0-2]|[1-9])-(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])$/,
  mobile: /^$|^1\d{10}$/,
  email: /^$|^.+@.+$/, // 简单判断

  sponsorName: /^.{2,45}$/,
  sponsorIntro: /^[\s\S]{6,512}$/,
  mobileCode: /^$|^\d{4}$/,

  comment: /^[\s\S]{6,500}$/,

  biggerThanZero : /^[1-9]\d*/,
  zeroThanFive: /^[0|5-9]$|^[1-9]\d+$/,

  questionnaireName: /^.{6,50}$/,
  questionnaireIntro: /^[\s\S]{1,1000}$/,

  rotateSettingName: /^.{0,8}$/,
  rotateSettingWeight: /^([0-9]|[1-9][0-9][0-9]|[1-9][0-9])$/,

};

export const lsDefine = {
  userInfo: 'userInfo',
  redirectUrl: 'redirectUrl'
};

export const constant = {
  sidebarDemoLinks: [
      {
          label: 'Item 1 (with Font awesome icon)',
          svgIcon: 'psychology',
          activeSvgIcon: 'activePsychology',
          items: [
              {
                  label: 'Alter Configurations',
                  faIcon: 'fa fa-address-book',
                  activeFaIcon: 'fa fa-id-card',
                  items: [
                      {
                          label: 'Default',
                          link: '/demo-one',
                          icon: 'favorite',
                          activeIcon: 'favorite_border',
                          disabled: true,

                      },
                      {
                          label: 'Changing Colours',
                          link: '/demo two',
                          icon: 'favorite_border',
                          activeIcon: 'favorite',
                          navigationExtras: {
                              queryParams: { order: 'popular', filter: 'new' },
                          }
                      },
                      {
                          label: 'Changing Padding',
                          link: '/demo/12',
                          icon: 'favorite_border',
                          activeIcon: 'favorite'
                      },
                      {
                          label: 'Changing Background',
                          link: '/demo',
                          imageIcon: '/assets/batman.jpg',
                          activeImageIcon: '/assets/blackpanther.jpg',
                      }
                  ]
              },
              {
                  label: 'Alter Items Array',
                  icon: 'alarm',
                  items: [
                      {
                          label: 'Default',
                          icon: 'favorite'
                      },
                      {
                          label: 'Remote Json',
                          icon: 'favorite_border',
                          disabled: true,
                      },
                      {
                          label: 'Dynamic arrays',
                          icon: 'favorite_border'
                      }
                  ]
              }
          ]
      },
      {
          label: 'NPM',
          icon: 'info_outline',
          link: 'https://www.npmjs.com/package/ng-material-multilevel-menu',
          externalRedirect: true
      }
  ],
  sidebarConfigurations: {
      paddingAtStart: true,
      interfaceWithRoute: true,
      rtlLayout: false,
      collapseOnSelect: true,
      highlightOnSelect: true,
      //listBackgroundColor: `rgb(208, 241, 239)`,
      //fontColor: `rgb(8, 54, 71)`,
      //backgroundColor: `rgb(208, 241, 239)`,
      //selectedListFontColor: `red`,
  },
  appItems: [
      {
        label: '首页',
        icon: 'home',
        url: environment.web + '/html/index.html',
      },
      {
        label: '短链接工具',
        icon: 'link',
        link: '',
        items:[
          {
            label: '短链接生成',
            link: '',
            url: environment.web + '/html/shortLink/index.html',
          },
          {
            label: '短链接还原',
            link: '',
            disabled: true,
          }
        ]
      },
      {
        label: '活动工具',
        icon: 'volume_up',
        items:[
          {
            label: '公开活动',
            link: '/' + urlDefine.publicActivityList
          },
          {
            label: '我的报名',
            items:[
              {
                label: '报名历史',
                link: '/' + urlDefine.myEntries
              },
              {
                label: '评论过往',
                link: '/' + urlDefine.myComments
              },
              {
                label: '我的关注',
                link: '/'+urlDefine.myFaviList
              }
            ]
          },
          {
            label: '我的活动',
            items: [
              {
                label: '活动管理',
                link: '/' + urlDefine.listActivity
              },
              {
                label: '评论管理',
                link: '/' + urlDefine.activityComments
              },
              {
                label: '报名模板',
                link: '/' + urlDefine.listFrom
              },
              {
                label: '主办信息',
                link: '/' + urlDefine.sponsor
              }
            ]
          }
        ]
      },
      {
        label: '市场工具',
        icon: 'assessment',
        items:[
          {
            label: '调查问卷',
            link: '/' + urlDefine.myQuesttionnaires
          },
          {
            label: '信息表单',
            link: '/' + urlDefine.myGinfos
          }
        ]
      },
      {
        label: '大转盘',
        link: '/' + urlDefine.rotate,
        icon: 'rotate_right'
      },
      {
          label: '帮助',
          icon: 'help_outline',
          items: [
              {
                label: '抽奖demo',
                link: '/activity/my/entry-lottery/1',
              },
              {
                label: '签到墙Demo',
                link: '',
                url: '/activity/my/checkin-demo'
              },
              {
                label: '意见反馈',
                link: '/tools/questionnaire-public/2',
            }
          ]
      },
      
      {
          label: 'Item 44',
          link: '/item-4',
          icon: 'star_rate',
          hidden: true
      }
  ]

};

