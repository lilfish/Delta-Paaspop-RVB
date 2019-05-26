var request = require('supertest'),
    server = require('../server');

describe('Homepagina', function () {
    it('Should show the homepage', function (done) {
        request(server).get('/')
            .expect('Content-Type', /html/)
            .expect(200, done)
    })
})

describe('Stemmen pagina', function () {
    it('Should show the vote page', function (done) {
        request(server).get('/stemmen')
            .expect('Content-Type', /html/)
            .expect(200, done)
    })
})

describe('Stemmen op rood', function () {
    it('Should redirect after the correct input was given for voting red', function (done) {
        request(server).post('/gestemd')
            .type("form")
            .send({
                rood: 1
            })
            .expect(200)
            .expect(/Dankjewel voor het stemmen/, done)
    })
})
describe('Stemmen op blauw', function () {
    it('Should redirect after the correct input was given for voting blue', function (done) {
        request(server).post('/gestemd')
            .type("form")
            .send({
                blauw: 1
            })
            .expect(200)
            .expect(/Dankjewel voor het stemmen/, done)
    })
})
describe('Fout gestemd', function () {
    it('Should redirect after the correct input was given for voting blue', function (done) {
        request(server).post('/gestemd')
            .type("form")
            .send({
                groen: 1
            })
            .expect(404)
            .expect(/Error/, done)
    })
})

describe('Raspberry pi kewstie en vraag', function () {
    it('Should get the answers and question for the raspberry pi.', function (done) {
        request(server).get('/rasp_kewstie')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect(function (res) {
                if (!('kwestie' in res.body)) throw new Error("Missing 'rood' key")
                if (!('rood_vraag' in res.body)) throw new Error("Missing 'rood_vraag' key")
                if (!('blauw_vraag' in res.body)) throw new Error("Missing 'blauw_vraag' key")
            })
            .end(done)
    })
})

// give_data
describe('Check & Update red and blue', function () {
    var rem_blue;
    var rem_red;
    it('Should show the answers, questions and percentage of the scores. Than add one to red and blue and check if they where added', function (done) {
        request(server).get('/updateVals')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect(function (res) {
                if (!('rood' in res.body)) throw new Error("Missing 'rood' key")
                if (!('blauw' in res.body)) throw new Error("Missing 'blauw' key")
                rem_red = res.body.rood;
                rem_blue = res.body.blauw;
                if (!('roodprocent' in res.body)) throw new Error("Missing 'roodprocent' key")
                if (!('blauwprocent' in res.body)) throw new Error("Missing 'blauwprocent' key")
                if (!('kwestie' in res.body)) throw new Error("Missing 'kwestie' key")
                if (!('rood_antwoord' in res.body)) throw new Error("Missing 'rood_antwoord' key")
                if (!('blauw_antwoord' in res.body)) throw new Error("Missing 'blauw_antwoord' key")
            })
            .end(function () {
                request(server).post('/give_data')
                    .type("form")
                    .send({
                        blauw: 1,
                        rood: 1
                    })
                    .expect(200)
                    .end(function () {
                        request(server).get('/updateVals')
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(200)
                            .expect(function (res) {
                                if (!('rood' in res.body)) throw new Error("Missing 'rood' key")
                                if (!('blauw' in res.body)) throw new Error("Missing 'blauw' key")
                                if (res.body.rood != rem_red + 1) throw new Error("Point was not added to 'rood' key")
                                if (res.body.blauw != rem_blue + 1) throw new Error("Point was not added to 'blauw' key")
                            })
                            .end(done)
                    })
            })
    })
})

describe('Fail updating with bad input', function () {
    it('Should give an 500 error message when trying to update with a weird value.', function (done) {
        request(server).post('/give_data')
        .type("form")
        .send({
            ietsRaars: 'paaspopLol',
            rood: 1
        })
        .expect(500, done)
    })
})

describe('New question form', function () {
    it('Should show the new question form', function (done) {
        request(server).get('/nieuwe_vraag')
            .expect('Content-Type', /html/)
            .expect(200)
            .expect(/Voeg een nieuwe vraag toe/, done)
    })
})

describe('Submit new question form', function () {
    it('Should update the question and answers with correct password', function (done) {
        request(server).post('/nieuwe_vraag')
            .type("form")
            .send({
                vraag: 'Pepsi of cola?',
                rood_vraag: 'Cola',
                blauw_vraag: 'Pepsi',
                wachtwoord: 'rvbP@asp0p'
            })
            .expect(200)
            .end(function () {
                request(server).get('/updateVals')
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect(200)
                    .expect(function (res) {
                        if (!('rood_antwoord' in res.body)) throw new Error("Missing 'rood' key")
                        if (!('blauw_antwoord' in res.body)) throw new Error("Missing 'blauw' key")
                        if (!('kwestie' in res.body)) throw new Error("Missing 'kwestie' key")
                        if (res.body.rood_antwoord != 'Cola') throw new Error("Red answer was not updated")
                        if (res.body.blauw_antwoord != 'Pepsi') throw new Error("Blue answer was not updated")
                        if (res.body.kwestie != 'Pepsi of cola?') throw new Error("Question was not updated")
                    })
                    .end(done)
            })
    })
})

describe('Submit new question form, but with wrong password', function () {
    it('Should not update the question and answers with an incorrect password', function (done) {
        request(server).post('/nieuwe_vraag')
            .type("form")
            .send({
                vraag: 'Pepsi of cola?',
                rood_vraag: 'Cola',
                blauw_vraag: 'Pepsi',
                wachtwoord: 'wrong_password'
            })
            .expect(404)
            .expect(/Wrong password/, done);
    })
})

describe('Post to /nieuwe_vraag without anything', function () {
    it('Should give back 404 with error message', function (done) {
        request(server).post('/nieuwe_vraag')
            .expect(404)
            .expect(/Wrong password/, done);
    })
})

describe('results', function () {
    it('Should show the results page', function (done) {
        request(server).get('/results')
            .expect('Content-Type', /html/)
            .expect(200)
            .expect(/Resultaten van vorige kwesites:/, done)
    })
})