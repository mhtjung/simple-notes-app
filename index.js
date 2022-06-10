require('dotenv').config();
const express = require('express');
const Note = require('./models/note');

const morgan = require('morgan');
const cors = require('cors');
const app = express();


app.use(express.json());
morgan.token('postData', (req, res) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body)
  } else {
    return ''
  }
})

app.use(morgan(':method :url :status :response-time ms :postData'));
app.use(express.static('build'));
app.use(cors());

// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     date: "2022-05-30T17:30:31.098Z",
//     important: true
//   },
//   {
//     id: 2,
//     content: "Browser can execute only Javascript",
//     date: "2022-05-30T18:39:34.091Z",
//     important: false
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     date: "2022-05-30T19:20:14.298Z",
//     important: true
//   }
// ]

const generateId = () => {
  const maxId = notes.length > 0
  ? Math.max(...notes.map(n => n.id))
  : 0

  return maxId + 1
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
  // response.json(notes);
  Note
    .find({})
    .then(notes => {
      response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find(note => note.id === id)
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter( note => note.id !== id)

  response.status(204).end();
})

app.post('/api/notes', (request, response) => {
  const body = request.body;
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  const note = {
    id: generateId(),
    content: body.content,
    important: body.important || false,
    date: new Date().toISOString(),
  }

  notes = notes.concat(note);

  response.json(note)
})

app.put('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const newNote = request.body;
  notes = notes.map(n => n.id !== id ? n : newNote)
  console.log(notes);
  response.json(newNote);
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})