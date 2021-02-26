const express = require('express')
const app = express()
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')
const { request } = require('http')
const { response } = require('express')
const { stringify } = require('querystring')
/*const PORT = process.env.PORT || 5000*/
const PORT = 3000

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use('/postings/:id', function(req, res, next){
  id = req.params.id -1
  res.send(postings[id])
})

app.use('/users/edit/:id', function(req, res, next){
  if(req.session.loggedin){
    id = req.params.id -1
    res.send('Page not ready yet.')
  }
  else{
    res.send('Kirjaudu ensin sisään!')
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/login.html'))
})

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname + '/register.html'))
})

app.post('/auth', (req, res) => {
  var username_ = req.body.username
  var password_ = req.body.password
  if(password_ && username_){
    var tulos = kirjautuja(username_, password_)
  }
  if(tulos){
    req.session.loggedin = true
    req.session.nimi = username_
    req.session.userid = tulos
    res.redirect('/users')
  }
  else{
    res.redirect('/users')
  }
})

app.post('/register', (req, res) => {
  var username_ = req.body.username
  var password_ = req.body.password
  var id_ = users.length + 1
  new_user = {
    id : id_,
    username : username_,
    password : password_
  }
  users.push(new_user)
  res.sendFile(path.join(__dirname + '/registered.html'))
})

function kirjautuja(user_,pass_){
  for(let user of users){
    if(user.username == user_){
      if(user.password == pass_){
        return user.id
      }
    }
  }
  return null
}

function ilmoitukset(userid){
  var ilmoituslista = []
  userID = userid
  for(let post of postings){
    if(post.userID == userID){
      ilmoituslista.push(post)
    }
  }
  return ilmoituslista
}

app.get('/postings', (req, res) => {
  var tuloste = "Lista tuotteista: "
  for(let post of postings){
    tuloste = tuloste + `<a href="/postings/${post.postID}">${post.title}</a>` + "  "
  }
  tuloste = tuloste + '<a href="/filterpostings">Käytä filttereitä</a>'
  res.send(tuloste)
})

app.get('/filterpostings', (req, res) => {
  res.sendFile(path.join(__dirname + '/filter.html'))
})

app.get('/users/new', (req, res) => {
  if(req.session.loggedin){
    res.sendFile(path.join(__dirname + '/new_post.html'))
  }
  else{
    res.send('Kirjaudu ensin sisään!')
  }
})

app.post('/users/new', (req, res) => {
  if(req.session.loggedin){
    new_post = {
      postID : postings.length +1,
      title: req.body.title,
      description : req.body.description,
      category : req.body.category,
      location : req.body.location,
      images : req.body.images,
      price : req.body.price,
      date : req.body.date,
      delivery : req.body.delivery,
      userID : req.session.userid
    }
    postings.push(new_post)
    console.log(new_post)
    res.send('Ilmoitus lisätty!  ' +  '<a href="/users">Takaisin</a>')
  }
  else{
    res.send('Kirjaudu ensin sisään!')
  }
})

app.get('/users/edit', (req, res) => {
  if(req.session.loggedin){
    var userid = req.session.userid
    var user_posts = ilmoitukset(userid)
    tuloste = "Ilmoituksesi: "
    for(let post of user_posts){
      tuloste = tuloste + `<a href="/users/edit/${post.postID}">${post.title}</a>` + "  "
    }
    tuloste = tuloste + ' <a href="/users">Takaisin</a>'
    res.send(tuloste)
  }else{
    res.send('Kirjaudu ensin sisään!')
  }
})

app.get('/users', (req, res) => {
  if(req.session.loggedin){
    res.sendFile(path.join(__dirname + '/user_kirjautunut.html'))
  }
  else{
    res.sendFile(path.join(__dirname + '/user_ei_kirjautunut.html'))
  }
})

app.post('/filteredpostings', (req, res) => {
  var category = req.body.category
  var location = req.body.location
  var date = req.body.date
  var filteredpostings = postings
  if(category){
    filteredpostings = filteredpostings.filter(x => x.caterogry == category)
  }
  if(location){
    filteredpostings = filteredpostings.filter(x => x.location == location)
  }
  if(date){
    filteredpostings = filteredpostings.filter(x => x.date == date)
  }
  res.send(filteredpostings)
})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

var users = [
  {
    id: 1,
    username: "first_user",
    password: "password1"
  },
  {
    id: 2,
    username: "second_user",
    password: "password2"
  },
  {
    id: 3,
    username: "third_user",
    password: "password3"
  },
]

var postings = [
  {
    postID : 1,
    title : "Pyörä",
    description : "Hieno pyörä!",
    caterogry : "Pyörät",
    location : "Oulu",
    images : "test",
    price : 150,
    date : "20.2.2021",
    delivery : "Ostaja hakee paikan päältä",
    userID : 1
  },
  {
    postID : 2,
    title : "Toinen pyörä",
    description : "Huono pyörä!",
    caterogry : "Pyörät",
    location : "Oulu",
    images : "test",
    price : 40,
    date : "21.2.2021",
    delivery : "Ostaja hakee paikan päältä",
    userID : 1
  },
  {
    postID : 3,
    title : "Tietokone",
    description : "10v vanha PC tarpeettomana",
    caterogry : "Tietotekniikka",
    location : "Tampere",
    images : "test",
    price : 60,
    date : "01.2.2021",
    delivery : "Ostaja maksaa postimaksut tai nouto",
    userID : 2
  },
  {
    postID : 4,
    title : "Kannettava tietokone",
    description : "Hyväkuntoinen kannettava tarpeettomana, vuosi takuuta jäljellä.",
    caterogry : "Tietotekniikka",
    location : "Helsinki",
    images : "test",
    price : 500,
    date : "20.12.2020",
    delivery : "Nouto tai postipaketti",
    userID : 3
  }
]

