//server dingen
const express = require("express");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
var path = require("path");

//save dingen
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db/db.json");
const db = low(adapter);

const adapter_vragen = new FileSync("db/db_vragen.json");
const db_vragen = low(adapter_vragen);

const adapter_results = new FileSync("db/db_results.json");
const db_results = low(adapter_results);

//maak een database
db.defaults({
    teamrood: 0,
    teamblauw: 0
}).write();

db_vragen.defaults({
    vraag: "Pepsi of Cola?",
    rood_antwoord: "Pepsi",
    blauw_antwoord: "Cola"
}).write();

db_results.defaults({
    old_data: []
}).write();

//server gebruik JSON body parser
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.set("public", path.join(__dirname, "/public"));
app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "pug");

/* Gedeelte voor de users */
//geef punten weer
app.get("/", function (req, res) {
    var teamrood = db
        .get("teamrood");
    var teamblauw = db
        .get("teamblauw");

    var total = teamrood + teamblauw;
    if (teamblauw == 0 && teamrood == 0) {
        var roodprocent = 50;
        var blauwprocent = 50;
    } else {
        var roodprocent = (100 / total) * teamrood;
        var blauwprocent = (100 / total) * teamblauw;
    }

    var vraag_kwestie = getKwestieEnVragen()

    res.render("index", {
        rood: teamrood,
        blauw: teamblauw,
        roodprocent: roodprocent,
        blauwprocent: blauwprocent,
        kwestie: vraag_kwestie.kwestie,
        rood_antwoord: vraag_kwestie.rood_antwoord,
        blauw_antwoord: vraag_kwestie.blauw_antwoord
    });
});
//updates opvragen van punten
app.get("/updateVals", function (req, res) {
    var teamrood = db
        .get("teamrood");
    var teamblauw = db
        .get("teamblauw");

    var total = teamrood + teamblauw;
    if (teamblauw == 0 && teamrood == 0) {
        var roodprocent = 50;
        var blauwprocent = 50;
    } else {
        var roodprocent = (100 / total) * teamrood;
        var blauwprocent = (100 / total) * teamblauw;
    }

    var vraag_kwestie = getKwestieEnVragen()

    res.send({
        rood: teamrood,
        blauw: teamblauw,
        roodprocent: roodprocent,
        blauwprocent: blauwprocent,
        kwestie: vraag_kwestie.kwestie,
        rood_antwoord: vraag_kwestie.rood_antwoord,
        blauw_antwoord: vraag_kwestie.blauw_antwoord
    });
});

function getKwestieEnVragen(){
    var kwestie = db_vragen
    .get("vraag").value();
    var rood_antwoord = db_vragen
        .get("rood_antwoord").value();
    var blauw_antwoord = db_vragen
        .get("blauw_antwoord").value();
    return {
        kwestie: kwestie,
        rood_antwoord: rood_antwoord,
        blauw_antwoord: blauw_antwoord
    };
}

app.get("/rasp_kewstie", function(req, res){
    var vraag_kwestie = getKwestieEnVragen();

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ kwestie: vraag_kwestie.kwestie, rood_vraag: vraag_kwestie.rood_antwoord, blauw_vraag: vraag_kwestie.blauw_antwoord }));
});

app.get("/stemmen", function (req, res) {
    var vraag_kwestie = getKwestieEnVragen();
    res.render("vote",{
         rood_antwoord: vraag_kwestie.rood_antwoord,
         blauw_antwoord: vraag_kwestie.blauw_antwoord,
         kwestie: vraag_kwestie.kwestie
    });
});

//dit is de functie om op web te stemmen op rood of blauw
app.post("/gestemd", function (req, res) {
  if(req.body.rood){
    db.update("teamrood", n => n + 1).write();
    console.log ("gestemd op rood");
    res.render("gestemd");
  } else if(req.body.blauw){
    db.update("teamblauw", n => n + 1).write();
    console.log ("gestemd op blauw");
    res.render("gestemd");
  } else {
    console.log("received post request with bad data");
    res.status(404).send("Error");
  }

});

/* Gedeelte om de posts van de "arduino"(nu een raspberry pi) te ontvangen */
//save punten van een post
app.post("/give_data", function (req, res) {
    res.set("Content-Type", "text/plain");
    console.log(req.body.rood);
    if (
        req.body.rood.match(/^[0-9]+$/) != null &&
        req.body.blauw.match(/^[0-9]+$/) != null
    ) {
        var roodpunten = Number(req.body.rood);
        var blauwpunten = Number(req.body.blauw);

        db.update("teamrood", n => n + roodpunten).write();
        db.update("teamblauw", n => n + blauwpunten).write();

        res.send();
    } else {
        console.log("received post request with bad data");
        res.status(404).send("Error");
    }
});

/* Gedeelte voor de admin */
//render het vraag formulier
app.get("/nieuwe_vraag", function (req, res) {
    res.render("vraagform");
});
//nieuwe vraag updaten
app.post("/nieuwe_vraag", function (req, res) {
    var nieuwe_kwestie = req.body.vraag;
    var nieuwe_rood_antwoord = req.body.rood_vraag;
    var nieuwe_blauw_antwoord = req.body.blauw_vraag;
    var password = req.body.wachtwoord;
    if (password == "rvbP@asp0p"){
        //get all results and questions
        var teamrood_punten_old = db
            .get("teamrood");
        var teamblauw_punten_old = db
            .get("teamblauw");
        var kwestie_old = db_vragen
            .get("vraag");
        var rood_antwoord_old = db_vragen
            .get("rood_antwoord");
        var blauw_antwoord_old = db_vragen
            .get("blauw_antwoord");
        //safe results db_results
        db_results.get('old_data').push({
            kwestie: kwestie_old,
            rood_antwoord: rood_antwoord_old,
            blauw_antwoord: blauw_antwoord_old,
            teamrood_punten: teamrood_punten_old,
            teamblauw_punten: teamblauw_punten_old
        }).write();
        db_results.read();
        console.log('State has been updated');

        db_vragen.set('vraag', nieuwe_kwestie)
            .write()
        db_vragen.set('rood_antwoord', nieuwe_rood_antwoord)
            .write()
        db_vragen.set('blauw_antwoord', nieuwe_blauw_antwoord)
            .write()

        //update results to 0
        db.set('teamrood', 0)
            .write()
        db.set('teamblauw', 0)
            .write()
        res.render("reload");
    } else {
        res.send("Wrong password");
    }
});

/* Resultaten weergeven */
app.get("/results", function (req, res) {
    var old_results = db_results.get('old_data').value();
    res.render("results",{
        old_results
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
