//CCCS425 Final Project Part 2 - Patrick McClintock

// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

let bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));
//let accounts = new Map();

let itemavail = new Map();
let itemsold = new Map();
let reviewseller = new Map();
let reviewdetails = new Map();
let shipped = new Map();
//let ban = new Map();
let sessions = new Map();
let counters = new Map();
//unique number generated for token
let counter = 1;
let sessionid = () => {
  counter = counter + 1;
  return "token-" + counter;
};

var arrAccount = [];
arrAccount.length = 0;

var arrListing = [];
arrListing.length = 0;

var arrCart = [];
arrCart.length = 0;

var arrReview = [];
arrReview.length = 0;

var arrMessage = [];
arrMessage.length = 0;

let listingid = () => {
  counter = counter + 1;
  return "listing-" + counter;
};

app.get("/sourcecode", (req, res) => {
  res.send(
    require("fs")
      .readFileSync(__filename)
      .toString()
  );
});

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

//acount creation
app.post("/signup", (req, res) => {
  let parsed = JSON.parse(req.body);
  let username = parsed.username;
  let password = parsed.password;
  console.log("signup: " + username + " password: " + password);

  var existuser = "";
  for (var i in arrAccount) {
    if (arrAccount[i][0] == username) {
      existuser = arrAccount[i][0];
    }
  }

  if (existuser !== "") {
    res.send(JSON.stringify({ success: false, reason: "Username exists" }));
    return;
  }

  if (password == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "password field missing" })
    );
    return;
  }
  if (username == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "username field missing" })
    );
    return;
  }

  arrAccount.push([username, password, ""]);
  for (var i in arrAccount) {
  }
  res.send(JSON.stringify({ success: true }));
});

//login
app.post("/login", (req, res) => {
  let parsed = JSON.parse(req.body);
  let username = parsed.username;
  let password = parsed.password;
  console.log("login: " + username + " password: " + password);

  var existuser = "";
  var existpassword = "";
  for (var i in arrAccount) {
    if (arrAccount[i][0] === username) {
      existuser = arrAccount[i][0];
      existpassword = arrAccount[i][1];
    }
  }

  if (username == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "username field missing" })
    );
    return;
  }

  if (password == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "password field missing" })
    );
    return;
  }

  if (existuser == "") {
    res.send(JSON.stringify({ success: false, reason: "User does not exist" }));
    return;
  }

  if (password !== existpassword) {
    res.send(JSON.stringify({ success: false, reason: "Invalid password" }));
    return;
  }

  if (username == existuser && password == existpassword) {
    let sessId = sessionid();
    arrAccount.push([username, password, sessId]);
    console.log("$$username : " + username + " token : " + sessId);
    res.send(JSON.stringify({ success: true, token: sessId }));
    return;
  }
});

//Change Password
app.post("/change-password", (req, res) => {
  let parsed = JSON.parse(req.body);
  let username = parsed.username;
  let oldpassword = parsed.oldPassword;
  let newpassword = parsed.newPassword;
  let token = req.headers.token;
  console.log(
    "Change Password: " +
      username +
      " old password: " +
      oldpassword +
      " new password: " +
      newpassword
  );

  var existtoken = "";
  var existpassword = "";
  var index = 0;
  for (var i in arrAccount) {
    //console.log (arrAccount[i][2]);
    if (arrAccount[i][2] === token) {
      existtoken = arrAccount[i][2];
      existpassword = arrAccount[i][1];
      index = i;
    }
  }

  if (token == undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (existtoken == "") {
    res.send(
      JSON.stringify({ success: false, reason: "token does not exist" })
    );
    return;
  }

  if (oldpassword !== existpassword) {
    res.send(
      JSON.stringify({ success: false, reason: "Unable to authenticate" })
    );
    return;
  }

  if (token == existtoken && oldpassword == existpassword) {
    arrAccount[index][1] = newpassword;
    res.send(JSON.stringify({ success: true }));
    return;
  }
});

//create-listing
app.post("/create-listing", (req, res) => {
  let parsed = JSON.parse(req.body);
  let price = parsed.price;
  let description = parsed.description;
  let token = req.headers.token;
  console.log("Create listing: " + token + " description: " + description);
  var existtoken = "";
  var existusername = "";
  //var existpassword = "";
  var index = 0;
  for (var i in arrAccount) {
    if (arrAccount[i][2] === token) {
      existtoken = arrAccount[i][2];
      existusername = arrAccount[i][0];
    }
  }

  if (token == undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (existtoken == "") {
    res.send(
      JSON.stringify({ success: false, reason: "token does not exist" })
    );
    return;
  }

  if (price == undefined) {
    res.send(JSON.stringify({ success: false, reason: "price field missing" }));
    return;
  }

  if (description == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "description field missing" })
    );
    return;
  }
  let listid = listingid();
  arrListing.push([listid, price, description, token, existusername, ""]);
  shipped.set(listid, "not-shipped");
  console.log("++++" + listid + " " + description + " token " + token);
  itemavail.set(listid, "yes");
  res.send(JSON.stringify({ success: true, listingId: listid }));
  return;
});

//listing
app.get("/listing", (req, res) => {
  let token = req.headers.token;
  let existusername = sessions.get(token);
  let listing = req.query.listingId;
  console.log("get listing " + token + "  " + existusername + "   " + listing);

  var existlist = "";
  var index = 0;
  for (var i in arrListing) {
    if (arrListing[i][0] === listing) {
      existlist = arrListing[i][0];
      index = i;
    }
  }

  if (listing !== existlist) {
    res.send(JSON.stringify({ success: false, reason: "Invalid listing id" }));
    return;
  }
  console.log("prep message index = " + index);
  var message = {
    price: arrListing[index][1],
    description: arrListing[index][2],
    itemId: arrListing[index][0],
    sellerUsername: arrListing[index][4]
  };
  res.send(JSON.stringify({ success: true, listing: message }));
  return;
});

//Modify listing
app.post("/modify-listing", (req, res) => {
  let parsed = JSON.parse(req.body);
  let listing = parsed.itemid;
  let price = parsed.price;
  let description = parsed.description;
  let token = req.headers.token;
  console.log(
    "Modifylisting: " +
      token +
      "listing: " +
      listing +
      " description: " +
      description
  );
  var existtoken = "";
  var existlisting = "";
  var index = 0;
  for (var i in arrListing) {
    if (arrListing[i][0] === listing) {
      existtoken = arrListing[i][3];
      existlisting = arrListing[i][0];
      index = i;
    }
  }

  if (token == undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (listing == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "itemid field missing" })
    );
    return;

    if (token !== existtoken) {
      res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
      return;
    }

    if (existtoken == "") {
      res.send(
        JSON.stringify({ success: false, reason: "token does not exist" })
      );
      return;
    }
    ``;
  }

  if (price !== undefined) arrListing[index][1] = price;
  if (description !== undefined) arrListing[index][2] = description;
  res.send(JSON.stringify({ success: true }));
  return;
});

//add to cart
app.post("/add-to-cart", (req, res) => {
  let parsed = JSON.parse(req.body);
  let listing = parsed.itemid;
  let token = req.headers.token;

  var existtoken = "";
  var sellertoken = "";
  var existlisting = "";
  var existprice;
  var existusername;
  var existdescription;
  //var index = 0;

  for (var j in arrAccount) {
    if (arrAccount[j][2] === token) {
      existtoken = arrAccount[j][2];
    }
  }

  for (var i in arrListing) {
    if (arrListing[i][0] === listing) {
      sellertoken = arrListing[i][3];
      existlisting = arrListing[i][0];
      existprice = arrListing[i][1];
      existusername = arrListing[i][4];
      existdescription = arrListing[i][2];
    }
  }

  if (token == undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (listing == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "itemid field missing" })
    );
    return;
  }
  if (existlisting == "") {
    res.send(JSON.stringify({ success: false, reason: "Item not found" }));
    return;
  }
  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (existtoken == "") {
    res.send(
      JSON.stringify({ success: false, reason: "token does not exist" })
    );
    return;
  }
  if (listing == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "itemid field missing" })
    );
    return;
  }

  arrCart.push([
    existlisting,
    existprice,
    existdescription,
    existusername,
    existtoken,
    "in cart"
  ]);
  res.send(JSON.stringify({ success: true }));
  return;
});

//list cart
app.get("/cart", (req, res) => {
  let token = req.headers.token;

  var message = [];
  var index = 0;
  for (var i in arrCart) {
    if (arrCart[i][4] === token) {
      message[index] = {
        price: arrCart[i][1],
        description: arrCart[i][2],
        itemId: arrCart[i][0],
        sellerUsername: arrCart[i][3]
      };
      index += 1;
    }
  }
  var existtoken = "";
  for (var i in arrAccount) {
    if (arrAccount[i][2] == token) {
      existtoken = token;
    }
  }

  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  res.send(JSON.stringify({ success: true, cart: message }));
  return;
});

//checkout
app.post("/checkout", (req, res) => {
  let token = req.headers.token;
  console.log("checkout: " + token);
  var existtoken = "";
  for (var i in arrAccount) {
    if (arrAccount[i][2] == token) {
      existtoken = token;
    }
  }

  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  var notavailable = 0;
  var hasitem = 0;
  console.log("cart for " + token);
  for (var i in arrCart) {
    if (arrCart[i][4] == token) {
      console.log(
        "token - " +
          arrCart[i][4] +
          " ItemID - " +
          arrCart[i][0] +
          " Status " +
          arrCart[i][5]
      );
    }

    if (arrCart[i][4] == token && arrCart[i][5] == "in cart") {
      console.log(
        "#Incart - " +
          arrCart[i][4] +
          " ItemID - " +
          arrCart[i][0] +
          " Status " +
          arrCart[i][5]
      );
      hasitem += 1;
    }
  }

  for (var i in arrCart) {
    if (arrCart[i][4] == token && itemavail.get(arrCart[i][0]) == "no") {
      res.send(
        JSON.stringify({
          success: false,
          reason: "Item in cart no longer available"
        })
      );
      return;
    }
  }
  if (hasitem == 0) {
    res.send(JSON.stringify({ success: false, reason: "Empty cart" }));
    return;
  }

  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  for (var k = 0; k < arrCart.length; k++) {
    console.log("Checkout Cart token: " + arrCart[k][4] + "  token " + token);
    if (arrCart[k][4] === token) {
      itemavail.set(arrCart[k][0], "no");
      itemsold.set(arrCart[k][0], token);
      arrCart[k][5] = "sold";
    }
  }
  res.send(JSON.stringify({ success: true }));

  return;
});

//purchase-history
app.get("/purchase-history", (req, res) => {
  let token = req.headers.token;
  console.log("purchase history: " + token);
  var message = [];
  var index = 0;
  for (var i in arrCart) {
    if (arrCart[i][4] === token && arrCart[i][5] === "sold") {
      message[index] = {
        price: arrCart[i][1],
        description: arrCart[i][2],
        itemId: arrCart[i][0],
        sellerUsername: arrCart[i][3]
      };
      index += 1;
    }
  }
  var existtoken = "";
  for (var i in arrAccount) {
    if (arrAccount[i][2] == token) {
      existtoken = token;
    }
  }

  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  res.send(JSON.stringify({ success: true, purchased: message }));
  return;
});

//chat
app.post("/chat", (req, res) => {
  //check for empty body before using Parse which causes errors
  if (Object.keys(req.body).length == 0) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  let parsed = JSON.parse(req.body);
  let destination = parsed.destination;
  let contents = parsed.contents;
  let token = req.headers.token;

  var existuser = "";
  var existsource = "";

  if (destination == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "destination field missing" })
    );
    return;
  }

  if (contents == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "contents field missing" })
    );
    return;
  }

  for (var i in arrAccount) {
    if (arrAccount[i][0] === destination) {
      existuser = arrAccount[i][0];
    }
  }

  for (var k in arrAccount) {
    if (arrAccount[k][2] === token) {
      existsource = arrAccount[k][0];
    }
  }

  if (existuser == "") {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Destination user does not exist"
      })
    );
    return;
  }

  if (destination == existuser) {
    arrMessage.push([existsource, existuser, contents]);
    res.send(JSON.stringify({ success: true }));
    return;
  }
});

//chat-messages
app.post("/chat-messages", (req, res) => {
  //check for empty body before using Parse which causes errors
  if (Object.keys(req.body).length == 0) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  let parsed = JSON.parse(req.body);
  let destination = parsed.destination;
  let token = req.headers.token;

  var existuser = "";
  var existsource = "";

  for (var i in arrAccount) {
    if (arrAccount[i][0] === destination) {
      existuser = arrAccount[i][0];
    }
  }

  if (destination == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "destination field missing" })
    );
    return;
  }

  if (existuser == "") {
    res.send(
      JSON.stringify({ success: false, reason: "Destination user not found" })
    );
    return;
  }

  for (var k in arrAccount) {
    if (arrAccount[k][2] === token) {
      existsource = arrAccount[k][0];
    }
  }

  for (var i in arrMessage)
    console.log(
      "Messagelog " +
        i +
        " " +
        arrMessage[i][0] +
        " " +
        arrMessage[i][1] +
        " " +
        arrMessage[i][2]
    );
  console.log(
    "Exist source " + existsource + "     destination " + destination
  );
  var message = [];
  var index = 0;
  for (var i in arrMessage) {
    if (
      (arrMessage[i][0] === existsource && arrMessage[i][1] === destination) ||
      (arrMessage[i][0] === destination && arrMessage[i][1] === existsource)
    ) {
      message[index] = {
        from: arrMessage[i][0],
        contents: arrMessage[i][2]
      };

      index += 1;
    }
  }

  if (destination == existuser) {
    res.send(JSON.stringify({ success: true, messages: message }));
    return;
  }
});

//ship
app.post("/ship", (req, res) => {
  //check for empty body before using Parse which causes errors
  if (Object.keys(req.body).length == 0) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  let parsed = JSON.parse(req.body);
  let listing = parsed.itemid;
  let token = req.headers.token;

  var existuser = "";
  var existlisting = "";
  var existsold = "";
  for (var i in arrCart) {
    if (arrCart[i][0] === listing) {
      existlisting = arrCart[i][0];
    }
  }
  for (var k in arrListing) {
    if (arrListing[k][3] === token && arrListing[k][0] === listing) {
      existuser = arrListing[k][3];
      console.log(
        "TOKEN: " + token + "   EXISTUSER: " + existuser + " LISTING " + listing
      );
    }
  }

  for (var l in arrCart) {
    if (arrCart[l][0] == listing && arrCart[l][5] === "sold") {
      existsold = "sold";
    }
  }

  if (existsold == "") {
    res.send(JSON.stringify({ success: false, reason: "Item was not sold" }));
    return;
  }

  if (shipped.get(listing) == "shipped") {
    res.send(
      JSON.stringify({ success: false, reason: "Item has already shipped" })
    );
    return;
  }
  if (existuser == "") {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not selling that item"
      })
    );
    return;
  }

  shipped.set(listing, "shipped");
  res.send(JSON.stringify({ success: true }));
  return;
});

//status
app.get("/status", (req, res) => {
  let listing = req.query.itemid;
  console.log("status " + listing);

  var existsold = "";
  for (var l in arrCart) {
    if (arrCart[l][0] == listing && arrCart[l][5] === "sold") {
      existsold = "sold";
    }
  }

  if (existsold == "") {
    res.send(JSON.stringify({ success: false, reason: "Item not sold" }));
    return;
  }

  if (shipped.get(listing) == "shipped") {
    res.send(JSON.stringify({ success: true, status: "shipped" }));
    return;
  }
  if (shipped.get(listing) == "not-shipped") {
    res.send(JSON.stringify({ success: true, status: "not-shipped" }));
    return;
  }

  res.send(JSON.stringify({ success: true }));
  return;
});

//review seller
app.post("/review-seller", (req, res) => {
  let parsed = JSON.parse(req.body);
  let numstars = parsed.numStars;
  let contents = parsed.contents;
  let listing = parsed.itemid;
  let token = req.headers.token;

  console.log(
    "review seller   numstars: " +
      numstars +
      " contents: " +
      contents +
      " itemid: " +
      listing +
      " token: " +
      token
  );

  var existtoken = "";
  var existuser = "";
  var selleruser = "";
  var index = 0;
  for (var i in arrAccount) {
    if (arrAccount[i][2] === token) {
      existtoken = arrAccount[i][2];
      existuser = arrAccount[i][0];
      index = i;
    }
  }

  for (var j in arrListing) {
    console.log(
      "#### listing token " +
        arrListing[j][3] +
        "  token  " +
        token +
        " seller name" +
        arrListing[j][4] +
        " exist token " +
        existtoken
    );
    if (arrListing[j][0] === listing) {
      selleruser = arrListing[j][4];
    }
  }

  if (token == undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (token !== existtoken) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (reviewseller.has(listing) == true) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "This transaction was already reviewed"
      })
    );
    return;
  }
  if (itemsold.get(listing) !== token) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User has not purchased this item"
      })
    );
    return;
  }
  reviewseller.set(listing, token);

  arrReview.push([selleruser, existuser, numstars, contents, listing]);
  res.send(JSON.stringify({ success: true }));

  for (var j in arrReview) {
    console.log(
      "+++++ " +
        arrReview[j][0] +
        "  +++  " +
        arrReview[j][1] +
        " +++ " +
        arrReview[j][2] +
        " +++ " +
        arrReview[j][3]
    );
  }

  return;
});

//reviews
app.get("/reviews", (req, res) => {
  let sellerusername = req.query.sellerUsername;
  console.log("reviews: " + sellerusername);
  var message = [];
  var index = 0;
  for (var i in arrReview) {
    console.log(
      "Seller username  array:  " +
        arrReview[i][0] +
        " selelrusername query: " +
        sellerusername
    );
    if (arrReview[i][0] === sellerusername) {
      message[index] = {
        from: arrReview[i][1],
        numStars: arrReview[i][2],
        contents: arrReview[i][3]
      };
      index += 1;
    }
  }
  console.log("review array contents");
  for (var i in arrReview)
    console.log(
      arrReview[i][0] +
        " + " +
        arrReview[i][1] +
        " + " +
        arrReview[i][2] +
        " + " +
        arrReview[i][3]
    );

  res.send(JSON.stringify({ success: true, reviews: message }));
  return;
});

//selling
app.get("/selling", (req, res) => {
  let sellerusername = req.query.sellerUsername;
  console.log("selling: " + sellerusername);
  var message = [];
  var index = 0;
  for (var i in arrListing) {
    if (arrListing[i][4] === sellerusername && arrListing[i][5] !== "sold") {
      message[index] = {
        price: arrListing[i][1],
        description: arrListing[i][2],
        itemId: arrListing[i][0],
        sellerUsername: arrListing[i][4]
      };
      index += 1;
    }
  }

  if (sellerusername == undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "sellerUsername field missing" })
    );
    return;
  }

  res.send(JSON.stringify({ success: true, selling: message }));
  return;
});

app.listen(process.env.PORT || 3000)
// const listener = app.listen(process.env.PORT, () => {
//   console.log("Your app is listening on port " + listener.address().port);
// });
