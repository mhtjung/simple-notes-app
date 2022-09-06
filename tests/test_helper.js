const Note = require('../models/note');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


const initialNotes = require('./test_data/TEST_DATA');

const nonExistingId = async () => {
  const note = new Note({ content: 'will remove this soon', date: new Date() })
  await note.save();
  await note.remove();
  return note._id.toString();
}

const notesInDb = async () => {
  const notes = await Note.find({});
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON())
}

const getTestUser = async () => {
  const testUser = new User({
    'username': 'brodriguez',
    'name': 'Bender B. Rodriguez',
    'password': 'kissmyshiny'
  });

  const savedUser = await testUser.save();
  
  const userForToken = {
    username: savedUser.username,
    id: savedUser._id.toString
  }

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60 * 60}
  )

  return { 
    user: savedUser, 
    token
  };
}

module.exports = {
  initialNotes,
  nonExistingId,
  notesInDb,
  usersInDb,
  getTestUser,
}
