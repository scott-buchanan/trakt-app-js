import React, { Component } from 'react';
import './App.css';

const Trakt = require('trakt.tv');
const trakt = new Trakt({
  client_id: '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
  client_secret: '93e1f2eb9e3c9e43cb06db7fd98feb630e8c90157579fa9af723d7181884ecb1',
  debug: true,
});
const MData = require('mdata')
const mdata = new MData({
    tmdb: '89c6bd3331244e97eed61741fc798ab5',
    tvdb: '14D6270DF1395692'
})

class App extends Component {
  constructor() {
    super();
    this.state = {
      oauth: false,
      history: undefined,
    };
  }

  componentWillMount() {
    if (localStorage.getItem("traktOauth") !== null) {
      this.setState({ 'oauth': true });
      trakt.import_token(JSON.parse(localStorage.getItem("traktOauth"))).then(newTokens => {
        localStorage.setItem("traktOauth", JSON.stringify(newTokens));
      });
    }
  }

  componentDidMount() {
    const that = this;
    let history = [];
    trakt.users.history({ username: 'bukes' }).then(results => {
      console.log(1);
      results.map(function(his) {
        console.log(2);
        if (his.type === "episode") {
          mdata.images.show({
            tvdb: his.show.ids.tvdb
          }).then(result => {
            // if (result.poster === undefined) {
            //   result.poster = "https://trakt.tv/assets/placeholders/thumb/poster-78214cfcef8495a39d297ce96ddecea1.png"
            // }
            his = Object.assign(his, { poster: result.poster });
            history.push(his);
            that.setState({ history: history });
          });
        } else {
          // mdata.images.show({
          //   tvdb: history.movie.ids.tvdb
          // }).then(result => {
          //   this.setState({ history: Object.assign(history.movie, { poster: result.poster }) });
          //   console.log(history);
          //   this.forceUpdate();
          // });
        }
      })}).then(() => {
        console.log(4);
        // that.setState({ history: history })
        console.log(history);
      });
  }

  render() {
    if (localStorage.getItem('traktOauth') === null && window.location.search === "") {
      window.location.replace(trakt.get_url());
    }
    if (window.location.search !== "" && window.location.search.split("?")[1].includes("code")) {
      const code = window.location.search.split("?")[1].split("=")[1].split("&")[0];
      trakt.exchange_code(code).then(result => {
        localStorage.setItem("traktOauth", JSON.stringify(result));
        this.setState({ 'oauth': true });
      });
    }

    const his = [];
    if (this.state.history !== undefined) {
      this.state.history.map((show) => {
        his.push(<div><img src={show.poster} alt={show.show.title} className="poster" /></div>);
      });
    }

    return (
      <div>
        {his}
      </div>
    );
  }
}

export default App;
