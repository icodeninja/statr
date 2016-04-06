
function parseBatter(obj){
  var batter = parsePlayer(obj,"0");
  var keys = Object.keys(batter);
  if(keys.indexOf('1B') == -1 && keys.indexOf('H') !== -1){
    if(keys.indexOf('2B') !== -1 && keys.indexOf('3B') !== -1 && keys.indexOf('HR') !== -1){
      batter['1B'] = parseInt(batter['H']) - parseInt(batter['2B']) - parseInt(batter['3B']) - parseInt(batter['HR']);
    }
  }
  for(var x in batter){
    batter[x] = parseFloat(batter[x]);
  }
  return batter;
}

function parsePitcher(obj){
  return parsePlayer(obj,"1");
}

function parsePlayer(obj,pos){
  var retObj = {};
  for(var x in obj){
    var splits = x.split('.');
    if(splits[0] == pos){
      retObj[splits[1]] = obj[x];
    }
  }
  return retObj;
};
var weights = {
  '1B':0.905,
  'BB':0.705,
  'HBP':0.737,
  '2B':1.294,
  '3B':1.644,
  'HR':2.125
};

var pitcher_weights = {
  'cFIP':3.376,
  'HR':13,
  'BB':3,
  'HB':3,
  'K':-2
};

function getWobaFromObject(obj){
  var bat = parseBatter(obj);
  var wet = weights;
  var wOBA =(
    (wet['BB']*(bat['BB']-bat['IBB']))  +  (wet['HBP']*bat['HBP'])  +
    (wet['1B']*bat['1B'])  +  (wet['2B']*bat['2B'])  +
    (wet['3B']*bat['3B'])  +  (wet['HR']*bat['HR'])
  )/(
    (bat['AB']) + (bat['BB']-bat['IBB']) + (bat['HBP'])
  );
  return wOBA.toFixed(3).substring(1,5);
}

function getFIPFromObject(obj){
  var pit = parsePitcher(obj);
  console.log(pit);
  var wet = pitcher_weights;
  var FIP = ((
    (wet['HR']*pit['HR']) + (wet['BB']*pit['BB']) + (wet['HB']*pit['HB']) + (wet['K']*pit['K'])
  ) / (
    pit['IP']
  )) + wet['cFIP'];
  return isNaN(FIP) ? 'N/A' : FIP.toFixed(2);
}

window.sortByKey = function(array, key,inverse) {
		if(inverse==undefined || inverse==null)
			inverse=false;
    return array.sort(function(a, b) {
				var x = a[key];
				var y = b[key];
				if(!isFloat(x) && !isFloat(x)){
					x = x.toString().toLowerCase().charAt(0);
					y = y.toString().toLowerCase().charAt(0);
				}
				return ((x < y) ? (inverse?1:-1) : ((x >= y) ? (inverse?-1:1) : 0));
    });
};

window.isFloat = function(value) {
  var flt = !isNaN(value) &&
         parseFloat(Number(value)) == value &&
         (!isNaN(parseInt(value, 10)) ? true : (value.indexOf('.') == 0 ?
         (!isNaN(parseInt(value.substring(1,value.length-1), 10))) : false ));
  return flt;
}

var app = angular.module('Statr',[],function(){

  chrome.runtime.onMessage.addListener(function(request,sender, sendResponse){
    switch(request.message){
      case 'INVALID_PAGE':{
        $('#fail').show();
      }break;
    }
  });

});

var Clubhouse = app.controller('Clubhouse',function($scope){

  console.log($scope.$root.test);
  $scope.show = false;

  chrome.runtime.onMessage.addListener(function(request,sender, sendResponse){
    switch(request.message){
      case 'CLUBHOUSE_INIT':{
        $scope.$apply(function(){
          $scope.show = true;
          $scope.wOBA = getWobaFromObject(request.stats);
          $scope.FIP = getFIPFromObject(request.stats);
        });
      }break;
    }
  });

});

var Standings = app.controller('Standings',function($scope){
  $scope.show = false;

  $scope.teams = [{'name':'test','wOBA':'.356','FIP':'2.99'}];

  $scope.sortBy = function(key){
    window.sortByKey($scope.teams,key,(key=='FIP' ? false: true));
  };

  $scope.setTeams = function(teams){
    $scope.teams = [];
    var tms = [];
    for(var x = 0; x < teams.length; x++){
      var FIP = getFIPFromObject(teams[x].stats);
      var wOBA = getWobaFromObject(teams[x].stats);
      var teamObj = {'name':teams[x].managerName,'FIP':FIP,'wOBA':wOBA};
      tms.push(teamObj);
    }
    window.sortByKey(tms,'wOBA',true);
    $scope.teams = tms;
  };

  chrome.runtime.onMessage.addListener(function(request,sender, sendResponse){
    switch(request.message){
      case 'STANDINGS_INIT':{
        $scope.$apply(function(){
          $scope.show = true;
          $scope.setTeams(request.teams);
          console.log(request.teams);
        });
      }break;
    }
  });

});

function getCurrentTabInfo(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(tab);
  });
}




document.addEventListener('DOMContentLoaded', function() {
    $('#fail').hide();
  getCurrentTabInfo(function(tab) {
    if(tab.url.indexOf('chrome://') == -1){
      chrome.tabs.executeScript(null,{file:"assets/jquery-1.12.3.js"});
      chrome.tabs.executeScript(null,{file:"assets/content.js"});
    }else{
      $('#fail').show();      
    }
  });
});
