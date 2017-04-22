/* global chrome */

import jQuery from 'jquery';

const getTeams = () => {
  const batterFields = [];
  const pitcherFields = [];

  let pitchingNow = false;

  jQuery('#standingsTable >tbody > tr:nth-child(3) > td').each((i, el) => {
    if (i === 0) return; // skip first spacer
    if (el.className.indexOf('sectionLeadingSpacer') !== -1) {
      pitchingNow = true;
      return;
    }
    if (pitchingNow) {
      pitcherFields.push(el.innerText);
    } else {
      batterFields.push(el.innerText);
    }
  });

  const teamInfo = [];
  const allTeamTotals = [];
  const allTeamStats = [];

  const inner = (a, b) => { return b.innerText; };

  jQuery('#standingsTable > tbody > tr.tableBody').each((i, el) => {
    // do the team work while we're here
    const teamFull = jQuery(el).find('a[target=_top]')[0].title;
    const ownerName = teamFull.match(/\((.+)\)$/)[1];
    const teamName = teamFull.match(/^(.+)\ (?:\((.+)\))$/)[1];
    teamInfo.push({teamName, ownerName});

    // actual stat work
    const teamTotals = jQuery(el).find('td[class^=sortableStat]').map(inner).get();
    allTeamTotals.push(teamTotals);
  });

  jQuery('#statsTable > tbody > tr.tableBody').each((i, el) => {
    const teamStats = jQuery(el).find('td[id^=tm]').map(inner).get();
    allTeamStats.push(teamStats);
  });

  const allFields = batterFields.concat(pitcherFields);

  const teams = allTeamTotals.map((totals, x) => {
    const team = Object.assign({ stats: {
      batting: {totals: {}, counts: {}},
      pitching: {totals: {}, counts: {}}
    }}, teamInfo[x]);
    totals.forEach((stat, y) => {
      if (y >= batterFields.length) {
        team.stats.pitching.totals[allFields[y]] = stat;
        team.stats.pitching.counts[allFields[y]] = allTeamStats[x][y];
      } else {
        team.stats.batting.totals[allFields[y]] = stat;
        team.stats.batting.counts[allFields[y]] = allTeamStats[x][y];
      }
    });
    return team;
  });

  return teams;
};

const currentView = () => {
  const isDaily = jQuery('b:contains(Daily Stats)').length > 0;
  const isRealTime = jQuery('b:contains(Season Stats)').length > 0;
  return isDaily ? 'daily' : (isRealTime ? 'realtime' : 'season');
};

const sendTeams = () => {
  chrome.runtime.sendMessage({ code: 'TEAMS', teams: getTeams(), view: currentView() });
};

if (!window._x_statr_active) {
  chrome.runtime.onMessage.addListener((message) => {
    console.info(message);
    switch (message.code) {
      case 'GET_TEAMS':
        sendTeams();
      break;
      default:
      break;
    }
  });
  window._x_statr_active = true;
}

//sendTeams();
chrome.runtime.sendMessage({ code: 'CONTENTSCRIPT_ACTIVE' });
