import React, { Component } from 'react';

import { wobaFromStats,
        sumValues,
        sortArrayByKey,
        ipToInt } from '../../lib/calc';

import Dispatcher from '../../lib/dispatcher';
import Tab from '../../lib/tab';

import {Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table';
import FontIcon from 'react-toolbox/lib/font_icon';
import FontIconTheme from './icon.scss';

import TeamTheme from './teams.scss';

const columns = {
  'owner': 'Owner',
  'woba': 'wOBA',
  'bat_total': 'bPTS',
  'pts_per_pa': 'bPTS/PA',
  'pts_per_ip': 'pPTS/IP',
  'actual_total': 'Adjusted'
};

export default class Teams extends Component {
  state = {
    ready: false,
    sort: {
      col: 'actual_total',
      dir: false
    },
    teams: []
  };

  componentWillMount = () => {
    this._catch = Dispatcher.register(this.catcher);
  }

  componentWillUnmount = () => {
    Dispatcher.unregister(this._catch);
  }

  catcher = (message) => {
    switch (message.code) {
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
      const bat_total_raw = sumValues(team.stats.batting.totals);
      const bat_total = bat_total_raw.toFixed(1);
      const pit_total = sumValues(team.stats.pitching.totals).toFixed(1);
      const pts_per_ip = (pit_total / ipToInt(team.stats.pitching.counts.IP)).toFixed(3);
      const actual_total = (parseFloat(pts_per_ip) * averageInnings + parseFloat(bat_total)).toFixed(3);

      const bt = team.stats.batting.counts;
      const pa = parseInt(bt.AB || 0) + parseInt(bt.BB || 0) + parseInt(bt.HBP || 0) + parseInt(bt.SF || 0);
      const pts_per_pa = (bat_total_raw / pa).toFixed(3);
      return {
        name: team.teamName,
        owner: team.ownerName,
        woba,
        bat_total,
        pit_total,
        actual_total,
        pts_per_ip,
        pts_per_pa
      };
    });
    Tab.msg({code: 'LOG', teams});
    this.setState({ ready, teams });
  }

  teamRow = (team, idx) => (
    <TableRow key={team.owner}>
      <TableCell>{idx}</TableCell>
      <TableCell>{team.owner}</TableCell>
      <TableCell>{team.woba}</TableCell>
      <TableCell>{team.bat_total}</TableCell>
      <TableCell>{team.pts_per_pa}</TableCell>
      <TableCell>{team.pts_per_ip}</TableCell>
      <TableCell>{team.actual_total}</TableCell>
    </TableRow>
  )

  column = (col, sort) => (
    // <Th key={col} sortFunc={this.sort} sortKey={col} sort={sort}>{columns[col]}</Th>
    <TableCell theme={FontIconTheme} key={col} onClick={() => this.sort(col)}>
        {sort.col === col ?
          <FontIcon value='keyboard_arrow_down' /> :
          <FontIcon data-invisible='true' value='gif' />
        }
        {columns[col]}
    </TableCell>
  )

  sort = col => {
    const sort = this.state.sort;
    const dir = col === sort.col ? !sort.dir : sort.dir;
    this.setState({sort: {col, dir}});
  }

  render = () => {
    if (!this.state.ready) {
      return (
        <h4>Loading teams...</h4>
      );
    }

    console.log(FontIconTheme);

    const sort = this.state.sort;
    const teams = sortArrayByKey(this.state.teams, sort.col, sort.dir);

    return (
      <Table selectable={false} theme={TeamTheme}>
        <TableHead>
          <TableCell>&nbsp;</TableCell>
          {Object.keys(columns).map(col => this.column(col, sort))}
        </TableHead>
        {teams.map((team, idx) => this.teamRow(team, idx + 1))}
      </Table>
    );
  }
}
