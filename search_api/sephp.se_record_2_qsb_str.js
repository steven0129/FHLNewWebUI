/// <reference path="../libs/linq.js_ver2.2.0.2/jquery.linq.min.js" />
/// <reference path="../libs/linq.js_ver2.2.0.2/linq.min.js" />
var sephp = sephp || {};
sephp.se_record_2_qsb_str = function se_record_2_qsb_str(jret, ibooks) {
  /// <summary> 使用pre_search的結果,要將章節轉換為qsb來取經文 </summary>
  /// <param type="T" name="jret" parameterArray="false"> 1個聖經版本查詢的結果, (若有2個聖經版本要分兩次呼叫,因為qsb.php目前同時只支援一個聖經版本) </param>
  /// <param type="string[]" name="ibooks" parameterArray="false"> Ex: [0,1,2,3,4] 表示只回傳摩西五經的結果 </param>
  /// add 2015.07.21(二)
  var Lq1 = $.Enumerable.From(jret["record"]);
  var Lqibooks = $.Enumerable.From(ibooks);

  // Ex 1:2,3,4,5,6;2:4,2,3,1,2; Gen 1;2 ...
  var sqbstr = "#";
  var Lq2 = Lq1.GroupBy("$.ibook"); // 0: [$,$,$] array ...  $.Key(): [$,$,$...] array
  Lq2.ForEach(function (a1) {
    if (Lqibooks.Contains(a1.Key()) == true) {
      sqbstr += fhl.g_book_all[a1.Key()][2] + " "; // 全都用英文 (撒上 1 Sam有Bug, 先全中文好了)

      // 可能會造成太長的結果 (改使用POST即可)
      var Lq3 = $.Enumerable.From(a1.source).GroupBy("$.chap", "$.sec").Select("$.Key() +':' + $.ToString(',')"); //用章節群組
      Lq3.ForEach(function (a2) {
        // a2 = 3:1,2,5
        sqbstr += (a2 + ";");
      });
    }// 在範圍內才顯示
  });
  sqbstr += "|";

  //console.log(sqbstr);
  return sqbstr;
};