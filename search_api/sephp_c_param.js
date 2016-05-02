/// <reference path="fhl_api.js" />
/// <reference path="abvphp_api.js" />

var fhl = fhl || {};
var abvphp = abvphp || {};
var sephp = sephp || {};

// 定義 sephp.c_param class ; // 這有一個 sephp.g_param = new c_param(); 全域變數
// 必須先 include fhl (因為會用到 fhl.json fhl.xml)
// 必須先 include abvphp (因為會用到 abvphp.g_bibleversions)
// 必須使用 search_dialog.css

// 小雪 定義 sephp 參數param 的 class c_param
sephp.c_param = function c_param() { };// 定義有一個 class c_param{};

// 小雪 class c_param 的資料變數 (利用 initial_div_ui() 初始化一次)
sephp.c_param.prototype.m_isVisibleSn = false;
sephp.c_param.prototype.m_isVisibleDivRange = false;
sephp.c_param.prototype.m_isVisibleDivRangeDetail = false;
sephp.c_param.prototype.m_isVisibleDivBibleSwitch = false;
sephp.c_param.prototype.m_isAutoBibleVersion = true;
sephp.c_param.prototype.m_range = [];//範圍 true,true,true, false,flase,false
sephp.c_param.prototype.m_bibleversions = [];//目前所選的聖經版本 ...e.g. [和合本,新譯本] ...通常配合 abvphp
sephp.c_param.prototype.m_keywordType = 0;//0: keywords 1: SN 2:Reference
sephp.c_param.prototype.m_keyword = "";//關鍵字
sephp.c_param.prototype.m_userInputType = 0;//0:關鍵字 1:希臘文編號 2:希伯來文編號 (從介面決定的)
sephp.c_param.prototype.divs = {}; //為了this跨function使用的.
sephp.c_param.prototype.m_search_result = {};//
sephp.c_param.prototype.m_isBig5 = true; //false就是gb
sephp.c_param.prototype.m_divDst = null;
/*var CHINESES = ["創", "出", "利", "民", "申", "書", "士", "得",
    "撒上", "撒下", "王上", "王下", "代上", "代下", "拉", "尼",
    "斯", "伯", "詩", "箴", "傳", "歌", "賽", "耶", "哀", "結",
    "但", "何", "珥", "摩", "俄", "拿", "彌", "鴻", "哈", "番",
    "該", "亞", "瑪",
    "太", "可", "路", "約", "徒", "羅", "林前", "林後", "加",
    "弗", "腓", "西", "帖前", "帖後", "提前", "提後", "多",
    "門", "來", "雅", "彼前", "彼後", "約一", "約二", "約三",
    "猶", "啟"];*/
sephp.c_param.prototype.mp_chineses = null;//pointer
//var Vversion = ["unv"]; //Valid bible versions
sephp.c_param.prototype.mp_vversion = null;//pointer
// 下面是一個callback的例子
// var aaa = function fn_search_title_change(text) { };
sephp.c_param.prototype.mpfn_search_title_change = null;
// var aaa = function fn_read_bible(arg1,arg2,arg3){};
// arg1: "創" "出" "利" "民" ...etc, arg2: 1 2 3  (章)....arg3 : 節
sephp.c_param.prototype.mpfn_read_bible = null;


sephp.c_param.prototype.m_search_queue = [];
sephp.c_param.prototype.m_search_idx_already = 0;
sephp.c_param.prototype.m_search_count_next_stop = 100;
sephp.c_param.prototype.m_search_count = 0;

// 小雪 儲存變數 (每次 update_ui 時最後會自存);
sephp.c_param.prototype.save = function save() {
  // Put the object into storage
  var x1 = {
    m_isVisibleSn: this.m_isVisibleSn,
    m_isVisibleDivRange: this.m_isVisibleDivRange,
    m_isVisibleDivRangeDetail: this.m_isVisibleDivRangeDetail,
    m_isVisibleDivBibleSwitch: this.m_isVisibleDivBibleSwitch,
    m_isAutoBibleVersion: this.m_isAutoBibleVersion,
    m_range: this.m_range,
    m_bibleversions: this.m_bibleversions
  };
  localStorage.setItem('sephp_param', JSON.stringify(x1));
};
// 小雪 嘗試讀取變數 (若存在，就載入) ... 在 initial_div_ui 的時候 尾部會呼叫
sephp.c_param.prototype.try_load = function try_load() {
  var x1 = localStorage.getItem('sephp_param');
  if (x1 != null) {
    var x2 = JSON.parse(x1);
    for (var x3 in x2) {
      this[x3] = x2[x3];
    }
  }
};

// 小雪 初始化   // c_param class initial_div_ui function 宣告
sephp.c_param.prototype.initial_div_ui = function initial_div_ui() {
  var pThisClassObj = this;

  {
    var divFrame = document.createElement("div");
    this.divs["seFrame"] = divFrame;
    this.m_divDst.appendChild(divFrame);

    // 處理auto高度
    $(this.divs["seFrame"]).css("position", "relative");
    $(this.divs["seFrame"]).css("top", 0);
    $(this.divs["seFrame"]).css("height", "90%");
    $(this.divs["seFrame"]).css("border", "0");
    $(this.divs["seFrame"]).css("overflow", "auto");
    $(this.divs["seFrame"]).css("border-style", "double");
    $(this.divs["seFrame"]).css("margin-right", "-20px");
    $(this.divs["seFrame"]).css("padding-right", "20px");
    
  }

  {
    var divFrame = document.createElement("div");
    this.divs["seFrameTool"] = divFrame;
    this.divs["seFrame"].appendChild(divFrame);

    $(this.divs["seFrameTool"]).css("white-space", "normal");//不加這行，視窗太窄的時候，會按不到後面的分類。
    //$(this.divs["seFrameTool"]).css("background", '#f6a828 url("ui-bg_gloss-wave_35_f6a828_500x100.png") 50% 50% repeat-x');
    $(this.divs["seFrameTool"]).css("background", '#A0A0A0');
    $(this.divs["seFrameTool"]).css("color", "#ffffff");
    $(this.divs["seFrameTool"]).css("font-weight", "bold");
    $(this.divs["seFrame"]).css("margin-right", "20px");
    // 處理auto高度
    $(this.divs["seFrameTool"]).css("position", "absolute");
    $(this.divs["seFrameTool"]).css("top", "0");
    $(this.divs["seFrameTool"]).css("width", "100%");
    //background: #f6a828 url("ui-bg_gloss-wave_35_f6a828_500x100.png") 50% 50% repeat-x;
    //color: #ffffff;
    //font-weight: bold;
  }

  {
    var divFrame = document.createElement("div");
    this.divs["seFrameBody"] = divFrame;
    this.divs["seFrame"].appendChild(divFrame);

    // 處理auto高度
    $(divFrame).css("overflow-y", "auto");
    $(divFrame).css("margin-right", "-20px");
    $(divFrame).css("padding-right", "20px");
    $(divFrame).css("top", $(this.divs["seFrameTool"]).height);

    
  }

  {
    var divFrame = document.createElement("div");
    this.divs["SearchMore"] = divFrame;
    this.divs["seFrame"].appendChild(divFrame);

    divFrame.innerHTML = "...More...";
    $(this.divs["SearchMore"]).addClass("seSearchMore");
    $(this.divs["SearchMore"]).click(this, function do_continue_search_more(fn) {
      //fn.data.m_isVisibleSn = !fn.data.m_isVisibleSn;
      fn.data.do_next_search();
    });

    $(this.divs["SearchMore"]).css("position", "relative");
    $(this.divs["SearchMore"]).css("width", "100%");
    $(this.divs["SearchMore"]).css("top", $(this.divs["seFrameTool"]).height);
    $(this.divs["SearchMore"]).addClass("seSearchMoreNone");
    //$(this.divs["seFrameBody"]).css("max-height", $(this.divs["seFrame"]).height() - $(this.divs["seFrameTool"]).height() - 0);
    //$(this.divs["SearchMore"]).css("display", "none");
    
  }

  //seFrameTool
  {
    var divFrame = this.divs["seFrameTool"];
    //seFrameTool 大架構
    {
      var div_main_menu = document.createElement('div');
      this.divs["主選單"] = div_main_menu;
      divFrame.appendChild(div_main_menu);

      var div_range_select = document.createElement('div');
      this.divs["範圍選單_總"] = div_range_select;
      divFrame.appendChild(div_range_select);

      var div_range_select_range = document.createElement('div');
      this.divs["範圍選單_略"] = div_range_select_range;
      div_range_select.appendChild(div_range_select_range);

      var div_range_select_detail = document.createElement('div');
      this.divs["範圍選單_細"] = div_range_select_detail;
      div_range_select.appendChild(div_range_select_detail);

      var div_bible_select = document.createElement('div');
      this.divs["聖經版本選單"] = div_bible_select;
      divFrame.appendChild(div_bible_select);
    }//seFrameTool 大架構

    {
      for (var idx in this.mp_chineses )//初始是全本聖經
        this.m_range[idx] = true;
    }

    // 輸入方塊 keyword2
    {
      var keywordinput = document.createElement('input');
      keywordinput.id = "keyword2";
      keywordinput.type = "text";
      keywordinput.value = "";
      div_main_menu.appendChild(keywordinput);
      this.divs["keyword2"] = keywordinput;
      //event:killfocus 
      $(keywordinput).focusout(this, function keywordinput(fn) {
        //$(document.getElementById("keyword")).val($(this).val());
        fn.data.m_keyword = $(this).val();
      });
      //event:keypress (enter)
      $(keywordinput).keypress(this, function keypress(fn) {
        if (fn.which == 13) {
          //$(document.getElementById("keyword")).val($(this).val());
          fn.data.m_keyword = $(this).val();
          fn.data.do_search();

          // 簡體也ok
          //console.debug("fn.data.m_keyword");
          //console.log(fn.data.m_keyword);
        }
      });
    }// 輸入方塊 keyword2

    // SN開關 button
    {
      var divBtn = document.createElement('div');
      divBtn.innerHTML = "SN開關";
      this.divs["SN開關"] = divBtn; //別的函式的時候要取就很方便
      divBtn.setAttribute('class', 'search_type');
      this.divs["主選單"].appendChild(divBtn);

      //event:click
      $(divBtn).click(this, function SN開關click(fn) {
        fn.data.m_isVisibleSn = !fn.data.m_isVisibleSn;
        fn.data.do_search();
      });
      
    }// SN開關 button

    // 查詢 button
    {
      var divBtn = document.createElement('div');
      divBtn.innerHTML = "查詢";
      this.divs["查詢"] = divBtn;
      divBtn.setAttribute('class', 'search_type');
      this.divs["主選單"].appendChild(divBtn);

      //event:click
      $(divBtn).click(this, function click查詢(fn) {
        fn.data.m_isVisibleDivBibleSwitch = false;
        fn.data.m_isVisibleDivRange = false;
        fn.data.do_search();
        //fn.data.do_next_search();
      });
    }// 查詢 button

    // 搜尋範圍 Btn (顯示/隱藏)切換
    {
      divBtn = document.createElement('div');
      divBtn.innerHTML = "搜尋範圍";
      this.divs["搜尋範圍"] = divBtn;
      divBtn.setAttribute('class', 'search_type');
      this.divs["主選單"].appendChild(divBtn);

      //event:click
      $(divBtn).click(this, function (fn) {
        fn.data.m_isVisibleDivRange = !fn.data.m_isVisibleDivRange;

        // 減少顯示所需空間
        // 「要切換聖經範圍」，就自動將「切換譯本」…貼心。
        if (fn.data.m_isVisibleDivRange == true && fn.data.m_isVisibleDivBibleSwitch == true)
          fn.data.m_isVisibleDivBibleSwitch = false;

        fn.data.update_div_ui();
      });
    }// 搜尋範圍 Btn (顯示/隱藏)切換

    // 聖經版本 button
    {
      divBtn = document.createElement('div');
      divBtn.innerHTML = "聖經版本";
      this.divs["聖經版本"] = divBtn;
      divBtn.setAttribute('class', 'search_type');
      this.divs["主選單"].appendChild(divBtn);

      //event:click
      $(divBtn).click(this, function (fn) {
        var pthis = fn.data;
        pthis.m_isVisibleDivBibleSwitch = !pthis.m_isVisibleDivBibleSwitch;
        if (pthis.m_isVisibleDivBibleSwitch == true && pthis.m_isVisibleDivRange == true)
          pthis.m_isVisibleDivRange = false;
        pthis.update_div_ui();
      });
    }// 聖經版本 button

    {
      var div_range_select_range = this.divs["範圍選單_略"];
      // 整本聖經 舊約 新約 摩西五經 ...
      for (var key in fhl.g_book_group) {
        var divEach = document.createElement('div');
        divEach.innerHTML = key;
        divEach.setAttribute('class', 'search_type');
        div_range_select_range.appendChild(divEach);

        // event:click defined 
        $(divEach).click(this, function (fn) {
          var pthis = fn.data;
          // 當範圍選擇細項開啟、或隱藏，功能就差很多了。

          // Case1: 當範圍選擇細項開啟：將所選的，累加到範圍內。
          if (pthis.m_isVisibleDivRangeDetail == true) {
            var strKey = $(this).text();//創 出 利...
            var arrayIdx = fhl.g_book_group[strKey];
            for (var idx in arrayIdx) {
              pthis.m_range[arrayIdx[idx]] = true;
            }
            pthis.update_div_ui();

            fn.data.do_search(); //說想自動搜尋 (後來說，就算細節開著，也想自動搜尋)
          }// end// Case1: 當範圍選擇細項開啟：將所選的，累加到範圍內。
          else //case2: 當範圍選擇細項關閉時：以此為範圍，查詢
          {
            for (var idx in pthis.m_range)//all false
              pthis.m_range[idx] = false;
            //true
            var strKey = $(this).text();//創 出 利...
            var arrayIdx = fhl.g_book_group[strKey];
            for (var idx in arrayIdx) {
              pthis.m_range[arrayIdx[idx]] = true;
            }
            pthis.update_div_ui();
            pthis.do_search();
          }
        });
      }

      var divBtnOpenDetail = document.createElement('div');
      divBtnOpenDetail.innerHTML = "各別選取";
      this.divs["各別選取"] = divBtnOpenDetail;
      divBtnOpenDetail.setAttribute('class', 'search_type');
      //event:click
      $(divBtnOpenDetail).click(this, function (fn) {
        fn.data.m_isVisibleDivRangeDetail = !fn.data.m_isVisibleDivRangeDetail;
        fn.data.update_div_ui();
      });
      div_range_select_range.appendChild(divBtnOpenDetail);

      var divBtnBibleCancelAll = document.createElement('div');
      divBtnBibleCancelAll.innerHTML = "取消選取";
      divBtnBibleCancelAll.setAttribute('class', 'search_type');
      //event:click
      $(divBtnBibleCancelAll).click(this, function (fn) {
        for (var idx in fn.data.m_range)
          fn.data.m_range[idx] = false;
        fn.data.update_div_ui();
      });
      div_range_select_range.appendChild(divBtnBibleCancelAll);

      var div_range_select_detail = this.divs["範圍選單_細"];
      // 創 出 利 民 申 ... 
      for (var idx in this.mp_chineses) {
        var divEach = document.createElement('div');
        divEach.innerHTML = this.mp_chineses[idx];

        //display:inline-block
        $(divEach).css("display", "inline-block");
        $(divEach).addClass("search_type");
        
        $(divEach).click(this, function (fn) {
          var divstr = $(this).text();
          var idx = fn.data.mp_chineses.indexOf(divstr);
          if (idx == -1) console.debug("idx不可能為-1,有bug.");
          fn.data.m_range[idx] = !fn.data.m_range[idx];
          fn.data.update_div_ui();

          fn.data.do_search(); //說想自動搜尋
        });
        div_range_select_detail.appendChild(divEach);
      }
    }// 初始化 查詢範圍 內容

    // 初始化 聖經版本 內容
    {
      var div_bible_select = this.divs["聖經版本選單"];
      // 版本
      divBtn = document.createElement('div');
      divBtn.innerHTML = "自動同步";
      divBtn.setAttribute('class', 'search_type');
      //div_bible_select.appendChild(divBtn);
      this.divs["自動同步"] = divBtn; //別的函式的時候要取就很方便
      //event:click defined 自動同步
      $(divBtn).click(this, function (fn) {
        fn.data.m_isAutoBibleVersion = !fn.data.m_isAutoBibleVersion;
        fn.data.update_div_ui();
      });
      for (var idx in abvphp.g_bibleversions) // 和合本 新譯本 ... etc.
      {
        // 略過版本 add 2015.06.10
        // unv 和合本, recover 恢復本 , wlunv 文理和合本
        var val = abvphp.g_bibleversions[idx];
        var is_ok_version = ['unv', 'recover', 'wlunv', 'ddv', 'cbol', 'kjv', 'bbe', 'web', 'asv', 'bhs', 'nwh', 'lxx'];
        var ok_idx = is_ok_version.indexOf(val.book);
        if (ok_idx == -1)
          continue;

        divBtn = document.createElement('div');
        divBtn.innerHTML = idx;
        divBtn.setAttribute('class', 'search_type');
        div_bible_select.appendChild(divBtn);
        //event:click event
        $(divBtn).click(this, function (fn) {
          var pthis = fn.data;
          var strKey = $(this).text();
          var idxKey = pthis.m_bibleversions.indexOf(strKey);
          if (idxKey == -1)
            pthis.m_bibleversions.push(strKey);
          else
            pthis.m_bibleversions.splice(idxKey, 1);
          pthis.m_isAutoBibleVersion = false;
          pthis.update_div_ui();
        });
      }

      {
        var vversionStr = localStorage.getItem("version");
        if (vversionStr != null && vversionStr.length != 0) {
          var vversion = vversionStr.split(",");
          this.m_bibleversions = []; //clear(); // for this.m_isAutoBibleVersion
          for (var idx in vversion) {
            var strBook = vversion[idx];
            for (var key in abvphp.g_bibleversions)//找對應的聖經
            {
              if (abvphp.g_bibleversions[key]["book"] == strBook) {
                this.m_bibleversions.push(key);
                break;
              }
            }//找對應的聖經
          }
        }
        else {
          if (this.m_bibleversions.length == 0 || this.m_isAutoBibleVersion == true) {
            this.m_bibleversions = []; //clear(); // for this.m_isAutoBibleVersion
            for (var idx in this.mp_vversion) {
              var strBook = this.mp_vversion[idx];
              for (var key in abvphp.g_bibleversions) {
                if (abvphp.g_bibleversions[key]["book"] == strBook) {
                  this.m_bibleversions.push(key);
                  break;
                }
              }
            }
          }
        }
      }
    }

    
  }//seFrameTool

  this.try_load();
  this.update_div_ui();

  return;

  //$("#search_result").dialog({ title: '', autoOpen: false });
  //var divSearch = document.getElementById("search_result");
  //{// 放在 title 的方式
  //  var divSearchTitle = divSearch.previousElementSibling.getElementsByClassName("ui-dialog-title")[0];
  //  divSearchTitle.innerHTML = "<div id='search_dlg_title'></div>";
  //  $("#search_dlg_title").css("white-space", "normal");//不加這行，視窗太窄的時候，會按不到後面的分類。
  //  this.divs["DialogTitleBar"] = document.getElementById("search_dlg_title");
  //  this.divs["DialogTitleBar"].innerHTML = "";
  //}
  //{//不放在 title 的方式
  //  //$(divSearch.previousElementSibling).css("display","none");
  //  this.divs["TitleBar"] = divSearch.previousElementSibling;
  //  var divSearchTitle = document.createElement("div");
  //  divSearch.parentNode.insertBefore(divSearchTitle, divSearch);
  //  divSearchTitle.id = "search_title";
  //  $("#search_title").css("white-space", "normal");//不加這行，視窗太窄的時候，會按不到後面的分類。

  //  var divSearchContinue = document.createElement("div");
  //  divSearch.parentNode.appendChild(divSearchContinue);
  //  divSearchContinue.id = "do_continue_search";
  //  divSearchContinue.innerHTML = "...More...";
  //  this.divs["SearchMore"] = divSearchContinue;
  //  $("#do_continue_search").addClass("seSearchMore");
  //  $("#do_continue_search").click(this, function do_continue_search_more(fn) {
  //    //fn.data.m_isVisibleSn = !fn.data.m_isVisibleSn;
  //    fn.data.do_next_search();
  //  });
  //}


  //var div_main_menu = document.createElement('div');
  //this.divs["主選單"] = div_main_menu;
  //divSearchTitle.appendChild(div_main_menu);

  //var div_range_select = document.createElement('div');
  //this.divs["範圍選單_總"] = div_range_select;
  //divSearchTitle.appendChild(div_range_select);

  //var div_range_select_range = document.createElement('div');
  //this.divs["範圍選單_略"] = div_range_select_range;
  //div_range_select.appendChild(div_range_select_range);

  //var div_range_select_detail = document.createElement('div');
  //this.divs["範圍選單_細"] = div_range_select_detail;
  //div_range_select.appendChild(div_range_select_detail);

  //var div_bible_select = document.createElement('div');
  //this.divs["聖經版本選單"] = div_bible_select;
  //divSearchTitle.appendChild(div_bible_select);

  //for (var idx in CHINESES)//初始是全本聖經
  //  this.m_range[idx] = true;

  //var keywordinput = document.createElement('input');
  //keywordinput.id = "keyword2";
  //keywordinput.type = "text";
  //div_main_menu.appendChild(keywordinput);
  //this.divs["keyword2"] = keywordinput;
  ////event:killfocus 
  //$(keywordinput).focusout(this, function keywordinput(fn) {
  //  $(document.getElementById("keyword")).val($(this).val());
  //  fn.data.m_keyword = $(this).val();
  //});
  ////event:keypress (enter)
  //$(keywordinput).keypress(this, function keypress(fn) {
  //  if (fn.which == 13) {
  //    $(document.getElementById("keyword")).val($(this).val());
  //    fn.data.m_keyword = $(this).val();
  //    fn.data.do_search();

  //    // 簡體也ok
  //    //console.debug("fn.data.m_keyword");
  //    //console.log(fn.data.m_keyword);
  //  }
  //});


  //var divBtn = document.createElement('div');
  //divBtn.innerHTML = "SN開關";
  //this.divs["SN開關"] = divBtn; //別的函式的時候要取就很方便
  //divBtn.setAttribute('class', 'search_type');
  ////event:click
  //$(divBtn).click(this, function SN開關click(fn) {
  //  fn.data.m_isVisibleSn = !fn.data.m_isVisibleSn;
  //  fn.data.do_search();
  //});
  //div_main_menu.appendChild(divBtn);

  //divBtn = document.createElement('div');
  //divBtn.innerHTML = "查詢";
  //this.divs["查詢"] = divBtn;
  //divBtn.setAttribute('class', 'search_type');
  //div_main_menu.appendChild(divBtn);

  ////event:click
  //$(divBtn).click(this, function click查詢(fn) {
  //  fn.data.m_isVisibleDivBibleSwitch = false;
  //  fn.data.m_isVisibleDivRange = false;
  //  fn.data.do_search();
  //  //fn.data.do_next_search();
  //});

  //divBtn = document.createElement('div');
  //divBtn.innerHTML = "搜尋範圍";
  //this.divs["搜尋範圍"] = divBtn;
  //divBtn.setAttribute('class', 'search_type');
  //div_main_menu.appendChild(divBtn);
  ////event:click
  //$(divBtn).click(this, function (fn) {
  //  fn.data.m_isVisibleDivRange = !fn.data.m_isVisibleDivRange;

  //  // 減少顯示所需空間
  //  // 「要切換聖經範圍」，就自動將「切換譯本」…貼心。
  //  if (fn.data.m_isVisibleDivRange == true && fn.data.m_isVisibleDivBibleSwitch == true)
  //    fn.data.m_isVisibleDivBibleSwitch = false;

  //  fn.data.update_div_ui();
  //});

  //divBtn = document.createElement('div');
  //divBtn.innerHTML = "聖經版本";
  //this.divs["聖經版本"] = divBtn;
  //divBtn.setAttribute('class', 'search_type');
  ////event:click
  //$(divBtn).click(this, function (fn) {
  //  var pthis = fn.data;
  //  pthis.m_isVisibleDivBibleSwitch = !pthis.m_isVisibleDivBibleSwitch;
  //  if (pthis.m_isVisibleDivBibleSwitch == true && pthis.m_isVisibleDivRange == true)
  //    pthis.m_isVisibleDivRange = false;
  //  pthis.update_div_ui();
  //});
  //div_main_menu.appendChild(divBtn);

  //// 整本聖經 舊約 新約 摩西五經 ...
  //for (var key in fhl.g_book_group) {
  //  var divEach = document.createElement('div');
  //  divEach.innerHTML = key;
  //  divEach.setAttribute('class', 'search_type');
  //  div_range_select_range.appendChild(divEach);

  //  // event:click defined 
  //  $(divEach).click(this, function (fn) {
  //    var pthis = fn.data;
  //    // 當範圍選擇細項開啟、或隱藏，功能就差很多了。

  //    // Case1: 當範圍選擇細項開啟：將所選的，累加到範圍內。
  //    if (pthis.m_isVisibleDivRangeDetail == true) {
  //      var strKey = $(this).text();//創 出 利...
  //      var arrayIdx = fhl.g_book_group[strKey];
  //      for (var idx in arrayIdx) {
  //        pthis.m_range[arrayIdx[idx]] = true;
  //      }
  //      pthis.update_div_ui();

  //      fn.data.do_search(); //說想自動搜尋 (後來說，就算細節開著，也想自動搜尋)
  //    }// end// Case1: 當範圍選擇細項開啟：將所選的，累加到範圍內。
  //    else //case2: 當範圍選擇細項關閉時：以此為範圍，查詢
  //    {
  //      for (var idx in pthis.m_range)//all false
  //        pthis.m_range[idx] = false;
  //      //true
  //      var strKey = $(this).text();//創 出 利...
  //      var arrayIdx = fhl.g_book_group[strKey];
  //      for (var idx in arrayIdx) {
  //        pthis.m_range[arrayIdx[idx]] = true;
  //      }
  //      pthis.update_div_ui();
  //      pthis.do_search();
  //    }
  //  });
  //}

  //var divBtnOpenDetail = document.createElement('div');
  //divBtnOpenDetail.innerHTML = "各別選取";
  //this.divs["各別選取"] = divBtnOpenDetail;
  //divBtnOpenDetail.setAttribute('class', 'search_type');
  ////event:click
  //$(divBtnOpenDetail).click(this, function (fn) {
  //  fn.data.m_isVisibleDivRangeDetail = !fn.data.m_isVisibleDivRangeDetail;
  //  fn.data.update_div_ui();
  //});
  //div_range_select_range.appendChild(divBtnOpenDetail);

  //var divBtnBibleCancelAll = document.createElement('div');
  //divBtnBibleCancelAll.innerHTML = "取消選取";
  //divBtnBibleCancelAll.setAttribute('class', 'search_type');
  ////event:click
  //$(divBtnBibleCancelAll).click(this, function (fn) {
  //  for (var idx in fn.data.m_range)
  //    fn.data.m_range[idx] = false;
  //  fn.data.update_div_ui();
  //});
  //div_range_select_range.appendChild(divBtnBibleCancelAll);

  //// 創 出 利 民 申 ... 
  //for (var idx in CHINESES) {
  //  var divEach = document.createElement('div');
  //  divEach.innerHTML = CHINESES[idx];
  //  //mark下面: init 後 再統一呼叫 render 一次
  //  //divEach.setAttribute('class', 'search_type');
  //  $(divEach).click(this, function (fn) {
  //    var divstr = $(this).text();
  //    var idx = CHINESES.indexOf(divstr);
  //    if (idx == -1) console.debug("idx不可能為-1,有bug.");
  //    fn.data.m_range[idx] = !fn.data.m_range[idx];
  //    fn.data.update_div_ui();

  //    fn.data.do_search(); //說想自動搜尋
  //  });
  //  div_range_select_detail.appendChild(divEach);
  //}

  //// 版本
  //divBtn = document.createElement('div');
  //divBtn.innerHTML = "自動同步";
  //divBtn.setAttribute('class', 'search_type');
  //div_bible_select.appendChild(divBtn);
  //this.divs["自動同步"] = divBtn; //別的函式的時候要取就很方便
  ////event:click defined 自動同步
  //$(divBtn).click(this, function (fn) {
  //  fn.data.m_isAutoBibleVersion = !fn.data.m_isAutoBibleVersion;
  //  fn.data.update_div_ui();
  //});
  //for (var idx in abvphp.g_bibleversions) // 和合本 新譯本 ... etc.
  //{
  //  divBtn = document.createElement('div');
  //  divBtn.innerHTML = idx;
  //  divBtn.setAttribute('class', 'search_type');
  //  div_bible_select.appendChild(divBtn);
  //  //event:click event
  //  $(divBtn).click(this, function (fn) {
  //    var pthis = fn.data;
  //    var strKey = $(this).text();
  //    var idxKey = pthis.m_bibleversions.indexOf(strKey);
  //    if (idxKey == -1)
  //      pthis.m_bibleversions.push(strKey);
  //    else
  //      pthis.m_bibleversions.splice(idxKey, 1);
  //    pthis.m_isAutoBibleVersion = false;
  //    pthis.update_div_ui();
  //  });
  //}

  //{
  //  var vversionStr = localStorage.getItem("version");
  //  if (vversionStr != null && vversionStr.length != 0) {
  //    var vversion = vversionStr.split(",");
  //    this.m_bibleversions = []; //clear(); // for this.m_isAutoBibleVersion
  //    for (var idx in vversion) {
  //      var strBook = vversion[idx];
  //      for (var key in abvphp.g_bibleversions)//找對應的聖經
  //      {
  //        if (abvphp.g_bibleversions[key]["book"] == strBook) {
  //          this.m_bibleversions.push(key);
  //          break;
  //        }
  //      }//找對應的聖經
  //    }
  //  }
  //  else {
  //    if (this.m_bibleversions.length == 0 || this.m_isAutoBibleVersion == true) {
  //      this.m_bibleversions = []; //clear(); // for this.m_isAutoBibleVersion
  //      for (var idx in Vversion) {
  //        var strBook = Vversion[idx];
  //        for (var key in abvphp.g_bibleversions) {
  //          if (abvphp.g_bibleversions[key]["book"] == strBook) {
  //            this.m_bibleversions.push(key);
  //            break;
  //          }
  //        }
  //      }
  //    }
  //  }
  //}

  //this.try_load();
  //this.update_div_ui();
}; // c_param class initial_div_ui function end

// c_param class update_div_ui function 宣告
sephp.c_param.prototype.update_div_ui = function update_div_ui() {
  var pThisClassObj = this;

  // 繪圖「SN開關」
  if (this.m_isVisibleSn) {
    $(this.divs["SN開關"]).removeClass("search_type").addClass("search_type_cur");
  }
  else {
    $(this.divs["SN開關"]).removeClass("search_type_cur").addClass("search_type");
  }// 繪圖「SN開關」... end

  // 「搜尋範圍」...
  if (this.m_isVisibleDivRange)
    $(this.divs["搜尋範圍"]).removeClass("search_type").addClass("search_type_cur");
  else
    $(this.divs["搜尋範圍"]).removeClass("search_type_cur").addClass("search_type");
  // 「搜尋範圍」... end 

  // 「聖經版本」
  if (this.m_isVisibleDivBibleSwitch)
    $(this.divs["聖經版本"]).removeClass("search_type").addClass("search_type_cur");
  else
    $(this.divs["聖經版本"]).removeClass("search_type_cur").addClass("search_type");
  // 「聖經版本」end

  // 2015.05.06 (SN搜尋的時候,聖經版本隱藏)
  if (this.m_isVisibleSn || this.m_keywordType != 0) {
    $(this.divs["聖經版本"]).css("display", "none");
    this.m_isVisibleDivBibleSwitch = false;
  }
  else
    $(this.divs["聖經版本"]).css("display", "");

  if (this.m_isVisibleDivRange) {
    this.divs["範圍選單_總"].setAttribute("style", "display:inherit");

    if (this.m_isVisibleDivRangeDetail)
      $(this.divs["各別選取"]).removeClass("search_type").addClass("search_type_cur");
    else
      $(this.divs["各別選取"]).removeClass("search_type_cur").addClass("search_type");
      

    // 繪圖「整本聖經」「舊約」「新約」「摩西五經」etc...要決定它們各別是「被選取」「未被選取」二類...
    $(this.divs["範圍選單_略"]).children("div").each(function renderBookGroup() {
      var strKey = $(this).text();
      if (strKey in fhl.g_book_group)//像「各別選取」應該就不要處理...要處理的是「整本聖經」「新約」「舊約」「摩西五經」... etc
      {
        var arrayidx = fhl.g_book_group[strKey];
        var isOk = true;
        for (var idx2 in arrayidx) {
          if (pThisClassObj.m_range[arrayidx[idx2]] == false) {
            isOk = false;
            break;
          }
        }
        if (isOk == true)
          $(this).removeClass("search_type").addClass("search_type_cur");
        else
          $(this).removeClass("search_type_cur").addClass("search_type");
      }
    });// 繪圖「整本聖經」「舊約」「新約」「摩西五經」etc...要決定它們各別是「被選取」「未被選取」二類... end ...

    if (this.m_isVisibleDivRangeDetail) {
      this.divs["範圍選單_細"].setAttribute("style", "display:inherit");

      // 繪圖「創 出 利 民 申」... 要決定它們各別是「被選取」「未被選取」二類...
      $(this.divs["範圍選單_細"]).children().each(function () {
        var strKey = $(this).text();
        var idx = pThisClassObj.mp_chineses.indexOf(strKey);
        //var idx = CHINESES.indexOf(strKey);
        if (pThisClassObj.m_range[idx]) {
          $(this).removeClass("search_type").addClass("search_type_cur");
        }
        else {
          $(this).removeClass("search_type_cur").addClass("search_type");
        }

      });// 繪圖「創 出 利 民 申」... 要決定它們各別是「被選取」「未被選取」二類...end
    }
    else
      this.divs["範圍選單_細"].setAttribute("style", "display:none");
  }
  else
    this.divs["範圍選單_總"].setAttribute("style", "display:none");

  if (this.m_isVisibleDivBibleSwitch) {
    this.divs["聖經版本選單"].setAttribute("style", "display:inherit");

    if (this.m_bibleversions.length == 0 || this.m_isAutoBibleVersion == true) {
      this.m_bibleversions = []; //clear(); // for this.m_isAutoBibleVersion
      for (var idx in Vversion) {
        var strBook = Vversion[idx];
        for (var key in abvphp.g_bibleversions) {
          if (abvphp.g_bibleversions[key]["book"] == strBook) {
            this.m_bibleversions.push(key);
            break;
          }
        }
      }
    }

    // 繪圖: 選取中的聖經 ;
    $(this.divs["聖經版本選單"]).children("div").each(function render選取中的聖經() {
      var strDiv = $(this).text();
      if (pThisClassObj.m_bibleversions.indexOf(strDiv) != -1) {
        $(this).removeClass("search_type").addClass("search_type_cur");
      }
      else {
        $(this).removeClass("search_type_cur").addClass("search_type");
      }
    });

    // 繪圖: 自動聖經版本
    if (this.m_isAutoBibleVersion)
      $(this.divs["自動同步"]).removeClass("search_type").addClass("search_type_cur");
    else
      $(this.divs["自動同步"]).removeClass("search_type_cur").addClass("search_type");
  }
  else
    this.divs["聖經版本選單"].setAttribute("style", "display:none");

  this.save();

  this.auto_size();

}; // c_param class update_div_ui function end


//0: keywords 1: SN 2:Reference (static function)
sephp.c_param.prototype.determine_keywordType = function determine_keywordType(strKeyword) {
  // 是不是 參考 查詢
  {
    var strTest = strKeyword.trim();
    if (strTest[0] == '#' && strTest[strTest.length - 1] == '|')
      return 2;
  }

  // 是不是 Strong Number 查詢
  var isNumberSearch = false;
  if (!isNaN(parseInt(strKeyword, 10))) {
    return 1;
  }

  return 0;
};
sephp.c_param.prototype.fncb_success_json = function fncb_success_json(json, obj_param) {
  if (json["status"] != "success")
    return;
  if (json["record"] == null)
    return;
  var outputIds = {};
  var keyword = obj_param["keyword"];
  var pThis = obj_param["pThis"];

  // Step: 分析
  var j_records = json["record"];
  for (var idxRecord in j_records) {
    var j_record = j_records[idxRecord];

    var id = j_record["id"];
    var bookcn = j_record["chineses"];
    var ch = j_record["chap"];
    var sec = j_record["sec"];
    var bible_text = j_record["bible_text"];


    outputIds[id] = {
      book_cname: obj_param.book,
      chineses: bookcn,
      chap: ch,
      sec: sec,
      bible_text: bible_text
    };

    // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
    pThis.make_keyword_color(keyword, outputIds[id]);

    obj_param.outputIds = outputIds;
  }//for loop
};
sephp.c_param.prototype.fncb_success_xml_text = function fncb_success_xml_text(xml_text, obj_param) {
  //console.debug("fncb_success_xml_text ");//debug

  var jsonResult = fhl.xml_tool.parseXml(xml_text);
  var json = jsonResult["result"];

  if (json["status"] != "success")
    return;
  if (json["record"] == null)
    return;

  var outputIds = {};
  var keyword = obj_param["keyword"];
  var pThis = obj_param["pThis"];

  // Step: 分析
  var j_records = json["record"];
  if (j_records.length == undefined) { //表示只有一筆recorder
    var id = j_records["id"];
    var bookcn = j_records["chineses"];
    var ch = j_records["chap"];
    var sec = j_records["sec"];
    var bible_text = j_records["bible_text"];

    //2015.05.06 sn 要完全一樣. 才真的去畫後面的
    if (pThis.m_keywordType != 0)// 輸入「摩西」的時候不用作下面.不然在下面的test會回傳false
    {
      // pThis.m_keywordType: 依使用者輸入的內容自動判斷.(0:keyword 1:sn 2:reference)
      //var mt_str = '<[A-Za-z]+' + keyword + '>';
      var mt_str = '<[A-Za-z]+0*' + keyword + '>';
      var mt4 = new RegExp(mt_str, 'g');
      if (mt4.test(bible_text) == false)
        return;
    }//2015.05.06 sn 要完全一樣. 才真的去畫後面的

    outputIds[id] = {
      book_cname: obj_param.version,
      chineses: bookcn,
      chap: ch,
      sec: sec,
      bible_text: bible_text
    };

    // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
    pThis.make_keyword_color(keyword, outputIds[id]);

    obj_param.outputIds = outputIds;

    
  }
  else {
    
    for (var idxRecord in j_records) {
      var j_record = j_records[idxRecord];

      if (j_record["chineses"] == undefined) {
        console.debug("deubg_fncb_success_xml_text");
        console.log(xml_text);
        console.log(json);
        console.log(j_record);
      }

      var id = j_record["id"];
      var bookcn = j_record["chineses"];
      var ch = j_record["chap"];
      var sec = j_record["sec"];
      var bible_text = j_record["bible_text"];

      //2015.05.06 sn 要完全一樣. 才真的去畫後面的
      if (pThis.m_keywordType != 0)// 輸入「摩西」的時候不用作下面.不然在下面的test會回傳false
      {
        // pThis.m_keywordType: 依使用者輸入的內容自動判斷.(0:keyword 1:sn 2:reference)
        //var mt_str = '<[A-Za-z]+' + keyword + '>';
        var mt_str = '<[A-Za-z]+0*' + keyword + '>';
        var mt4 = new RegExp(mt_str, 'g');
        if (mt4.test(bible_text) == false)
          return;
      }//2015.05.06 sn 要完全一樣. 才真的去畫後面的

      outputIds[id] = {
        book_cname: obj_param.version,
        chineses: bookcn,
        chap: ch,
        sec: sec,
        bible_text: bible_text
      };

      // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
      pThis.make_keyword_color(keyword, outputIds[id]);

      obj_param.outputIds = outputIds;

      
    }//for loop
  }

  //<result><status>success</status>
  //<orig>0</orig>
  //<key>摩西</key>
  //<record_count>7</record_count>
  //<record><id>23350</id><chineses>太</chineses><engs>Matt</engs><chap>8</chap><sec>4</sec><bible_text>耶穌對他說：「你切不可告訴人，只要去把身體給祭司察看，獻上摩西所吩咐的禮物，對眾人作證據。」</bible_text></record>
  //<record><id>23704</id><chineses>太</chineses><engs>Matt</engs><chap>17</chap><sec>3</sec><bible_text>忽然，有摩西、以利亞向他們顯現，同耶穌說話。</bible_text></record>
  //<record><id>23705</id><chineses>太</chineses><engs>Matt</engs><chap>17</chap><sec>4</sec><bible_text>彼得對耶穌說：「主啊，我們在這裡真好！你若願意，我就在這裡搭三座棚，一座為你，一座為摩西，一座為以利亞。」</bible_text></record>
  //<record><id>23770</id><chineses>太</chineses><engs>Matt</engs><chap>19</chap><sec>7</sec><bible_text>法利賽人說：「這樣，摩西為甚麼吩咐給妻子休書，就可以休她呢？」</bible_text></record>
  //<record><id>23771</id><chineses>太</chineses><engs>Matt</engs><chap>19</chap><sec>8</sec><bible_text>耶穌說：「摩西因為你們的心硬，所以許你們休妻，但起初並不是這樣。</bible_text></record>
  //<record><id>23897</id><chineses>太</chineses><engs>Matt</engs><chap>22</chap><sec>24</sec><bible_text>「夫子，摩西說：『人若死了，沒有孩子，他兄弟當娶他的妻，為哥哥生子立後。』</bible_text></record>
  //<record><id>23921</id><chineses>太</chineses><engs>Matt</engs><chap>23</chap><sec>2</sec><bible_text>說：「文士和法利賽人坐在摩西的位上，</bible_text></record>
  //</result>
};
// make_keyword_color 使用
sephp.c_param.prototype.fncb_success_xml_text_try_get_sn_bible_text = function (xml_text, info) {
  var re1 = fhl.xml_tool.parseXml(xml_text);
  var json = re1["result"];
  if (json["status"] == "success" && json["record_count"] == 1) {
    info['bible_text'] = json["record"]["bible_text"];
  }
};
// 這個是給 render_result () 函式用的 ， 將關鍵字繪為 藍色 (紅色通常被拿來用耶穌的話) ... static 
// 多傳了 info 是為了判斷「新舊約」等資訊，除了上色，又要加上click動作
sephp.c_param.prototype.make_keyword_color = function make_keyword_color(keyword, info, isKeyToSn) {
  // step1: 若是 SN 查詢 . 結果已經是含 SN 了 . 但若是 refernece 或是 關鍵字 . 若使用者有開SN顯示 . 則要取代 bibleText
  // step2: 上色. (每一個關鍵字)
  // step3: SN 全上色 (一般色) ... 不需要for each 關鍵字
  //var keys = "摩西 神";
  // Step1: 把經文以 SN 版本取代
  if (this.m_isVisibleSn && this.m_userInputType == 0 && this.m_keywordType != 1 && abvphp.g_bibleversions[info.book_cname].strong == "1") {
//    //console.log(info);// Object {book_cname: "文理和合本", chineses: "出", chap: 32, sec: 1, bible_text: "民見摩西遲回..."}
//    var strurl = "qb.php?chineses=" + info.chineses +
//"&chap=" + info.chap +
//"&sec=" + info.sec +
//"&strong=" + 1 +
//"&version=" + abvphp.g_bibleversions[info.book_cname].book;
//    ////fhl.json_api(strurl, this.fncb_success_json_try_get_sn_bible_text, null, info, false);
//    fhl.xml_api_text(strurl, this.fncb_success_xml_text_try_get_sn_bible_text, null, info, false); //mark起來
    if ( isKeyToSn == false) 
      return;
  }

  // Step2: 每一個關鍵字 (用空白隔開)
  var re1 = info.bible_text;
  var keys = keyword.split(" ");
  for (var idxKey in keys) {
    var strKey = keys[idxKey];
    if (strKey == "and" || strKey == "or" || strKey == "not")
      continue;
    if (strKey == "")
      continue;

    var keyType = this.determine_keywordType(strKey);
    if (keyType == 2) continue;
    else if (keyType == 0) {
      var regex = new RegExp("\\" + strKey, "g"); // 這個結果就會是 /\摩西/g
      re1 = re1.replace(regex, "<span class=\"seKey\">" + strKey + "</span>");//要把 摩西 取代成 <span xxx>摩西></span>
    }
    else if (keyType == 1) {
      {//可能是 時態 (777)
        var reg_WTHG = new RegExp('<WT[G,H][0]*' + strKey + '>', "g");
        var reg_re = reg_WTHG.exec(re1);
        if (reg_re != null) {
          var str1 = reg_re[0]; // <WTH7423> or <WTG7421> or <WTH7423a>

          var reg_sn_no_tag = new RegExp('\\d+\\w*', 'g');
          str2 = reg_sn_no_tag.exec(str1)[0]; // 7423 or 7421 or 7423a

          var reg_replace = new RegExp(str1, 'g');//要把 <WTH7423> 取代成 <span xxx>(7423)</span>

          var click_sn_dic = "onclick=sdic(1,\"" + str2 + "\")";//這三行是要新增字典
          if (this.mp_chineses.indexOf(info['chineses']) > 38)
          //if (CHINESES.indexOf(info['chineses']) > 38)
            click_sn_dic = "onclick=sdic(0,\"" + str2 + "\")";
          re1 = re1.replace(reg_replace, "<span class='seKey ui-button' " + click_sn_dic + " >(" + str2 + ")</span>");
        }
      }
      {//可能是 一般 <777>
        var reg_WAHG = new RegExp('<W[A,G,H]+[0]*' + strKey + '>', "g");
        var reg_re = reg_WAHG.exec(re1);
        if (reg_re != null) {
          var str1 = reg_re[0]; // <WH777> or <WAH777> or <WG777> or <WAG777> or <WH777a>

          var reg_sn_no_tag = new RegExp('\\d+\\w*', 'g');
          str2 = reg_sn_no_tag.exec(str1)[0]; // 777 or 777a

          var reg_replace = new RegExp(str1, 'g');//要把 <WH777> 取代成 <span xxx><777></span>
          var click_sn_dic = "onclick=sdic(1,\"" + str2 + "\")";//這三行是要新增字典
          if (this.mp_chineses.indexOf(info['chineses']) > 38)
          //if (CHINESES.indexOf(info['chineses']) > 38)
            click_sn_dic = "onclick=sdic(0,\"" + str2 + "\")";
          re1 = re1.replace(reg_replace, "<span class='seKey ui-button' " + click_sn_dic + ">&lt;" + str2 + "&gt;</span>");
        }
      }
    }
  }//Step2:

  // Step3: SN 全上色 (一般色)
  {//若存在sn ... 上色 (順序不能與上面keyword對調唷)
    var bug_protect = 0;
    while (true)//no keyword step2
    {
      var reg_WTHG = new RegExp('<WT[G,H]\\d+\\w*>', "g");
      var reg_re = reg_WTHG.exec(re1);
      if (reg_re == null)
        break;
      var str1 = reg_re[0]; // <WTH7423> or <WTG7421> or <WTH7423a>

      if (bug_protect++ > 100) {
        console.debug("SN上色可能有bug，發生於" + str1)
        break;
      }

      var reg_sn_no_tag = new RegExp('\\d+\\w*', 'g');
      str2 = reg_sn_no_tag.exec(str1)[0]; // 7423 or 7421 or 7423a
      //console.debug(str2);

      var reg_replace = new RegExp(str1, 'g');//要把 <WTH7423> 取代成 <span xxx>(7423)</span>
      var click_sn_dic = "onclick=sdic(1,\"" + str2 + "\")";//這三行是要新增字典
      //if (CHINESES.indexOf(info['chineses']) > 38)
      if (this.mp_chineses.indexOf(info['chineses']) > 38)
        click_sn_dic = "onclick=sdic(0,\"" + str2 + "\")";
      re1 = re1.replace(reg_replace, "<span class='seSN ui-button' " + click_sn_dic + ">(" + str2 + ")</span>");
    }
    bug_protect = 0;
    while (true)//step4 nokeyword
    {
      var reg_WAHG = new RegExp('<W[A,G,H]+\\d+\\w*>', "g");
      var reg_re = reg_WAHG.exec(re1);
      if (reg_re == null)
        break;
      var str1 = reg_re[0]; // <WH777> or <WAH777> or <WG777> or <WAG777> or <WH777a>

      if (bug_protect++ > 100) {
        console.debug("SN上色可能有bug，發生於" + str1)
        break;
      }

      var reg_sn_no_tag = new RegExp('\\d+\\w*', 'g');
      str2 = reg_sn_no_tag.exec(str1)[0]; // 777 or 777a

      var reg_replace = new RegExp(str1, 'g');//要把 <WH777> 取代成 <span xxx><777></span>
      //re1 = re1.replace(reg_replace, "<span class='seSN'>&lt;" + str2 + "&gt;</span>");

      var click_sn_dic = "onclick=sdic(1,\"" + str2 + "\")";//這三行是要新增字典
      //if (CHINESES.indexOf(info['chineses']) > 38)
      if (this.mp_chineses.indexOf(info['chineses']) > 38)
        click_sn_dic = "onclick=sdic(0,\"" + str2 + "\")";
      re1 = re1.replace(reg_replace, "<span class='seSN ui-button' " + click_sn_dic + ">&lt;" + str2 + "&gt;</span>");
      //console.log(str1 + " is source ... ");
      //console.log("<span style='color:darkturquoise;' >&lt;" + str2 + "&gt;</span>" + " is output ");
    }
  }//若存在sn ... 上色 (順序不能與上面keyword對調唷)
  info.bible_text = re1;
  return;
};

// 這個是用於 search () 函式 ... 查詢完結果，繪圖
sephp.c_param.prototype.render_result = function render_result() {
  var pThisClassObj = this;

  // var div_result = document.getElementById("search_result");
  var div_result = this.divs["seFrameBody"];
  //div_result.innerHTML = "";

  for (var idxId in this.m_search_result) {
    for (var idxArray in this.m_search_result[idxId]) {
      var one_id = this.m_search_result[idxId][idxArray];
      var re_text = one_id["bible_text"];

      var div_one = document.createElement("div");
      var div_left = document.createElement("div");
      var div_right = document.createElement("div");
      div_result.appendChild(div_one);
      div_one.appendChild(div_left);
      div_one.appendChild(div_right);

      //div_one.setAttribute("style", "position:relative;clear:both;");
      $(div_one).addClass("seOneSec");
      //div_left.setAttribute("style", "float:left;width:4 em;margin-bottom: 0.7em;");
      $(div_left).addClass("seOneSecRef");
      //div_right.setAttribute("style", "margin-bottom: 0.7em;margin-left: 1em;position: absolute;left: 4.5em;");
      $(div_right).addClass("seOneSecText");
      {// 顯示 (出 1:1 合和本)
        var divTmp = document.createElement("span");
        divTmp.innerHTML = one_id["chineses"] + " " + one_id["chap"] + ":" + one_id["sec"] + "<br/>" + one_id["book_cname"];
        div_left.appendChild(divTmp);
      }// 顯示 (出 1:1 合和本) end
      {//新視窗開啟
        var divTmp = document.createElement("span");
        // div_left.appendChild(divTmp); (黑圈圈功能達成，就開啟這個mark)
        $(divTmp).click("?" + one_id["chineses"] + "_" + one_id["chap"] + "_" + one_id["sec"], function (pFunc) {
          window.open(URL_PRE + "test/" + pFunc.data);
          //  var url1 = "?" + one_id["chineses"] + "_" + one_id["chap"] + "_" + one_id["sec"]; //?出_3_1
          //  //window.open("https://bkbible.fhl.net/ajax/test/" + url1);
        });

        divTmp.innerHTML = "&nbsp●";
        $(divTmp).addClass("ui-button");
      }
      {//本視窗開啟
        var divTmp = document.createElement("span");
        div_left.appendChild(divTmp);
        divTmp.innerHTML = "○";

        $(divTmp).css("cursor", "pointer");
        //$(divTmp).addClass("ui-button");
        //console.debug("○ parameter");
        //console.log(one_id);

        // 新版
        $(divTmp).click({ pthis: this, da: one_id }, function (fn) {
          // fn.data 
          //bible_text: "孩子漸長，婦人把他帶到法老的女兒那裡，就作了她的兒子。她給孩子起名叫<span class="seKey">摩西</span>，意思說：「因我把他從水裡拉出來。」
          //"book_cname: "和合本"
          //chap: "2"
          //chineses: "出"
          //sec: "10"
          //fn.data.pthis.mpfn_search_title_change(fn.data.da["bible_text"]);
          var da = fn.data.da;
          fn.data.pthis.mpfn_read_bible(da["chineses"], da["chap"], da["sec"]);
        });
        // 舊版的功能
        //divTmp.setAttribute('onclick', "read_bible('" + one_id["chineses"] + "'," + one_id["chap"] + ")")
        //$(divTmp).click({ bn: one_id["chineses"], ch: one_id["chap"] }, function (pThis) {
        //  read_bible(pThis.data.bn, pThis.data.ch);
        //  //read_bible(one_id["chineses"], one_id["chap"]);
        //});

        $(divTmp).addClass("ui-button");
      }
      {//copy到剪貼簿 (尚未完成)
        var divTmp = document.createElement("div");
        //div_left.appendChild(divTmp);
        divTmp.innerHTML = "✂";
        $(divTmp).addClass("ui-button");
      }

      div_right.innerHTML = re_text;

      this.auto_size();
    }
  }//for (var idxId in this.m_search_result)
  // this.m_search_result 
};

// 當關鍵字符合 #…| 格式的時候，
// # Ge 21:2-5; Jos 24:2,3; 1Ch 1:28; Isa 51:2; Lu 3:34; Ac 7:8;Mt 1:1,4-6,7,8|
sephp.c_param.prototype.search_reference = function search_reference() {
  var pos1 = this.m_keyword.indexOf("#");
  var pos2 = this.m_keyword.lastIndexOf("|");
  var str1 = this.m_keyword.substr(pos1 + 1, pos2 - pos1 - 1);
  // console.log(str1);//# Ge 21:2-5; Jos 24:2,3; 1Ch 1:28; Isa 51:2; Lu 3:34; Ac 7:8| ... 去掉 # |
  var str2s = str1.split(";");
  var bible_default;
  if (this.m_bibleversions.length == 0)
    bible_default = "合和本";
  else
    bible_default = this.m_bibleversions[0];
  var bible_default_book = abvphp.g_bibleversions[bible_default].book;

  var output_list = [];
  var asyn_queue = [];
  for (var idx in str2s) {
    var one_str = str2s[idx].trim();
    if (one_str == null || one_str == "")
      continue;

    var params = one_str.split(' ');


    if (params.length == 2) {

      var userBook = params[0].trim();// 太 or Mt
      var userSec = params[1].trim();// 21:2-5 ... etc



      var idxBook = -1;
      for (var iBook = 0; iBook < 66; ++iBook) {
        var book = fhl.g_book_all[iBook];
        //console.debug(fhl.g_book_all[iBook]); //["Gen", "Genesis", "創", "創世記", "Ge"]
        if (book[4] == userBook || book[2] == userBook) {
          idxBook = iBook;
          break;
        }
      }
      var book_chinese = fhl.g_book_all[idxBook][2];
      //book: 創世紀 version:和合本
      var output = {
        book: fhl.g_book_all[idxBook][3],
        version: bible_default,
        keyword: "",//上色用(ref不上色，空的)
        pThis: this,
        outputIds: {}
      };
      output_list.push(output);
      //console.log(output);

      //qsb_params.push("qsb.php?version=unv&engs=太&qstr=1:1,4-6,7,8");
      var url = "qsb.php?";
      if (this.m_isVisibleSn)
        url += "strong=1";
      else
        url += "strong=0";
      if (this.m_isBig5 == false)//簡體
        url += "&gb=1";
      url += "&version=" + bible_default_book + "&engs=" + userBook + "&qstr=" + userSec;
      
      //var url = "qb.php?version=" + bible_default_book + "&chineses=" + book_chinese + "&qstr=" + userSec;
      asyn_queue.push(
        fhl.xml_api_text(url,
        function (xml_text, fn_param) {
          //console.debug(xml_text);
          var json1 = fhl.xml_tool.parseXml(xml_text);
          var json = json1["result"];
          if (json["status"] == null || json["status"] != "success") {
            return; //no data 
          }
          if (json["record_count"] == "0")
            return; //no data

          // 正式取得資料
          var outputIds = {};

          if (json["record_count"] == "1") {
            var j_record = json["record"];
            //bible_text: "當亞伯拉罕年老<WAH09001><WH02208>的時候，撒拉<WH08283>懷了孕<WH02029><WTH8799>；到　神<WH0430>所<WAH0834>說<WH01696><WTH8765>{<WAH0853>}的日期<WAH09001><WH04150>，就給亞伯拉罕<WAH09001><WH085>生<WH03205><WTH8799>了一個兒子<WH01121>。
            //"chap: "21"chineses: "創"engs: "Gen"sec: "2"

            var bookcn = j_record["chineses"];
            var ch = j_record["chap"];
            var sec = j_record["sec"];
            var bible_text = j_record["bible_text"];

            // 因為 這沒有回傳 id 所以用算的;
            var id = fhl.book_chap_sec_2_id(
              fhl.chineses_2_iBook(bookcn),
              parseInt(ch) - 1,
              parseInt(sec) - 1
              );
            // var id = j_record["id"]; 

            //console.debug(fn_param);
            // book_cname: 和合本 chineses: 創 chap:8 sec:7 
            outputIds[id] = {
              book_cname: fn_param.version,
              chineses: bookcn,
              chap: ch,
              sec: sec,
              bible_text: bible_text
            };

            // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
            fn_param.pThis.make_keyword_color(fn_param.keyword, outputIds[id]);

            fn_param.outputIds = outputIds;
          }
          else {
            for (var idxRecord in json["record"]) {
              var j_record = json["record"][idxRecord];
              //bible_text: "當亞伯拉罕年老<WAH09001><WH02208>的時候，撒拉<WH08283>懷了孕<WH02029><WTH8799>；到　神<WH0430>所<WAH0834>說<WH01696><WTH8765>{<WAH0853>}的日期<WAH09001><WH04150>，就給亞伯拉罕<WAH09001><WH085>生<WH03205><WTH8799>了一個兒子<WH01121>。
              //"chap: "21"chineses: "創"engs: "Gen"sec: "2"

              var bookcn = j_record["chineses"];
              var ch = j_record["chap"];
              var sec = j_record["sec"];
              var bible_text = j_record["bible_text"];

              // 因為 這沒有回傳 id 所以用算的;
              var id = fhl.book_chap_sec_2_id(
                fhl.chineses_2_iBook(bookcn),
                parseInt(ch) - 1,
                parseInt(sec) - 1
                );
              // var id = j_record["id"]; 

              //console.debug(fn_param);
              // book_cname: 和合本 chineses: 創 chap:8 sec:7 
              outputIds[id] = {
                book_cname: fn_param.version,
                chineses: bookcn,
                chap: ch,
                sec: sec,
                bible_text: bible_text
              };

              // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
              fn_param.pThis.make_keyword_color(fn_param.keyword, outputIds[id]);

              fn_param.outputIds = outputIds;
            }
          }
        },
        null, output, false)
        );
    } else {
      console.debug("error sqb param");
      console.log(params);
    }
    
    var pThisClassObj = this;
    $(pThisClassObj.divs["SearchMore"]).addClass("seSearchMoreNone");// reference searh 不用 more
    //$(pThisClassObj.divs["seFrameBody"]).css("max-height", $(pThisClassObj.divs["seFrame"]).height() - $(pThisClassObj.divs["seFrameTool"]).height() - 0);
    //$(pThisClassObj.divs["SearchMore"]).hide();// reference searh 不用 more
    //pThisClassObj.divs["DialogTitleBar"].innerHTML = "Reference Show";

    $.when.apply(window, asyn_queue).done(this, function when_apply_done(pthis) {
      // Result Step1 : fill data in re2 = {};
      var re2 = {};
      for (var idxOutput in output_list) {
        var outputObj = output_list[idxOutput];
        for (var idxText in outputObj.outputIds) {
          // multimap...
          if (re2[idxText] == undefined)
            re2[idxText] = [];
          re2[idxText].push(outputObj.outputIds[idxText]);
        }
      }
      //console.log("為繪圖結果，資料準備...");

      
      //document.getElementById("search_result").innerHTML = "";
      

      pThisClassObj.m_search_result = re2;
      pThisClassObj.render_result();
    });//end window done
  }
};
// 這個是 search() 主流程 是被 sephp_search()  呼叫的
sephp.c_param.prototype.do_search = function do_search() {

  console.dir(this);
  this.m_search_queue = [];//clear
  var pThisClassObj = this;
  var divFrame = this.divs["seFrameBody"];
  //var divFrame = document.getElementById("div");

  divFrame.innerHTML = "";
  if (this.m_keyword.length == 0) {
    this.mpfn_search_title_change('請輸入關鍵字');
    return;
  }

  // 依使用者輸入的內容自動判斷.(0:keyword 1:sn 2:reference)
  this.m_keywordType = this.determine_keywordType(this.m_keyword);

  // 查詢模式是 SN ， 卻輸入「摩西」。。。這是不合理的，(會查出不合理的結果)
  // m_userInputType...0:關鍵字 2:希伯來文 1:希臘文
  if (this.m_userInputType != 0 && this.m_keywordType != 1) {
    // mark 下2行 ... 後來沒有 radio button了 ... 所以變成自動判斷
    // alert('查詢模式為SN查詢，但輸入的卻不是SN。');
    // return;
    //this.m_userInputType = 0; 
  }

  //console.debug("debug");
  // SN 查詢 ... 00794 要用 794 才查得到 ... 但有 00794a ，這才處理的時候要小心
  if (this.m_userInputType != 0 || (this.m_userInputType == 0 && this.m_keywordType == 1)) {
    // 05.06 不要trim掉 mark掉二行
    var t1 = new RegExp('^[0]+', 'g'); // 000756a ... 0開頭，且不一定會有幾個
    this.m_keyword = this.m_keyword.replace(t1, '');//把找到的 000 用 "" 取代掉. 
  }

  //希伯來文，希臘文，必須要開VisibleSn
  if (this.m_userInputType != 0) {
    this.m_isVisibleSn = true;
  }

  var strOrig = "0"; //orig= (se.php參數)
  switch (this.m_userInputType) {
    case 1:
    case 2:
      strOrig = this.m_userInputType.toString();
      break;
    case 0: //關鍵字搜尋
      switch (this.m_keywordType) {
        case 0:
        case 2:
          strOrig = "0";
          break;
        case 1:
          strOrig = "1or2" // 還要依 iBook ... 所以 strOrig 當 (m_userInputType==0 && m_keywordType==1) 在forloop中還要另作判斷
          break;
      }
      break;
  }

  $(this.divs["keyword2"]).val(this.m_keyword); //同步Dialog UI上。
  this.update_div_ui();

  if (this.m_keywordType == 2)//refference search ...
  {
    //$("#search_result").text("開發中...");
    //$("#search_result").text("");
    this.search_reference();
    return;
  }// reference search 其實不是用 se.php，一開始還以為是。
  
  // 產生sephp的連結，很重要 (存到m_search_queue=[])
  for (var idxBook in this.m_range) {
    if (this.m_range[idxBook] == false)
      continue;

    if (this.m_userInputType == 0 && this.m_keywordType == 1) {
      if (idxBook > 38) //0-38 舊約
        strOrig = "1";
      else
        strOrig = "2";
    }

    if (this.m_userInputType == 1 && idxBook < 39) //希臘文原文，不查舊約
      continue;

    if (this.m_userInputType == 2 && idxBook > 38)//希伯來文原文，不查新約
      continue;

    // 若用 (idxBook + 1).toString() 會變 01 而不是 1
    var strRange = (parseInt(idxBook) + 1).toString();

    for (var idxBible in this.m_bibleversions) {
      // outputIds [{...},{...}] ... 其中一個 ... [21]={chineses:出,chap:1,sec:3}  ...絕對id為key值
      // book 從0 開始，是創世紀。

      var bible_cname = this.m_bibleversions[idxBible];
      var objabv = abvphp.g_bibleversions[bible_cname];

      if (objabv["ntonly"] == 1 && idxBook < 39) //此譯本只有新約,不查舊約範圍 (已測試，有效)
        continue;
      if (objabv["otonly"] == 1 && idxBook > 38) //此譯本只有新約,不查新約範圍 (已測試，有效)
        continue;
      if (this.m_userInputType != 0 && objabv["strong"] == 0) //如果使用者，是「希臘文查詢」或「希伯來文查詢」，那沒有SN的譯本，就不用查了。(範圍在外部有檢查了)
        continue;

      //book: 創世紀 version:和合本
      var output = {
        book: fhl.g_book_all[idxBook][3],
        version: this.m_bibleversions[idxBible],
        keyword: this.m_keyword,
        pThis: this,
        outputIds: {}
      };
      //output_list.push(output);

      var strUrl = "se.php?" + "q=" + this.m_keyword +
        "&VERSION=" + objabv['book'] +
        "&RANGE=3&range_bid=" + strRange + "&range_eid=" + strRange +
        "&orig=" + strOrig;
      if (this.m_isBig5 == false)
        strUrl += "&gb=1";

      //console.debug("strUrl");
      //console.log(strUrl);

      //if (this.m_keywordType == 2)
      //  console.log(strUrl);

      this.m_search_queue.push({ strUrl: strUrl, output: output })
    }//each idxBible
  }//each idxBook

  // 到此，已經產生好 this.m_search_queue (se.php參數)
  //console.debug("search_queue");
  //console.log(this.m_search_queue);

  //初始化 continue search function
  divFrame.innerHTML = "";

  this.m_search_idx_already = 0;
  this.m_search_count = 0;
  this.m_search_count_next_stop = 30;

  if (this.m_search_queue.length == 0) {
    this.mpfn_search_title_change("請檢查「查詢範圍」與「聖經版本」設定，沒有能查詢的範圍。");
    return;
  }

  this.mpfn_search_title_change("開始查詢");
  this.do_next_search();

  return; // 新版結束


  this.m_search_queue = [];//clear

  console.debug("do_search.keyword");
  console.log(this.m_keyword);

  var pThisClassObj = this;
  $("#search_result").dialog('close');
  $("#search_result").text('');

  if (this.m_keyword.length == 0) {
    alert('請輸入關鍵字');
    return;
  }

  // 依使用者輸入的內容自動判斷.
  this.m_keywordType = this.determine_keywordType(this.m_keyword);

  // 查詢模式是 SN ， 卻輸入「摩西」。。。這是不合理的，(會查出不合理的結果)
  if (this.m_userInputType != 0 && this.m_keywordType != 1) {
    // mark 下2行 ... 後來沒有 radio button了 ... 所以變成自動判斷
    alert('查詢模式為SN查詢，但輸入的卻不是SN。');
    return;
    //this.m_userInputType = 0; 
  }


  // SN 查詢 ... 00794 要用 794 才查得到 ... 但有 00794a ，這才處理的時候要小心
  if (this.m_userInputType != 0 || (this.m_userInputType == 0 && this.m_keywordType == 1)) {
    var t1 = new RegExp('^[0]+', 'g'); // 000756a ... 0開頭，且不一定會有幾個
    this.m_keyword = this.m_keyword.replace(t1, '');//把找到的 000 用 "" 取代掉. 
  }

  //希伯來文，希臘文，必須要開VisibleSn
  if (this.m_userInputType != 0) {
    this.m_isVisibleSn = true;
  }

  var strOrig = "0"; //orig= (se.php參數)
  switch (this.m_userInputType) {
    case 1:
    case 2:
      strOrig = this.m_userInputType.toString();
      break;
    case 0: //關鍵字搜尋
      switch (this.m_keywordType) {
        case 0:
        case 2:
          strOrig = "0";
          break;
        case 1:
          strOrig = "1or2" // 還要依 iBook ... 所以 strOrig 當 (m_userInputType==0 && m_keywordType==1) 在forloop中還要另作判斷
          break;
      }
      break;
  }

  $("#search_result").dialog("open");
  $(this.divs["keyword2"]).val(this.m_keyword); //同步Dialog UI上。
  this.update_div_ui();

  // 移到 do_search() 
  //var aysn_queue = [];
  //var output_list = [];

  if (this.m_keywordType == 2)//refference search ...
  {
    //$("#search_result").text("開發中...");
    $("#search_result").text("");
    this.search_reference();
    return;
  }

  for (var idxBook in this.m_range) {
    if (this.m_range[idxBook] == false)
      continue;

    if (this.m_userInputType == 0 && this.m_keywordType == 1) {
      if (idxBook > 38) //0-38 舊約
        strOrig = "1";
      else
        strOrig = "2";
    }

    if (this.m_userInputType == 1 && idxBook < 39) //希臘文原文，不查舊約
      continue;

    if (this.m_userInputType == 2 && idxBook > 38)//希伯來文原文，不查新約
      continue;

    // 若用 (idxBook + 1).toString() 會變 01 而不是 1
    var strRange = (parseInt(idxBook) + 1).toString();

    for (var idxBible in this.m_bibleversions) {
      // outputIds [{...},{...}] ... 其中一個 ... [21]={chineses:出,chap:1,sec:3}  ...絕對id為key值
      // book 從0 開始，是創世紀。

      var bible_cname = this.m_bibleversions[idxBible];
      var objabv = abvphp.g_bibleversions[bible_cname];

      if (objabv["ntonly"] == 1 && idxBook < 39) //此譯本只有新約,不查舊約範圍 (已測試，有效)
        continue;
      if (objabv["otonly"] == 1 && idxBook > 38) //此譯本只有新約,不查新約範圍 (已測試，有效)
        continue;
      if (this.m_userInputType != 0 && objabv["strong"] == 0) //如果使用者，是「希臘文查詢」或「希伯來文查詢」，那沒有SN的譯本，就不用查了。(範圍在外部有檢查了)
        continue;

      //book: 創世紀 version:和合本
      var output = {
        book: fhl.g_book_all[idxBook][3],
        version: this.m_bibleversions[idxBible],
        keyword: this.m_keyword,
        pThis: this,
        outputIds: {}
      };
      //output_list.push(output);

      var strUrl = "se.php?" + "q=" + this.m_keyword +
        "&VERSION=" + objabv['book'] +
        "&RANGE=3&range_bid=" + strRange + "&range_eid=" + strRange +
        "&orig=" + strOrig;
      if (this.m_isBig5 == false)
        strUrl += "&gb=1";

      console.debug("strUrl");
      console.log(strUrl);

      if (this.m_keywordType == 2)
        console.log(strUrl);

      this.m_search_queue.push({ strUrl: strUrl,output:output })
    }//each idxBible
  }//each idxBook

  //初始化

  document.getElementById("search_result").innerHTML = "";

  this.m_search_idx_already = 0;
  this.m_search_count = 0;
  this.m_search_count_next_stop = 30;
  
  if (this.m_search_queue.length == 0) {    
    //pThisClassObj.divs["DialogTitleBar"].innerHTML = "請檢查「查詢範圍」與「聖經版本」設定，沒有能查詢的範圍。";
    return;
  }

  $(this.divs["SearchMore"]).show();
  pThisClassObj.divs["DialogTitleBar"].innerHTML = "開始查詢";
  this.do_next_search();
};
sephp.c_param.prototype.do_next_search = function do_next_search()
{
  this.mpfn_search_title_change("搜尋中...");

  var aysn_queue = [];
  var output_list = [];

  var cnt = 0;
  var lastOutput;
  for (var i = this.m_search_idx_already; i < this.m_search_queue.length; ++i) {

    var strUrl = this.m_search_queue[i].strUrl;
    var output = this.m_search_queue[i].output;

    var dfd = fhl.xml_api_text(strUrl, this.fncb_success_xml_text, null, output, true);
    aysn_queue.push(dfd);//此時還沒開始查，是下面的wehn才開始唷
    output_list.push(output);
    this.m_search_idx_already = i + 1;

    lastOutput = output;

    // 因為 SN 很慢，所以就一次找2本就好
    if (this.m_isVisibleSn && cnt++ >=4)
      break;

    if (cnt++ >= 4)
      break;//一次4本書即可
  }

  // 已經查完了嗎(上面的dfd這次是空的)
  if (aysn_queue.length == 0 || this.m_search_idx_already > this.m_search_queue.length) {
    $(this.divs["SearchMore"]).addClass("seSearchMoreNone");// reference searh 不用 more
    //$(this.divs["seFrameBody"]).css("max-height", $(this.divs["seFrame"]).height() - $(this.divs["seFrameTool"]).height() - 0);
    //$(this.divs["SearchMore"]).hide();
    this.auto_size();
    return;
  } else {
    $(this.divs["SearchMore"]).removeClass("seSearchMoreNone");// reference searh 不用 more
    //$(this.divs["seFrameBody"]).css("max-height", $(this.divs["seFrame"]).height() - $(this.divs["seFrameTool"]).height() - $(this.divs["SearchMore"]).outerHeight());
    //$(this.divs["SearchMore"]).show();
    this.auto_size();
  }

  var pThisClassObj = this;
  // 裡面也太誇張的多了吧，程式碼。。。。
  $.when.apply(window, aysn_queue).done(function when_apply_done() {

    // 優化 「關鍵字搜尋，但開SN」
    if (pThisClassObj.m_isVisibleSn && pThisClassObj.m_userInputType == 0 && pThisClassObj.m_keywordType != 1) // info不存在
    {
      // 優化 StepA1:
      for (var idxOutput in output_list) {
        var outputObj = output_list[idxOutput];

        // sqb version 參數產生: from ... outputObj.version
        var qsb_version = abvphp.g_bibleversions[outputObj.version].book  // unv; // outputObj.version 回傳 和合本
        if (abvphp.g_bibleversions[outputObj.version].strong == 0)
          continue;

        // sqb engs 參數產生: from ... outputObj.book
        var idxBook = -1;
        for (var iBook = 0; iBook < 66; ++iBook) {
          var book = fhl.g_book_all[iBook];
          //console.debug(fhl.g_book_all[iBook]); //["Gen", "Genesis", "創", "創世記", "Ge"]
          if (book[3] == outputObj.book) {
            idxBook = iBook;
            break;
          }
        }
        var qsb_engs = fhl.g_book_all[idxBook][2];  //創

        // sqb qstr 產生 ... from outputObj.outputIds[idxText].chap: 32, outputObj.outputIds[idxText].sec: 1
        var qsb_qstr = "";
        for (var idxText in outputObj.outputIds) {
          var objId = outputObj.outputIds[idxText]
          if (qsb_qstr.length == 0)
            qsb_qstr += objId.chap + ":" + objId.sec;
          else
            qsb_qstr += ";" + objId.chap + ":" + objId.sec;
        }

        // 開始進行

        //var url = "qsb.php?version=" + qsb_version + "&engs=" + qsb_engs + "&qstr=" + qsb_qstr + "&strong=1";
        var url = "qsb.php?";
        url += "strong=1";
        if (pThisClassObj.m_isBig5 == false)//簡體
          url += "&gb=1";
        url += "&version=" + qsb_version + "&engs=" + qsb_engs + "&qstr=" + qsb_qstr;

        outputObj.outputIds = {};//reset 
        fhl.xml_api_text(url, function (xml_text, fn_param) {
          //console.debug(xml_text);
          var json1 = fhl.xml_tool.parseXml(xml_text);
          var json = json1["result"];
          if (json["status"] == null || json["status"] != "success") {
            return; //no data 
          }
          if (json["record_count"] == "0")
            return; //no data

          // 正式取得資料
          var outputIds = {};

          if (json["record_count"] == "1") {
            var j_record = json["record"];
            //bible_text: "當亞伯拉罕年老<WAH09001><WH02208>的時候，撒拉<WH08283>懷了孕<WH02029><WTH8799>；到　神<WH0430>所<WAH0834>說<WH01696><WTH8765>{<WAH0853>}的日期<WAH09001><WH04150>，就給亞伯拉罕<WAH09001><WH085>生<WH03205><WTH8799>了一個兒子<WH01121>。
            //"chap: "21"chineses: "創"engs: "Gen"sec: "2"

            var bookcn = j_record["chineses"];
            var ch = j_record["chap"];
            var sec = j_record["sec"];
            var bible_text = j_record["bible_text"];

            // 因為 這沒有回傳 id 所以用算的;
            var id = fhl.book_chap_sec_2_id(
              fhl.chineses_2_iBook(bookcn),
              parseInt(ch) - 1,
              parseInt(sec) - 1
              );
            // var id = j_record["id"]; 

            //console.debug(fn_param);
            // book_cname: 和合本 chineses: 創 chap:8 sec:7 
            outputIds[id] = {
              book_cname: fn_param.version,
              chineses: bookcn,
              chap: ch,
              sec: sec,
              bible_text: bible_text
            };

            // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
            fn_param.pThis.make_keyword_color(fn_param.keyword, outputIds[id], true);

            fn_param.outputIds = outputIds;
          }
          else {
            for (var idxRecord in json["record"]) {
              var j_record = json["record"][idxRecord];
              //bible_text: "當亞伯拉罕年老<WAH09001><WH02208>的時候，撒拉<WH08283>懷了孕<WH02029><WTH8799>；到　神<WH0430>所<WAH0834>說<WH01696><WTH8765>{<WAH0853>}的日期<WAH09001><WH04150>，就給亞伯拉罕<WAH09001><WH085>生<WH03205><WTH8799>了一個兒子<WH01121>。
              //"chap: "21"chineses: "創"engs: "Gen"sec: "2"

              var bookcn = j_record["chineses"];
              var ch = j_record["chap"];
              var sec = j_record["sec"];
              var bible_text = j_record["bible_text"];

              // 因為 這沒有回傳 id 所以用算的;
              var id = fhl.book_chap_sec_2_id(
                fhl.chineses_2_iBook(bookcn),
                parseInt(ch) - 1,
                parseInt(sec) - 1
                );
              // var id = j_record["id"]; 

              //console.debug(fn_param);
              // book_cname: 和合本 chineses: 創 chap:8 sec:7 
              outputIds[id] = {
                book_cname: fn_param.version,
                chineses: bookcn,
                chap: ch,
                sec: sec,
                bible_text: bible_text
              };

              // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
              fn_param.pThis.make_keyword_color(fn_param.keyword, outputIds[id], true);

              fn_param.outputIds = outputIds;
            }
          }
        }, null, outputObj, false);
        output_list[idxOutput] = outputObj;
      }//end one book

    }//end // 優化 「關鍵字搜尋，但開SN」


    var cnt_result = 0;
    //console.log(pThisClassObj.m_search_queue);
    // Result Step1 : fill data in re2 = {};
    var re2 = {};
    for (var idxOutput in output_list) {
      var outputObj = output_list[idxOutput];

      for (var idxText in outputObj.outputIds) {
        // multimap...
        if (re2[idxText] == undefined)
          re2[idxText] = [];
        re2[idxText].push(outputObj.outputIds[idxText]);
        ++cnt_result;
      }
    }
    //console.debug(re2);
    pThisClassObj.m_search_result = re2;
    pThisClassObj.render_result();

    pThisClassObj.m_search_count += cnt_result;
    if (pThisClassObj.m_search_count <= pThisClassObj.m_search_count_next_stop) {
      pThisClassObj.do_next_search();
      pThisClassObj.mpfn_search_title_change("已列出 " + pThisClassObj.m_search_count + " 筆數,搜尋到 " + lastOutput.book);
      return;
    }
    else {
      while (true) {
        pThisClassObj.m_search_count_next_stop += 30;
        if (pThisClassObj.m_search_count < pThisClassObj.m_search_count_next_stop)
          break;
      }
      pThisClassObj.mpfn_search_title_change("已列出 " + pThisClassObj.m_search_count + " 筆數,搜尋到 " + lastOutput.book);
      return;
    }

  });//end window done

  

  return;//新版 return...


  this.divs["DialogTitleBar"].innerHTML = "搜尋中...";

  var aysn_queue = [];
  var output_list = [];

  var cnt = 0;
  var lastOutput;
  for (var i = this.m_search_idx_already; i < this.m_search_queue.length; ++i) {

    var strUrl = this.m_search_queue[i].strUrl;
    var output = this.m_search_queue[i].output;

    var dfd = fhl.xml_api_text(strUrl, this.fncb_success_xml_text, null, output, true);
    aysn_queue.push(dfd);
    output_list.push(output);
    this.m_search_idx_already = i+1;

    lastOutput = output;

    // 因為 SN 很慢，所以就一次找1本就好
    if (this.m_isVisibleSn && cnt++ >= 4)
      break;

    if (cnt++ >= 4)
      break;//一次4本書即可
  }

  if (aysn_queue.length == 0 || this.m_search_idx_already > this.m_search_queue.length) {
    $(this.divs["SearchMore"]).addClass("seSearchMoreNone");// reference searh 不用 more
    $(this.divs["seFrameBody"]).css("max-height", $(this.divs["seFrame"]).height() - $(this.divs["seFrameTool"]).height() - 0);
    //$(this.divs["SearchMore"]).hide();
    this.auto_size();
    return;
  } else {
    $(this.divs["SearchMore"]).removeClass("seSearchMoreNone");// reference searh 不用 more
    $(this.divs["seFrameBody"]).css("max-height", $(this.divs["seFrame"]).height() - $(this.divs["seFrameTool"]).height() - $(this.divs["SearchMore"]).outerHeight());
    //$(this.divs["SearchMore"]).show();
  }

  var pThisClassObj = this;
  $.when.apply(window, aysn_queue).done(function when_apply_done() {

    // 優化 「關鍵字搜尋，但開SN」
    if (pThisClassObj.m_isVisibleSn && pThisClassObj.m_userInputType == 0 && pThisClassObj.m_keywordType != 1 ) // info不存在
    {
      // 優化 StepA1:
      for (var idxOutput in output_list) {
        var outputObj = output_list[idxOutput];

        // sqb version 參數產生: from ... outputObj.version
        var qsb_version = abvphp.g_bibleversions[outputObj.version].book  // unv; // outputObj.version 回傳 和合本
        if (abvphp.g_bibleversions[outputObj.version].strong == 0)
          continue;

        // sqb engs 參數產生: from ... outputObj.book
        var idxBook = -1;
        for (var iBook = 0; iBook < 66; ++iBook) {
          var book = fhl.g_book_all[iBook];
          //console.debug(fhl.g_book_all[iBook]); //["Gen", "Genesis", "創", "創世記", "Ge"]
          if (book[3] == outputObj.book) {
            idxBook = iBook;
            break;
          }
        }
        var qsb_engs = fhl.g_book_all[idxBook][2];  //創

        // sqb qstr 產生 ... from outputObj.outputIds[idxText].chap: 32, outputObj.outputIds[idxText].sec: 1
        var qsb_qstr = "";
        for (var idxText in outputObj.outputIds) {
          var objId = outputObj.outputIds[idxText]
          if ( qsb_qstr.length == 0)
            qsb_qstr += objId.chap + ":" + objId.sec;
          else
            qsb_qstr += ";" + objId.chap + ":" + objId.sec;
        }
        
        // 開始進行

        //var url = "qsb.php?version=" + qsb_version + "&engs=" + qsb_engs + "&qstr=" + qsb_qstr + "&strong=1";
        var url = "qsb.php?";
        url += "strong=1";
        if (pThisClassObj.m_isBig5 == false)//簡體
          url += "&gb=1";
        url += "&version=" + qsb_version + "&engs=" + qsb_engs + "&qstr=" + qsb_qstr;

        outputObj.outputIds = {};//reset 
        fhl.xml_api_text(url,  function (xml_text, fn_param) {
    //console.debug(xml_text);
    var json1 = fhl.xml_tool.parseXml(xml_text);
    var json = json1["result"];
    if (json["status"] == null || json["status"] != "success") {
      return; //no data 
    }
    if (json["record_count"] == "0")
      return; //no data

    // 正式取得資料
    var outputIds = {};

    if (json["record_count"] == "1") {
      var j_record = json["record"];
      //bible_text: "當亞伯拉罕年老<WAH09001><WH02208>的時候，撒拉<WH08283>懷了孕<WH02029><WTH8799>；到　神<WH0430>所<WAH0834>說<WH01696><WTH8765>{<WAH0853>}的日期<WAH09001><WH04150>，就給亞伯拉罕<WAH09001><WH085>生<WH03205><WTH8799>了一個兒子<WH01121>。
      //"chap: "21"chineses: "創"engs: "Gen"sec: "2"

      var bookcn = j_record["chineses"];
      var ch = j_record["chap"];
      var sec = j_record["sec"];
      var bible_text = j_record["bible_text"];

      // 因為 這沒有回傳 id 所以用算的;
      var id = fhl.book_chap_sec_2_id(
        fhl.chineses_2_iBook(bookcn),
        parseInt(ch) - 1,
        parseInt(sec) - 1
        );
      // var id = j_record["id"]; 

      //console.debug(fn_param);
      // book_cname: 和合本 chineses: 創 chap:8 sec:7 
      outputIds[id] = {
        book_cname: fn_param.version,
        chineses: bookcn,
        chap: ch,
        sec: sec,
        bible_text: bible_text
      };

      // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
      fn_param.pThis.make_keyword_color(fn_param.keyword, outputIds[id], true);

      fn_param.outputIds = outputIds;
    }
    else {
      for (var idxRecord in json["record"]) {
        var j_record = json["record"][idxRecord];
        //bible_text: "當亞伯拉罕年老<WAH09001><WH02208>的時候，撒拉<WH08283>懷了孕<WH02029><WTH8799>；到　神<WH0430>所<WAH0834>說<WH01696><WTH8765>{<WAH0853>}的日期<WAH09001><WH04150>，就給亞伯拉罕<WAH09001><WH085>生<WH03205><WTH8799>了一個兒子<WH01121>。
        //"chap: "21"chineses: "創"engs: "Gen"sec: "2"

        var bookcn = j_record["chineses"];
        var ch = j_record["chap"];
        var sec = j_record["sec"];
        var bible_text = j_record["bible_text"];

        // 因為 這沒有回傳 id 所以用算的;
        var id = fhl.book_chap_sec_2_id(
          fhl.chineses_2_iBook(bookcn),
          parseInt(ch) - 1,
          parseInt(sec) - 1
          );
        // var id = j_record["id"]; 

        //console.debug(fn_param);
        // book_cname: 和合本 chineses: 創 chap:8 sec:7 
        outputIds[id] = {
          book_cname: fn_param.version,
          chineses: bookcn,
          chap: ch,
          sec: sec,
          bible_text: bible_text
        };

        // 上色 並 轉為 SN 顯示 (直接改變 bible_text 內容)
        fn_param.pThis.make_keyword_color(fn_param.keyword, outputIds[id], true);

        fn_param.outputIds = outputIds;
      }
    }
        }, null, outputObj, false);
        output_list[idxOutput] = outputObj;
      }//end one book
      
    }//end // 優化 「關鍵字搜尋，但開SN」


    var cnt_result = 0;
    //console.log(pThisClassObj.m_search_queue);
    // Result Step1 : fill data in re2 = {};
    var re2 = {};
    for (var idxOutput in output_list) {
      var outputObj = output_list[idxOutput];
      
      for (var idxText in outputObj.outputIds) {
        // multimap...
        if (re2[idxText] == undefined)
          re2[idxText] = [];
        re2[idxText].push(outputObj.outputIds[idxText]);
        ++cnt_result;
      }
    }
    //console.debug(re2);
    pThisClassObj.m_search_result = re2;
    pThisClassObj.render_result();

    pThisClassObj.m_search_count += cnt_result;
    if(pThisClassObj.m_search_count <= pThisClassObj.m_search_count_next_stop )
    {
      pThisClassObj.do_next_search();
      pThisClassObj.divs["DialogTitleBar"].innerHTML = "已列出 " + pThisClassObj.m_search_count + " 筆數,搜尋到 " + lastOutput.book;
      pThisClassObj.auto_size();
      return;
    }
    else
    {
      while(true){
        pThisClassObj.m_search_count_next_stop += 30;
        if (pThisClassObj.m_search_count < pThisClassObj.m_search_count_next_stop)
          break;
      }
      pThisClassObj.divs["DialogTitleBar"].innerHTML = "已列出 " + pThisClassObj.m_search_count + " 筆數,搜尋到 " + lastOutput.book;
      pThisClassObj.auto_size();
      return;
    }
  });//end window done

 

}

sephp.c_param.prototype.auto_size = function auto_size()
{
  $(this.divs["seFrameBody"]).css("margin-top", $(this.divs["seFrameTool"]).height());

  if ($(this.divs["SearchMore"]).hasClass("seSearchMoreNone"))
  {
    $(this.divs["seFrameBody"]).css("max-height", $(this.divs["seFrame"]).height() - $(this.divs["seFrameTool"]).height() - 0);
  }
  else
  {
    $(this.divs["seFrameBody"]).css("max-height", $(this.divs["seFrame"]).height() - $(this.divs["seFrameTool"]).height() - $(this.divs["SearchMore"]).outerHeight());
  }
}

sephp.g_param = new sephp.c_param();//唯一的全域變數    
