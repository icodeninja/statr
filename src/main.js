import React    from 'react';
import ReactDOM from 'react-dom';

import Dispatcher from './lib/dispatcher';

import Home from './containers/home';

chrome.runtime.onMessage.addListener((message, sender, response) => {
  Dispatcher.dispatch(message);
});

ReactDOM.render(<Home />, document.getElementById('app'));

document.addEventListener('DOMContentLoaded', function(){
  chrome.tabs.query({currentWindow: true, active: true}, tabs => {
    let tab = tabs[0];
    if(tab.url.indexOf('games.espn.com/flb/standings') !== -1) {
      chrome.tabs.executeScript(tab.id, {file: "scripts/content.js"});
    } else {
      console.log('dispatching code...');
      Dispatcher.dispatch({
        code: 'INVALID_PAGE'
      });
    }
  });
});