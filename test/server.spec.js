// ********************** Initialize server **********************************
const server = require('../index.js'); 

// ********************** Import Libraries ***********************************
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { expect } = chai;

// ********************** Begin Tests ****************************

describe('Server Routing and HTML Rendering', () => {

  it('GET / should render the home page', done => {
    chai
      .request(server)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
        expect(res.text).to.include('Welcome to Alpine Edge!');
        done();
      });
  });

  it('GET /login should render the login page', done => {
    chai
      .request(server)
      .get('/login')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
        expect(res.text).to.include('Login');
        done();
      });
  });

  it('GET /register should render the register page', done => {
    chai
      .request(server)
      .get('/register')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
        expect(res.text).to.include('Create Account');
        done();
      });
  });
});

describe('Authentication Middleware (auth)', () => {

  it('GET /profile should redirect to /login when not logged in', done => {
    chai
      .request(server)
      .get('/profile')
      .redirects(0) // Prevent chai from following the redirect
      .end((err, res) => {
        expect(res).to.have.status(302); // 302 is the redirect status
        expect(res).to.redirectTo(/\/login$/); // Check it redirects to /login
        done();
      });
  });

  it('GET /chat should redirect to /login when not logged in', done => {
    chai
      .request(server)
      .get('/chat')
      .redirects(0) 
      .end((err, res) => {
        expect(res).to.have.status(302);
        expect(res).to.redirectTo(/\/login$/);
        done();
      });
  });
});

describe('User Registration (POST /register)', () => {

  it('Positive: should successfully register a new user and redirect to home', done => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const uniqueUsername = `testuser_${Date.now()}`;

    chai
      .request(server)
      .post('/register')
      .send({
        username: uniqueUsername,
        email: uniqueEmail,
        password: 'password123',
        location: 'Denver, CO, USA',
        latitude: '39.7392',
        longitude: '-104.9903'
      })
      .redirects(0) // Prevent chai from following the redirect
      .end((err, res) => {
        expect(res).to.have.status(302); // Redirects to home page
        expect(res).to.redirectTo(/\/$/); // Check it redirects to /
        done();
      });
  });

  it('Negative: should re-render the register page with an error if fields are missing', done => {
    chai
      .request(server)
      .post('/register')
      .send({
        username: 'testuser',
        email: '', // Missing email
        password: 'password123'
        // Missing location field
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // Renders the page
        expect(res.text).to.include('Username, email, location, and password are required.');
        done();
      });
  });
});

describe('User Login (POST /login)', () => {

  it('Negative: should re-render login page with an error for a bad password', done => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: 'john_powder', // A valid user from your test data
        password: 'wrongpassword'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.include('Incorrect username or password.');
        done();
      });
  });
});