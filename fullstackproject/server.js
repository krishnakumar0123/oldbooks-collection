const express = require("express");
const app = express();
var passwordHash=require("password-hash");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static("public"));

app.set("view engine", "ejs");

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Filter } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(firebaseApp);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/" + "signup.html");
});

app.post("/signupsubmit",function(req, res) {
  console.log(req.body);

  db.collection("data")
  .where(
    Filter.or(
    Filter.where("email","==",req.body.email),
    Filter.where("password","==",req.body.password)
    )
  )
  .get()
  .then((docs) => {
    if(docs.size > 0){
      res.send("account already exist with email");
    }
       else{
          db.collection("data")
          .add({
            username: req.body.username,
            email: req.body.email,
            password: passwordHash.generate(req.body.password),
          })
          .then(() => {
            res.sendFile(__dirname + "/public/" + "login.html");
          })
          .catch(() => {
            res.send("something went wrong");
          });
        }
  });
});
app.post("/loginsubmit",function(req, res) {
    db.collection("data")
    .where("username","==",req.body.username)
    .get()
    .then((docs) => {
        let verified = false;
        docs.forEach(doc => {
        verified = passwordHash.verify(req.body.password,doc.data().password);
        console.log(doc.id, '=>', doc.data());
      });
     if(verified){
      res.sendFile(__dirname + "/public/" + "dashboard.html");
     }
     else{
      res.send("fail");
     }
    });
});
app.listen(9009, () => {
  console.log('Server is running on port 9009');
});