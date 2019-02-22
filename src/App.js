import React, { Component } from "react";
import { BrowserRouter, Switch } from "react-router-dom";

import SearchForm from "./components/SearchForm/index";
import Routes from "./components/Routes";

let port = 3000;

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      chests: [],
      player: [],
      battlelog: [],

      playerStatus: "player not found",

      playerCookie: this.getCookie("playertag"),
      clanCookie: this.getCookie("clantag"),
      formMessage: "",

      loading: true,
      searchText: "",
      selection: "playertag"
    };
  }

  componentDidMount() {
    console.log("Mount!");

    if (this.state.playerCookie !== false) {
      console.log("calling");
      this.callPlayerAPI(this.state.playerCookie);
    }
  }

  setCookie(cname, cvalue, exdays) {
    let date = new Date();
    date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = `expires=${date.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  }

  getCookie(name) {
    let pairs = document.cookie.split("; "),
      count = pairs.length,
      parts;
    console.log("Get cookie");
    while (count--) {
      parts = pairs[count].split("=");
      if (parts[0] === name) return parts[1];
    }
    return false;
  }

  callPlayerAPI = player => {
    console.log("Fetch all!");
    Promise.all([
      fetch(`http://localhost:${port}/api/chests/${player}`)
        .then(results => {
          return results.json();
        })
        .then(data => {
          this.setState({ chests: data.doc, loading: false });
        }),
      fetch(`http://localhost:${port}/api/battlelog/${player}`)
        .then(results => {
          return results.json();
        })
        .then(data => {
          this.setState({ battlelog: data.doc });
        }),
      fetch(`http://localhost:${port}/api/player/${player}`)
        .then(results => {
          return results.json();
        })
        .then(data => {
          this.setState({ player: data.doc });
        })
    ]);
  };

  onSearchChange = e => {
    this.setState({ searchText: e.target.value });
  };

  checkForm = str => {
    if (str.length < 4) return "Playertag provided is too short";
    else if (str.length > 12) return "Playertag provide is too long";
    else if (str.search(/[^PYLQGRJCUV0289]/) !== -1)
      return `Playertag should only include these characters: 
      Numbers: 0, 2, 8, 9 
      Letters: P, Y, L, Q, G, R, J, C, U, V`;
    else return true;
  };

  handleSelect = e => {
    this.setState({ selection: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    let checks = this.checkForm(this.state.searchText.toUpperCase());

    if (checks !== true) this.setState({ formMessage: checks });
    else {
      this.setState({ formMessage: "" });
      this.setCookie("playertag", this.state.searchText.toUpperCase(), 365);
      let cooks = this.getCookie("playertag");
      this.setState({ playerCookie: cooks });

      this.callPlayerAPI(cooks);
    }
  };

  handleUpdate = e => {
    e.preventDefault();
    this.updateData();
  };

  updateData = () => {
    console.log("Update data!");
    let player = this.getCookie("playertag");
    fetch(`http://localhost:${port}/api/${player}`)
      .then(results => {
        return results.json();
      })
      .then(data => {
        this.setState({ playerStatus: data });
        console.log(data);
      })
      .then(() => {
        if (this.state.playerStatus === "OK") {
          this.callPlayerAPI(player);
          window.location.reload();
        }
      });
  };

  alertClient = () => {
    if (this.state.formMessage !== "")
      return (
        <div className="alert-warning">
          <p>{this.state.formMessage}</p>
        </div>
      );
  };

  render() {
    return (
      <BrowserRouter>
        <div className="container">
          <header>
            <h1>Welcome Clasher</h1>

            {this.alertClient()}

            <SearchForm
              onSearchChange={this.onSearchChange}
              handleSubmit={this.handleSubmit}
              playerCookie={this.state.playerCookie}
              handleUpdate={this.handleUpdate}
              handleSelect={this.handleSelect}
              selection={this.selection}
            />
          </header>
          <Switch>
            <Routes
              loading={this.state.loading}
              playerCookie={this.state.playerCookie}
              player={this.state.player}
              playerStatus={this.state.playerStatus}
              chests={this.state.chests}
              battlelog={this.state.battlelog}
            />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}