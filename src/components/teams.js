import React, { Component } from 'react';

import { wobaFromStats,
        sumValues,
        sortArrayByKey,
        ipToInt } from '../lib/calc';

import Dispatcher from '../lib/dispatcher';
import Tab from '../lib/tab';


export default class Teams extends Component {
	state = {
    ready: false,
    teams: []
  };

  componentWillMount = () => {
    this._catch = Dispatcher.register(this.catcher);
  }

  componentWillUnmount = () => {
    Dispatcher.unregister(this._catch);
  }

  catcher = (message) => {
    switch (message.code){
      case 'TEAMS':
        this.updateTeams(message.teams);
      break;
			default:
			break;
    }
  }

  updateTeams = (teamsFromPage) => {
    const ready = true;
    const teamInnings = teamsFromPage.map(team => {
      return ipToInt(team.stats.pitching.counts.IP);
    });
    const averageInnings = sumValues(teamInnings) / teamInnings.length;
    const teams = teamsFromPage.map(team => {
      const woba = wobaFromStats(team.stats.batting.counts).toFixed(3).substring(1);
      const bat_total = sumValues(team.stats.batting.totals).toFixed(1);
      const pit_total = sumValues(team.stats.pitching.totals).toFixed(1);
      const pts_per_ip = (pit_total / ipToInt(team.stats.pitching.counts.IP)).toFixed(3);
      const actual_total = (parseFloat(pts_per_ip) * averageInnings + parseFloat(bat_total)).toFixed(3);
      return {
        name: team.teamName,
        owner: team.ownerName,
        woba,
        bat_total,
        pit_total,
        actual_total,
        pts_per_ip
      };
    });
    sortArrayByKey(teams, 'actual_total');
    Tab.msg({code: 'LOG', teams});
    this.setState({ ready, teams });
  }

  teamRow = (team) => {
    return (
      <tr key={team.owner}>
        <td>{team.owner}</td>
        <td>{team.woba}</td>
        <td>{team.bat_total}</td>
        <td>{team.pts_per_ip}</td>
        <td>{team.actual_total}</td>
      </tr>
    );
  };

  render = () => {
    if (!this.state.ready) {
      return (
        <h4>Loading teams...</h4>
      );
    }

    return (
      <table className="team-table">
        <thead><tr><th>Owner</th><th>wOBA</th><th>bPTS</th><th>pPTS/IP</th><th>Actual</th></tr></thead>
        <tbody>{this.state.teams.map(team => { return this.teamRow(team); })}</tbody>
      </table>
    );
  }
}
