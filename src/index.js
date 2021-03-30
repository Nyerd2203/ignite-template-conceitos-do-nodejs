const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userFilter = users.find(user => user.username == username);
  if (!userFilter) return response.status(400).json({ error: 'user not found' });
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const user = {
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: []
  }
  const userFilter = users.find(user => user.username == username);
  if (userFilter) return response.status(400).json({ error: 'username already exists' });
  users.push(user);
  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const todosFilter = users.find(user => user.username == username);
  return response.json(todosFilter.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    deadline,
    done: false,
    created_at: new Date(),
  }
  const { username } = request.headers;
  const todosFilter = users.find(user => user.username == username);
  todosFilter.todos.push(todo);
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const findUser = users.find(user => user.username == username);
  const findTodo = findUser.todos.find(todo => todo.id == id && todo);
  if (!findTodo) return response.status(404).json({ error: 'todo not found' });
  const todoUpdated = { ...findTodo, title, deadline }
  return response.json(todoUpdated);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const findUser = users.find(user => user.username == username);
  const findTodo = findUser.todos.find(todo => todo.id == id && todo);
  if (!findTodo) return response.status(404).json({ error: 'todo not found' });
  const todoUpdated = { ...findTodo, done: true }
  return response.json(todoUpdated);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const findIndexUser = users.findIndex(user => user.username == username);
  const findIndexRemoveTodo = users[findIndexUser].todos.findIndex(todo => todo.id == id);
  if (findIndexRemoveTodo <= -1) return response.status(404).json({ error: 'todo not found' });
  users[findIndexUser].todos.splice(findIndexRemoveTodo, 1);
  return response.status(204).send();
});

module.exports = app;