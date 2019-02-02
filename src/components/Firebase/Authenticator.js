import Session from './Session';

class Authenticator {
  static instance = null;

  constructor(){
    this.auth = Session.getInstance().session.auth();
  }

  static getInstance(){
    if(Authenticator.instance==null) Authenticator.instance = new Authenticator();
    return Authenticator.instance;
  }

  static async getSession(email, password){
      if(Session.isAuthed()) return {status:true, session:Session.getInstance().session};
      return new Promise(resolve=>{
        var result = Authenticator.getInstance().emailAuth(email,password);
        if(result.status) Session.setAuthed();
        resolve(result);
      });
  }

  static async login(email, password){
    var session = await Authenticator.getSession(email, password);
    if(!session.status) return false;
    return true;
  }

  static async isLoggedIn(){
    return new Promise(resolve=>{
      Authenticator.getInstance().auth.onAuthStateChanged(function(user){
        resolve(user);
      });
    });
  }

  static async logout(){
    return new Promise(resolve=>{
      Authenticator.getInstance().auth.signOut().then(function() {
        resolve();
      });
    });
  }

  emailAuth(email, password){
    console.log("Auth is called");
    var instance = this;
    return new Promise(resolve=> {
        instance.auth.signInWithEmailAndPassword(email, password).then(function(credential){
        var result = {status: true, credential:credential};
        resolve(result);
      }, function(error){
        var result = {status: false, code:error.Code, message:error.message};
        resolve(result);
      });
    });
  }
}

export default Authenticator;
