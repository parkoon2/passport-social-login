const express = require('express')
const app = express()

const http = require('http')

const session = require('express-session')
const FileStore = require('session-file-store')(session)

app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}))

const passport = require('./lib/passport')(app);

app.get('/', (request, response) => {
    let html = `
        <a href="/auth/google">구글 로그인</a> |
        <a href="/auth/facebook">페이스북 로그인</a> |
        <a href="/auth/logout">로그아웃</a> |


    `
    response.send(html)
})

app.get('/auth/google', (request, response) => {
    console.log('dzdz')
})

app.get('/auth/logout', (request, response) => {
    request.logout();
    
    request.session.save(function () {
        response.redirect('/');
    });
})


app.use((req, res, next) => {
    res.status(404).send('Sorry cant find that!');
});

app.use((err, req, res, next) =>{
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(7777, () =>{
    console.log('Example app listening on port 7777!')
});