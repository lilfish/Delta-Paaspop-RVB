import { CountUp } from './countUp.js';

const redCount = new CountUp('roodprocentspan', document.getElementById("roodprocentspan").innerHTML);
if (!redCount.error) {
    redCount.start();
} else {
    console.error(redCount.error);
}

const blueCount = new CountUp('blauwprocentspan', document.getElementById("blauwprocentspan").innerHTML);
if (!blueCount.error) {
    blueCount.start();
} else {
    console.error(blueCount.error);
}

var xhttp = new XMLHttpRequest();
setInterval(function(){
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
            var data = JSON.parse(xhttp.responseText);
            console.log(data);
            // document.getElementById("roodprocentspan").innerHTML = data.rood;
            redCount.update(data.rood);
            document.getElementById("rood").style.width = data.roodprocent + "%";
            
            // document.getElementById("blauwprocentspan").innerHTML = data.blauw;
            blueCount.update(data.blauw);
            document.getElementById("blauw").style.width = data.blauwprocent + "%";
            //update kwestie en vragen
            document.getElementById("roodantwoord").innerHTML = data.rood_antwoord;
            document.getElementById("blauwantwoord").innerHTML = data.blauw_antwoord;;
            document.getElementById("kwestie").innerHTML = data.kwestie;
        }
    };
    xhttp.open("GET", "/updateVals", true);
    xhttp.send();
}, 3000);