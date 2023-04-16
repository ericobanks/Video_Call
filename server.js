const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const rooms = {}

const users = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))

var bodyParser = require('body-parser')

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


// Landing Page /
app.get("/", (req, res) => {
  res.render("index", {rooms:rooms});
});

// POST /create
app.post("/create", urlencodedParser , function (req, res){
	if(rooms[req.body.room] != null){
		return res.redirect('/')
	}
	rooms[req.body.room] = {users: {}}
	res.redirect(req.body.room);
});

// POST /join
app.post("/join", urlencodedParser , function (req, res){
	res.redirect(req.body.room);
});


app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})


io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
	console.log(userId)
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)