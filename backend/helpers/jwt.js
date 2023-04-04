const expressJwt= require('express-jwt');

function authJwt() {
    const secret= process.env.secret;
    const api= process.env.API_URL;
    return expressJwt.expressjwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/public\/uploads(.*)/,methods: ['GET','OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/,methods: ['GET','OPTIONS']},
            {url: /\/api\/v1\/products(.*)/,methods: ['GET','OPTIONS']},
            `${api}/login`,
            `${api}/register`
        ]
    })
}

async function isRevoked(req, payload, done){
    if(!payload.isAdmin){
        done(null, true)
    }
    done();
}

module.exports= authJwt;