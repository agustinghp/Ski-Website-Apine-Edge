// ********************** Initialize server **********************************

const server = require('../index.js'); //Path corrected to point to parent directory's index.js

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
    // Sample test case given to test / endpoint.
    it('Returns the default welcome message', done => {
        chai
            .request(server)
            .get('/welcome')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equals('success');
                assert.strictEqual(res.body.message, 'Welcome!');
                done();
            });
    });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************
//We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 400 along with a "Invalid input" message.

describe('Testing User Registration', () => {

  // ✅ Positive test
  it('Positive: should register a new user successfully', done => {
    chai
      .request(server)
      .post('/register')
      .type('form')
      .send({
        username: 'testuser_' + Date.now(), // unique username
        email: `test_${Date.now()}@example.com`, // unique email
        password: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // success
        expect(res.text).to.include('Registration successful');
        done();
      });
  });

  it('Negative: should show error and return 400 for missing fields', done => {
    chai
      .request(server)
      .post('/register')
      .type('form')
      .send({
        username: '',
        email: '',
        password: ''
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.text).to.include('Please fill out all fields');
        done();
      });
  });

  it('Negative: should show error and return 409 for duplicate username or email', done => {
    const existingUser = {
      username: 'duplicate_user',
      email: 'duplicate@example.com',
      password: 'password123'
    };

    // First, create the user
    chai
      .request(server)
      .post('/register')
      .type('form')
      .send(existingUser)
      .end(() => {
        // Try creating again
        chai
          .request(server)
          .post('/register')
          .type('form')
          .send(existingUser)
          .end((err, res) => {
            expect(res).to.have.status(409);
            expect(res.text).to.satisfy(text =>
              text.includes('already taken') || text.includes('already registered')
            );
            done();
          });
      });
  });

});

describe('Testing Redirect', () => {
  it('"/test" route should redirect to "/login" with 302 HTTP status code', done => {
    chai
      .request(server)
      .get('/test')
      .redirects(0) // 👈 prevents Chai from following the redirect
      .end((err, res) => {
        expect(res).to.have.status(302); // redirect status
        expect(res).to.redirectTo(/^.*\/login$/); // ensure redirect target is /login
        done();
      });
  });
});

describe('Testing Render', () => {
  it('"/login" route should render an HTML response', done => {
    chai
      .request(server)
      .get('/login')
      .end((err, res) => {
        expect(res).to.have.status(200); // OK
        expect(res).to.be.html; // verifies it's an HTML page
        done();
      });
  });
});



// ********************************************************************************