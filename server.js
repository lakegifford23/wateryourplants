//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

//..............Create an Express server object..................//
const app = express();
const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
//..............Apply Express middleware to the server object....//
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());
app.use(express.static('public')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library

//.............Define server routes..............................//
//Express checks routes in the order in which they are defined

app.get('/', function(request, response) {
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const d = new Date();
  let day = weekday[d.getDay()];
  //console.log(day);

  let dayObject = JSON.parse(fs.readFileSync('data/days.json'));
  let plants = JSON.parse(fs.readFileSync('data/plants.json'));
  let data2=[];

  for(name in plants){
    data2.push(plants[name])
  }
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index", {
    data: dayObject,
    day: day,
    data2: data2
  });
});

app.get('/schedule', function(request, response) {
    let dayObject = JSON.parse(fs.readFileSync('data/days.json'));
    let plants = JSON.parse(fs.readFileSync('data/plants.json'));
    let data2=[];

    for(name in plants){
      data2.push(plants[name])
    }
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("schedule", {
      data: dayObject,
      data2: data2
    });
});
let players = (JSON.parse(fs.readFileSync('data/plants.json')));

  //console.log(players.plant.photo);

app.get('/plants', function(request, response) {
  let plants = JSON.parse(fs.readFileSync('data/plants.json'));
  let plantArray=[];

  //create an array to use sort, and dynamically generate win percent
  for(name in plants){
    plantArray.push(plants[name])
  }

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("plants",{
    data: plantArray
  });
});

app.get('/plant/:plantName', function(request, response) {
  let plants = JSON.parse(fs.readFileSync('data/plants.json'));

  // using dynamic routes to specify resource request information
  let plantName = request.params.plantName;

  if(plants[plantName]){
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("plantDetails",{
      data: plants[plantName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});

app.get('/plantCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("plantCreate");
});

app.post('/plantCreate', function(request, response) {
    let watered;
  let dayObject = JSON.parse(fs.readFileSync('data/days.json'));
    if(request.body.wateredChecked == "checked"){
      watered = "checkedPlants";
    }else{
    watered = "wateredPlants";
    }
    console.log(watered);
    let plantName = " " + request.body.plantName;
    let plantLocation = request.body.plantLocation;
    let waterAmount = request.body.waterAmount;
    let days = request.body.days;
    if (typeof days === 'string' || days instanceof String){
      days = [days];
    }

    console.log(days, "hello");
    for(i in days){
      console.log(days[i]);
      for(x in weekday){
        if(days[i] == weekday[x]){
          console.log(i);
          console.log(x);

          dayObject[weekday[x]][watered].push(plantName);
        }
      }
    }
    if(plantName&&plantLocation&&waterAmount&&days&&watered){
      let plants = JSON.parse(fs.readFileSync('data/plants.json'));
      let newPlant={
        "name": plantName ,
        "location": plantLocation,
        "water": waterAmount,
        "days": days,
        "watered": watered
      }
      plants[plantName] = newPlant;
      fs.writeFileSync('data/plants.json', JSON.stringify(plants));
      fs.writeFileSync('data/days.json', JSON.stringify(dayObject));


      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/plant/"+plantName);
    }else{
      response.status(400);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"400"
      });
    }
});

// Because routes/middleware are applied in order,
// this will act as a default error route in case of
// a request fot an invalid route
app.use("", function(request, response){
  response.status(404);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    "errorCode":"404"
  });
});

//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});
