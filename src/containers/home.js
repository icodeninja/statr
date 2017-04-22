import React, { Component } from 'react';
import { Tab, Tabs } from 'react-toolbox';
import tabTheme from './tab.sass';
/**
 * Modules
 */
import Dispatcher from '../lib/dispatcher';
import BrowserTab from '../lib/tab';

/**
 * Components
 */
import Teams from '../components/teams';
import Error from '../components/error';


/**
 * Container definition
 */
export default class Home extends Component {

  state = {
    script_active: false,
    invalid_page: false,
    tab: 0
  };

  componentDidMount = () => {
    this._catch = Dispatcher.register(this._catcher);
  }

  componentWillUnmount = () => {
    Dispatcher.unregister(this._catch);
  }

  navigate = (tab) => {
    this.setState({tab});
  }

  _catcher = (payload) => {
    switch (payload.code) {
      case 'CONTENTSCRIPT_ACTIVE':
        this.setState({
          script_active: true
        }, BrowserTab.msg({code: 'GET_TEAMS'}));
      break;
      case 'INVALID_PAGE':
        this.setState({
          invalid_page: true
        });
      break;
      default:
      break;
    }
  }

  boop = () => {
    BrowserTab.msg({boo: 'per'});
  }

  render = () => {
    if (this.state.invalid_page) {
      return <Error />;
    }
    return (
      <Tabs index={this.state.tab} onChange={this.navigate}>
        <Tab label='Standings' theme={tabTheme}>
          {this.state.script_active ? <Teams /> : <p>ih</p>}
        </Tab>
      </Tabs>
    );
  }
}
