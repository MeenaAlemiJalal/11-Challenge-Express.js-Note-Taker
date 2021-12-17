const express = require('express')
const path = require('path')
const fs = require('fs')
const {v4: uuid4} = require('uuid');
const morgan = require('morgan')
const Note = require('./lib/Note')



// init the app
const app = express()

// middlewares
app.use(express.json())
app.use(morgan('dev'))

// This specify the directory of static files that needs to be served
app.use(express.static('public'))



/////// Static file routes ////////
// 1 - GET for serving notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'))
})
// 2 - GET for serving index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})



//////// API routes ///////

// GET for serving db.json file 
app.get('/api/notes', (req, res) => {
  fs.readFile('db/db.json', (err, file) => {
    if(err) {
      res.status(404).send({Error: err})
    } else {
      res.send(JSON.parse(file))
    }
  })
})

// POST for creating a new note 
app.post('/api/notes', (req, res) => {
  fs.readFile('db/db.json', (err, file) => {
    if(err) {
      res.status(404).send({Error: err})
    } else { 
      // get the data from the req.body
      const noteData = req.body
      // generate a unique id
      const id = uuid4()
      // construct a new note
      const newNote = new Note(id, noteData.title, noteData.text)
      const notes = JSON.parse(file)
      notes.push(newNote)
      const jsonNotes = JSON.stringify(notes)
      fs.writeFile('./db/db.json', jsonNotes, (err) => {
        if(err) {
          res.status(500).send({Error: err})
        } else {
          res.send('success')
        }
      })
    }
  })
})


// DELETE - BONUS work
app.delete('/api/notes/:id', (req, res) => {
    fs.readFile('db/db.json', (err, file) => {
    if(err) {
      res.status(404).send({Error: err})
    } else { 
      // reat all notes from db
      const notes = JSON.parse(file)

      // get the note id from the req.params
      const id = req.params.id

      // delete the the note with the id from the params
      const newNotes = []
      notes.forEach((note)=> {
        if(note.id !== id) {
          newNotes.push(note)
        }
      })
      const jsonNotes = JSON.stringify(newNotes)
      fs.writeFile('./db/db.json', jsonNotes, (err) => {
        if(err) {
          res.status(500).send({Error: err})
        } else {
          res.status(200).send('success')
        }
      })
    }
  })
})


// start the server by listening to a port
app.listen(process.env.PORT || 3000, ()=>{
  console.log('App running at port:3000')
})
