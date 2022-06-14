require('dotenv').config();
const express = require('express');

const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(express.static('build'));
app.use(express.json());
morgan.token('postData', (req, res) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body)
  } else {
    return ''
  }
})

app.use(morgan(':method :url :status :response-time ms :postData'));
app.use(cors());

const Note = require('./models/note');

app.get('/api/notes', (request, response) => {
  // response.json(notes);
  Note
    .find({})
    .then(notes => {
      response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note
    .findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
  });

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id;
  Note
    .findByIdAndRemove(request.params.id)
    .then(result => {
      console.log(result);
      response.status(204).end();
    })
    .catch(error => next(error));
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body;
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note
    .save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error));
})

app.put('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  const {content, important} = request.body;

  Note
    .findByIdAndUpdate(id,
                      {content, important},
                      {new: true, runValidators: true, context: 'query'})
    .then(updatedNote => response.json(updatedNote))
    .catch(error => next(error));
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error);
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})