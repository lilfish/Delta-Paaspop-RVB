// var ctx = document.getElementById('myChart').getContext('2d');
var chart_list = document.getElementsByClassName("chart"); 

for (let q = 0; q < chart_list.length; q++) {
    // console.log(document.getElementById(chart_list[q].id).attributes.rood)
    var rood_punten = document.getElementById(chart_list[q].id).attributes.rood.value;
    var blauw_punten = document.getElementById(chart_list[q].id).attributes.blauw.value;
    if(rood_punten == 0 && blauw_punten == 0){
        console.log(q);
        document.getElementById("chart_div"+q).hidden = true;
    }
    var ctx = document.getElementById(chart_list[q].id).getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Rood', 'Blauw'],
            datasets: [{
                label: '# of Votes',
                data: [rood_punten, blauw_punten],
                backgroundColor: [
                    'rgb(207, 58, 39)',
                    'rgb(44, 115, 209)',
                ],
                borderColor: [
                    'rgb(207, 58, 39)',
                    'rgb(44, 115, 209)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false,
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    display: false,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            elements: {
                line: {
                    fill: false
                }
            }
        }
    });
}
