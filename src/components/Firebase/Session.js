import firebase from 'firebase';

class Session {
  static instance = null;

  constructor(){
    var config = {
      apiKey: "AIzaSyA7FA49c3fKEgwnzXnD6sI7HAEr1YEold4",
      authDomain: "restman-e946c.firebaseapp.com",
      databaseURL: "https://restman-e946c.firebaseio.com",
      projectId: "restman-e946c",
      storageBucket: "restman-e946c.appspot.com",
      messagingSenderId: "241086726169"
    };
    this.session = firebase.initializeApp(config);
    this.isAuthed = false;
  }

  static getInstance(){
    if(Session.instance==null) Session.instance = new Session();
    return Session.instance;
  }

  static setAuthed(){
    Session.instance.isAuthed = true;
  }

  static isAuthed(){
    if(Session.instance==null) return false;
    return Session.instance.isAuthed;
  }

}

export default Session;
