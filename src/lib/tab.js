
class Tab {
  constructor () {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      console.log(tabs);
      Object.keys(tabs[0]).forEach(key => {
        this[key] = tabs[0][key];
      });
    });
  }
  msg = (payload) => {
    chrome.tabs.sendMessage(this.id, payload, console.log);
  }
}

export default new Tab();
