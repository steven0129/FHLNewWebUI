/// <reference path="sephp.se_record_2_qsb_str.js" />
/// <reference path="sephp.create_dialog_presearch.js" />
/// <reference path="sephp.create_dialog_search_result.js" />
/// <reference path="sephp.pre_search_keyword.js" />
/// <reference path="sephp.pre_search_sn.js" />
/// <reference path="qsbphp.search_reference.js" />
/// <reference path="qsbphp.create_color_span_from_bible_text.js" />
/// <reference path="fhl_api.js" />
/// <reference path="abvphp_api.js" />
/// <reference path="../libs/jquery-1.10.2.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/linq.min.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/jquery.linq.min.js" />
var sephp = sephp || {};
sephp.isAll = true;//sn搜尋時,可能要分新舊約
sephp.ibook_cur = 0;//sn搜尋時,判斷目前是閱讀的新約還是舊約
sephp.determine_keywordType = function determine_keywordType(strKeyword) {
  /// <summary> 0: keywords 1: SN 2:Reference </summary>
  /// <param type="string" name="strKeyword" parameterArray="false">Ex:摩西 Ex:2610 Ex:#Gen 1:2|</param>

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
sephp.search = function search(keyword, issn, isgb, verions, default_book,isAll) {
  /// <summary> 0: keywords 1: SN 2:Reference </summary>

  if (keyword == undefined || keyword.length == 0 )
    return;

  sephp.isgb = isgb;
  sephp.issn = issn;
  sephp.isAll = isAll;
  sephp.ibook_cur = fhl.engs_2_iBook(default_book);

  var itype = sephp.determine_keywordType(keyword);
  if (itype == 2) {
    /*reference*/
    var jret_qsb = qsbphp.search_reference(keyword, default_book, verions[0], issn, isgb);

    // 產生 result dialog 要用的資料  (這段code與 sephp.create_dialog_presearch.js 中 sephp.pre_search_click  很像)
    var Lq_record = $.Enumerable.From(jret_qsb["record"]);
    var jr2 = Lq_record.OrderBy("$.ibook").ThenBy("$.chap").ThenBy("$.sec").Select("{ibook:$.ibook,chap:$.chap,sec:$.sec,ver:$.ver,bible_text:$.bible_text}").ToArray();
    sephp.node_search_result.innerHTML = "";
    sephp.node_pre_search.innerHTML = "";
    sephp.create_dialog_search_result(jr2);
  } else if (itype == 1) {
    /*sn keyword*/

    if (parseInt(keyword) == 0)// 00000 結果造成卡死 2015.08.01(六)
      return;

    var jret = sephp.pre_search_sn(keyword, isgb, 'unv');

    var jrets = []; jrets.push(jret);
    sephp.keyword = keyword;
    sephp.node_pre_search.innerHTML = "";
    sephp.node_search_result.innerHTML = "";
    sephp.create_dialog_presearch(jrets);
  } else {
    /*keyword*/
    var jrets = sephp.pre_search_keyword(keyword, verions, sephp.isgb);
      
    sephp.keyword = keyword;
    sephp.node_pre_search.innerHTML = "";
    sephp.node_search_result.innerHTML = "";
    sephp.create_dialog_presearch(jrets);
  }
};