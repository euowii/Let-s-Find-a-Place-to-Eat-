const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
app.set('view engine', 'ejs');

var location = '';

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req,res){
  console.log("helo");
  var streetInput = req.body.street;
  var newStreet = streetInput.split(' ').join('+');
  var city = req.body.city;
  var state = req.body.state;
  var radius = req.body.radius * 1609.34;
  var rating = req.body.rating;
  var input = newStreet + ',+' + city + ',+' + state;
  console.log(input);
  if (rating > 5){
    res.sendFile(__dirname + "/Please_enter_a_rating.html");
  }

  const key = "AIzaSyB_RsE8WgSzOI7YWEU0GvWpiA0TMTkmOvE#"
  const url = "https:maps.googleapis.com/maps/api/geocode/json?address=" + input + "&key=" + key
  console.log(url);

  https.get(url, function(response){
  let result = '';

  response.on("data", function(data){
    result += data;
  });

  response.on('end',function(){
  const locData = JSON.parse(result);
  console.log(locData.status);
  if (locData.status === "ZERO_RESULTS"){
    res.sendFile(__dirname + "/invalid.html");
  }
  else{
  const lat = (locData.results[0].geometry.location.lat);
  const long = (locData.results[0].geometry.location.lng);
  location = lat+"%2C"+long;
  console.log(location);
}

  const url2 = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + location + "&radius=" + radius + "&type=restaurant&key=" + key
  console.log(url2);
  https.get(url2, function(response2){
    let result2  = '';

  response2.on("data", function(data){
    result2  +=  data;
  });
  response2.on('end', function(){
    const eatData = JSON.parse(result2);
    if (eatData.status === "ZERO_RESULTS"){
      res.sendFile(__dirname + "/too_picky.html");
    }
    const list = [];
    for (let i = 0; i <eatData.results.length; i++){
      if (Object.keys(eatData.results[i]).length == 17 && eatData.results[i].rating >= rating){
        list.push({key: eatData.results[i].name, value: eatData.results[i].vicinity});
      }
    }
    if (list.length == 0 & eatData.status !== "ZERO_RESULTS" ){
      console.log(list);
      res.sendFile(__dirname + "/too_picky2.html")
    }
    else if (list.length != 0){
    const random = Math.floor(Math.random() * list.length)
    const place = list[random].key;
    const address = list[random].value;
    console.log(place);
    console.log(address);
    res.render("list", {placeEat: place, placeAddress: address});
  }
    })
  })
  });
  })
  })
  app.post("/succ", function(req,res){
    res.redirect("/")
  });

  app.post("/too_picky", function(req,res){
    res.redirect("/")
  });

  app.post("/too_picky2", function(req,res){
    res.redirect("/")
  });

  app.post("/invalid", function(req,res){
    res.redirect("/")
  });

  app.post("/list", function(req,res){
    res.redirect("/")
  });

app.listen(process.env.PORT || 3000, function(){
  console.log("started");
});
