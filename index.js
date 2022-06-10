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

app.get('/api/notes', (request, response) => {
  // response.json(notes);
  Note
    .find({})
    .then(notes => {
      response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
  Note
    .findById(request.params.id)
    .then(note => response.json(note))
  })

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  Note
    .deleteOne({_id: id})
    .then(response.sendStatus(204).end())
  // response.status(204).end();
})

app.post('/api/notes', (request, response) => {
  const body = request.body;
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note
    .save()
    .then(savedNote => {
      response.json(savedNote)
    });
})

app.put('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  const newNote = request.body;
  Note
    .findById(id)
    .then(note => {
      note.content = newNote.content;
      note.important = newNote.important;
      return note.save()
    })
    .then(note => {
      response.json(note)
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})