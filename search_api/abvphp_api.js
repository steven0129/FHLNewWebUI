/// <reference path="fhl_api.js" />
/// <reference path="../libs/jquery-1.10.2.js" />
var fhl = fhl || {};
var abvphp = abvphp || {};

// 小雪 常常要用到 聖經版本資訊 但是不斷的 abv.php 是沒必要的. 查一次就好. 然後存到全域變數
// "和合本": {A}, "原文直譯(參考用)":{A}, "KJV": {A} .....
// A.book: "unv", A.ntonly: "0", A.otonly: "0", strong: "0"
abvphp.g_bibleversions = {};
// obj[和合本].book = unv
abvphp.init_g_bibleversions = function init_g_bibleversions() {
  var fn1 = function (xml, param) {
    // console.log( $(xml) );
    var xmlobj = $(xml);
    // console.log(xmlobj);
    xmlobj.find('record').each(function (idx) {
      var xmlEachObj = $(this);

      var objValue = {
        book: xmlEachObj.children('book').text(), //unv
        ntonly: xmlEachObj.children('ntonly').text(),
        otonly: xmlEachObj.children('otonly').text(),
        strong: xmlEachObj.children('strong').text(),
      };
      abvphp.g_bibleversions[xmlEachObj.children('cname').text()] = objValue;
    });

    //console.debug("abvphp.g_bibleversions");
    //console.log(abvphp.g_bibleversions);
  };//callback fn1
  fhl.xml_api("abv.php", fn1, null, null, false);
};//init g_bibleversions

$(function(){
  abvphp.init_g_bibleversions();
  //console.log(abvphp.g_bibleversions);
});

abvphp.get_cname_from_book = function get_cname_from_book(book) {
  /// <summary> unv 取得 '和合本' </summary>
  /// <param type="string" name="book" parameterArray="false">Ex: unv</param>
  var ret = "";
  $.each(abvphp.g_bibleversions, function (key, obj) {
    if (obj.book.localeCompare(book) == 0) {
      ret = key;
      return;
    }
  });//foreach
  return ret;
};