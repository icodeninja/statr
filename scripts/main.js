import jQuery from 'jquery';

const $ = q => {
  return document.querySelectorAll(q);
};


const getTeams = () => {
  let batterFields  = [];
  let pitcherFields = [];

  let pitchingNow = false;

  jQuery('#standingsTable >tbody > tr:nth-child(3) > td').each( (i, el) => {
    if (i === 0) return; // skip first spacer
    if (el.className.indexOf('sectionLeadingSpacer') !== -1) {
      return pitchingNow = true;
    }
    if (pitchingNow) {
      pitcherFields.push(el.innerText);
    } else {
      batterFields.push(el.innerText);
    }
  });

  let teamInfo      = [];
  let allTeamTotals = [];
  let allTeamStats  = [];

  const inner = (a, b) => { return b.innerText };

  jQuery('#standingsTable > tbody > tr.tableBody').each(function(){
    // do the team work while we're here
    let teamFull  = jQuery(this).find('a[target=_top]')[0].title;
    let ownerName = teamFull.match(/\((.+)\)$/)[1];
    let teamName  = teamFull.match(/^(.+)\ (?:\((.+)\))$/)[1];
    teamInfo.push({teamName, ownerName});

    // actual stat work
    let teamTotals = jQuery(this).find('td[class^=sortableStat]').map(inner).get();
    allTeamTotals.push(teamTotals);
  });

  jQuery('#statsTable > tbody > tr.tableBody').each(function(){
    let teamStats = jQuery(this).find('td[id^=tm]').map(inner).get();
    allTeamStats.push(teamStats);
  });

  console.log('allTeamStats', allTeamStats);

  let allFields = batterFields.concat(pitcherFields);

  let teams = allTeamTotals.map((totals, x) => {
    let team = Object.assign({ stats: {
      batting: {totals:{}, counts: {}},
      pitching: {totals:{}, counts: {}},
    }}, teamInfo[x]);
    totals.forEach((stat, y) => {
      if(y >= batterFields.length){
        team.stats.pitching.totals[allFields[y]] = stat;
        team.stats.pitching.counts[allFields[y]] = allTeamStats[x][y];
      } else {
        team.stats.batting.totals[allFields[y]] = stat;
        team.stats.batting.counts[allFields[y]] = allTeamStats[x][y];
      }
    });
    return team;
  });

  console.log('teams', teams);
  return teams;
};

const currentView = () => {
  let isDaily    = jQuery('b:contains(Daily Stats)').length > 0;
  let isRealTime = jQuery('b:contains(Season Stats)').length > 0;
  return isDaily ? 'daily' : (isRealTime ? 'realtime' : 'season');
};

const sendTeams = () => {
  chrome.runtime.sendMessage({ code: 'TEAMS', teams: getTeams(), view: currentView() });
};

if (!window._x_statr_active) {
  chrome.runtime.onMessage.addListener((message, sender, response) => {
    console.log(message);
    switch(message.code){
      case 'GET_TEAMS':
        sendTeams();
      break;
    }
  });
  window._x_statr_active = true;
}

sendTeams();
chrome.runtime.sendMessage({ code: 'CONTENTSCRIPT_ACTIVE' });
