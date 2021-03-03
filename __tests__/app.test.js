require('dotenv').config();

const { execSync } = require('child_process');
// const { todos } = require('../data/todos');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    
    // POST TEST //
    test('create a todo for test user', async() => {
      const aTodo = {
        todo: 'take out the garbage',
        completed: false,
      };
  
      const expected = {
        ...aTodo,
        id: 5,
        user_id: 2
      };
  
      const data = await fakeRequest(app)
        .post('/api/todos')	        
        .send(aTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)       
        .expect(200);	        


      expect(data.body).toEqual(expected);

    });

    // GET TEST //
    test('read the test users todos', async() => {
      const expected = [
        { id: 5,
          todo: 'take out the garbage',
          completed: false,
          user_id: 2
        }];
      
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200); 

      expect(data.body).toEqual(expected);


    });

    // PUT TEST //
  
    test('updates a todo to completed: true', async() => {

      const updateTodo = {
        todo: 'take out the garbage',
        completed: true,
      };

      await fakeRequest(app)
        .put('/api/todos/5')
        .send(updateTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      const newData = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        // .expect('Content-Type', /json/)
        .expect(200);

      expect(newData.body[0]).toEqual({ ...updateTodo, id: 5, user_id: 2 });
    });
  });
});