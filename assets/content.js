
var InPageApp = function(){

  var t = this;

  t.clubhouse = function(){
    var map1 = [];
    var map2 = [];

    var statMap = {};

    var statRow = $('.playerTableBgRowTotals');
    var headerRow = $('.playerTableBgRowSubhead');

    for(var x = 0; x < headerRow.length; x++){
      map1[x] = [];
      map2[x] = [];
      var loop1 = $(headerRow[x]).find('.playertableStat');
      var loop2 = $(statRow[x]).find('.playertableStat');
      for(var z = 0; z < loop1.length; z++){
        var content1 = loop1[z].innerText;
        if(content1.indexOf('/') !== -1){
          content1 = content1.split('/');
          for(var y in content1){
            map1[x].push(content1[y]);
          }
        }else{
          map1[x].push(content1);
        }
        var content2 = loop2[z].innerText;
        if(content2.indexOf('/') !== -1){
          content2 = content2.split('/');
          for(var y in content2){
            map2[x].push(content2[y]);
          }
        }else{
          map2[x].push(content2);
        }
      }
    }

    for(var z = 0; z < map1.length; z++){
      console.log('index: ' + z);
      for(var a = 0; a < map1[z].length; a++){
        statMap[z+'.'+map1[z][a]] = map2[z][a];
      }
    }

    console.log('trying to map');
    console.log(statMap);

    chrome.runtime.sendMessage({message:'CLUBHOUSE_INIT',stats:statMap});
  };

  t.standings = function(){
    var headers = [];
    var teams = [];
    var statsTable = $('#statsTable');
    var conf = {};
    conf.leagueId = $('form.playerSearchForm')[0].elements['leagueId'].value;
    conf.scoringPeriodId = $('#games-subnav-links > li:nth-child(2) > a')[0].href.split('scoringPeriodId=')[1];
    conf.seasonId = $('#standingsTable > tbody > tr:nth-child(4) > td:nth-child(2) > a')[0].href.split('seasonId=')[1];

    window.tms = [];

    console.log(conf);

    var statHead = $(statsTable.find('.tableSubHead')[1]);

    var statted = statHead.find('td').not('.sectionLeadingSpacer');

    var standingsTable = $('#standingsTable');

    for(var x = 0; x < statted.length; x++){
      headers.push(statted[x].innerText);
    }

    var teamRows = statsTable.find('.sortableRow');
    var standRows = standingsTable.find('.sortableRow');
    //console.log(teamRows);

    for(var x = 0; x < teamRows.length; x++){
      var teamNameEl = $(teamRows[x]).find('td.sortableTeamName')[0].children[0].title;
      var teamId = $(teamRows[x]).find('td.sortableRank')[0].id.split('_')[1];
      var teamRank = $(teamRows[x]).find('td.sortableRank')[0].innerText;
      if(teamNameEl.indexOf(')') !== -1)
        teamNameEl = teamNameEl.substring(0,teamNameEl.length-1);
      teamNameEl = teamNameEl.split(' (');
      var teamName = teamNameEl[0];
      var managerName = teamNameEl[1];

      if(managerName == undefined) managerName = teamName;

      var theTeam = {'teamRank':teamRank,'teamId':teamId,'teamName':teamName,'managerName':managerName,'stats':{}};


      var statter = $(teamRows[x]).find('td.precise').not('.sectionLeadingSpacer');
      var tots = $(standRows[x]).find('td').not('.sortableRank').not('.sectionLeadingSpacer').not('[align=left]').not('.sortableRotoTotal').not('.sortableRotoChange');
      var pitchingFound = false;

      var statty = [];

      for(var y = 0; y < headers.length; y++){
        if(!pitchingFound) pitchingFound = headers[y] == "IP";
        var statkey = pitchingFound ? '1' : '0';
        theTeam['stats'][statkey+'.'+headers[y]] = statter[y].innerText;
        if(theTeam['stats'][statkey+'.'+'PTS'] === undefined)
          theTeam['stats'][statkey+'.'+'PTS'] = 0;
        theTeam['stats'][statkey+'.'+'PTS'] += parseFloat(tots[y].innerText);
      }

      // console.log(theTeam);
      // console.log(statty);

      $.ajax(
        'http://games.espn.go.com/flb/playertable/prebuilt/manageroster?leagueId='+
        conf.leagueId+'&teamId='+teamId+'&seasonId='+conf.seasonId+'&scoringPeriodId='+
        conf.scoringPeriodId+'&view=stats&context=clubhouse&version=today'+
        '&ajaxPath=playertable/prebuilt/manageroster&managingIr=false&droppingPlayers=false&asLM=false',
        {
          async:false,
          complete:function(data){
            console.log('Received a team: '+teamId);
            console.log(data);
            //window.tms.push(data);
          }
        }
      );

      teams.push(theTeam);
    }

    chrome.runtime.sendMessage({message:'APP_INIT',teams:teams});


  };
  if(window.location.hostname !== "games.espn.go.com"){
    chrome.runtime.sendMessage({message:'INVALID_PAGE'});
    return;
  }

  if(window.location.pathname.indexOf('standings') !== -1){
    t.standings();
  }else{
    chrome.runtime.sendMessage({message:'INVALID_PAGE'});
  }


};

InPageApp();
