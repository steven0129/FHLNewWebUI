var fhlAPI = fhlAPI || {};

fhlAPI.jsonAPI = function(url,cbOK,cbFail,params,async){
    if(async===null||async===undefined){
        async=true;
    }//default value
    //var root_url="http://bkbible.fhl.net/json/";
    var root_url="/json/";
    var ab_url=root_url+url;
    $.ajax({
        url:encodeURI(ab_url),
        type:"GET",
        dataType:"json",
        async:async
    }).done(function(d){        
        if(d){
            if(cbOK){
                cbOK(d,params);
            }
        }
    }).fail(function(j){
        if(cbFail){
            j.url=url;
            cbFail(j,params);
        }
    });
};

function processUrl(setup){
    var ret="";
    for(var key in setup){
        if(setup.hasOwnProperty(key)){
            ret+=key+"="+setup[key]+"&";
        }
    }
    ret=ret.substring(0,ret.length-1);    
    return ret;
}

fhlAPI.getBibleVersion=function(cbOK){//
    var url="abv.php";
    fhlAPI.jsonAPI(url,cbOK,null,null,null);
};

fhlAPI.getBibleText=function(cbOK,setup){
    var url="qb.php?";
    url+=processUrl(setup);
    fhlAPI.jsonAPI(url,cbOK,null,null,null);
};

fhlAPI.getBibleParsing=function(cbOK,cbFail,setup){
    var url="qp.php?";
    url+=processUrl(setup);
    fhlAPI.jsonAPI(url,cbOK,cbFail,setup,null);
}

fhlAPI.getBibleComment=function(cbOK,cbFail,setup){
    var url="sc.php?";
    url+=processUrl(setup);
    fhlAPI.jsonAPI(url,cbOK,cbFail,setup,null);
}
