import React, { Component } from 'react';
import './App.css';

const Trakt = require('trakt.tv');
const trakt = new Trakt({
  client_id: '8b333edc96a59498525b416e49995b338e2c53a03738becfce16461c1e1086a3',
  client_secret: '93e1f2eb9e3c9e43cb06db7fd98feb630e8c90157579fa9af723d7181884ecb1',
  redirect_uri: 'http://localhost:3000',
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
      console.log("poop");
      results.map(function(his) {
        let ttype;
        (his.type === "episode") ? ttype = { tvdb: his.show.ids.tvdb } : ttype = { tmdb: his.movie.ids.tmdb };
        mdata.images[(his.type === "episode") ? "show" : his.type](ttype).then(result => {
          if (result.poster === undefined) {
            result.poster = "https://trakt.tv/assets/placeholders/thumb/poster-78214cfcef8495a39d297ce96ddecea1.png"
          }
          his = Object.assign(his, { poster: result.poster });
          history.push(his);
          that.setState({ history: history });
        });
      })});
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
      this.state.history.map((item) => {
        switch (item.type) {
          case "episode":
            his.push(<div className="posterParent"><img src={item.poster} alt={item.show.title} className="poster" /></div>);
            break;
          case "movie":
            his.push(<div className="posterParent"><img src={item.poster} alt={item.movie.title} className="poster" /></div>);
            break;
        }
      });
    }

    return (
      <div style={{ display: 'flex' }}>
        {his}
      </div>
    );
  }
}

export default App;
