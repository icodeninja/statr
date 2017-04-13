import React, { Component } from 'react';

import { wobaFromStats,
        sumValues,
        sortArrayByKey,
        ipToInt } from '../lib/calc';

import Dispatcher from '../lib/dispatcher';
import Tab from '../lib/tab';

import {Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table';

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

  teamRow = (team, idx) => (
    <TableRow key={team.owner}>
      <TableCell>{idx}</TableCell>
      <TableCell>{team.owner}</TableCell>
      <TableCell>{team.woba}</TableCell>
      <TableCell>{team.bat_total}</TableCell>
      <TableCell>{team.pts_per_ip}</TableCell>
      <TableCell>{team.actual_total}</TableCell>
    </TableRow>
  );

  render = () => {
    if (!this.state.ready) {
      return (
        <h4>Loading teams...</h4>
      );
    }

    return (
      <Table selectable={false}>
        <TableHead>
          <TableCell />
          <TableCell>Owner</TableCell>
          <TableCell>wOBA</TableCell>
          <TableCell>bPTS</TableCell>
          <TableCell>pPTS/IP</TableCell>
          <TableCell>Adjusted</TableCell>
        </TableHead>
        {this.state.teams.map((team, idx) => (this.teamRow(team, idx + 1)))}
      </Table>
    );
  }
}
