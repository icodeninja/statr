import React, { Component } from 'react';

/**
 * Modules
 */
import Dispatcher from '../lib/dispatcher';
import Tab        from '../lib/tab';

/**
 * Components
 */
import Teams from '../components/teams';

/**
 * Container definition
 */
export default class Home extends Component {
  constructor(){
    super();
    this.state = {
      script_active: false,
      invalid_page: false,
    };
  }
  componentDidMount() {
    this._catch = Dispatcher.register(load => this._catcher(load));
  }
  componentWillUnmount() {
    Dispatcher.unregister(this._catch);
  }
  _catcher(payload) {
    switch(payload.code) {
      case 'CONTENTSCRIPT_ACTIVE':
        this.setState({
          script_active: true
        });
        Tab.msg({
          loo: 'per'
        });
      break;
      case 'INVALID_PAGE':
        this.setState({
          invalid_page: true
        });
      break;
    }
  }
  boop(){
    Tab.msg({boo:'per'});
  }
  render() {
    return (
      <div>
        <h2>Standings</h2>
        <Teams />
        {
          this.state.script_active ?
            <b>Script is active</b>
          :
            <i>Loading script...</i>
        }
        {
          this.state.invalid_page ?
            <h2>DUMBASS</h2>
          :
            <u onClick={this.boop}>...</u>
        }
      </div>
    );
  }
}
