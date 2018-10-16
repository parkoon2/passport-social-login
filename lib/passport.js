module.exports = (app) => {
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    const FacebookStrategy = require('passport-facebook').Strategy
    /**
     * app.use ? express 에 미들웨어를 설치한다. express가 실행될 때마다 실행된다.
     * app 에 passport 및 passport session을 설치한다.
     */
    app.use(passport.initialize());
    app.use(passport.session());

    /**
     * serializeUser는 로그인에 성공했을 때 딱! 한 번 실행된다.
     * 로그인 시 done으로 전달한 파라미터를 받는다. 보통 식별자를 전달한다
     * passport는 session을 사용하고 있으며 session store에 정보가 저장된다.
     */
    passport.serializeUser(function (user, done) {
        // 두 번째 인자로 id(식별자)를 전달하시오.
        console.log('serializeUser', user)

        done(null, user);
    });

    /**
     * deserializeUser는 페이지에 방문할 때마다 실행된다.
     * 접속하고 있는 사람이 인증된 사람인지 아닌지 확인할 수 있다.
     */
    passport.deserializeUser(function (id, done) {
        console.log('deserializeUser')
        // let user = db.get('users').find({
        //     id
        // }).value()
        // console.log('deserializeUser', user)
        // 실제로는 id 값으로 데이터베이스를 조회해서 데이터를 가져온다.
        // 암기보다 중요한게 이해하는거, 이해보단 중요한게 익수해지는거
        // request 의 user 객체에서 해당 값 (authData)를 사용할 수 있다. 약속
        // done(null, authData);
    });

    const googleCredentials = require('../config/google.json')
    passport.use(new GoogleStrategy({
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0],
    },
        function (accessToken, refreshToken, profile, done) {
            console.log('GoogleStrategy', accessToken, refreshToken, profile)
            const email = profile.emails[0].value
            const user = {
                email
            }
            done(null, user)
            // // 기존 디비에 저 이 메일의 사용자가 있는지? 있다면 아이디 매칭시켜주기.
            // var user = db.get('users').find({email: email}).value()
            // if (user) {

            // }
            // user.googleId = profile.id;
            // db.get('users').find({id: user.id}).assign(user).write();
            // done(null, user); // 로그인 성공
            // User.findOrCreate({ googleId: profile.id }, function (err, user) {
            //     return done(err, user);
            // });
        }
    ));

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/plus.login',
                'email', // 기본 프로필 정보에는 email 정보가 없어서 scope에 추가
            ]
        })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/auth/login'
        }),
        function (req, res) {
            // 성공!
            // console.log('req', req.query)
            console.log('req', req.user)
            res.redirect('/');
        }
    );


    const facebookCredentails = require('../config/facebook.json')
    console.log('facebookCredentails', facebookCredentails)
    passport.use(new FacebookStrategy(facebookCredentails,
        function (accessToken, refreshToken, profile, done) {
            // User.findOrCreate(..., function(err, user) {
            //   if (err) { return done(err); }
            //   done(null, user);
            // });
        }
    ));

    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    app.get('/auth/facebook', passport.authenticate('facebook'));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

}