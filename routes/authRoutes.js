const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

module.exports = (db) => {
    // Render Login Page
    router.get('/login', (req, res) => {
        res.render('pages/login', {
            title: 'Login',
            userId: req.session.userId
        });
    });

    /// Handle Login Form Submission
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;

        // Failure case 1: Missing fields
        if (!username || !password) {
            return res.render('pages/login', {
                title: 'Login',
                userId: req.session.userId,
                message: {
                    type: 'danger',
                    text: 'Username and password are required.'
                }
            });
        }

        try {
            const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

            // Failure case 2: User not found
            if (!user) {
                return res.render('pages/login', {
                    title: 'Login',
                    userId: req.session.userId,
                    message: {
                        type: 'danger',
                        text: 'Incorrect username or password.'
                    }
                });
            }

            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                // **********************************
                // // **********************************

                // 1. Set the session
                req.session.userId = user.id;
                req.session.username = user.username;

                // 2. Redirect to homepage after successful login
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                    }
                    return res.redirect('/');
                });

            } else {
                // Failure case 3: Wrong password
                return res.render('pages/login', {
                    title: 'Login',
                    userId: req.session.userId,
                    message: {
                        type: 'danger',
                        text: 'Incorrect username or password.'
                    }
                });
            }

        } catch (error) {
            // Failure case 4: Server error
            console.error('Login error:', error);
            res.render('pages/login', {
                title: 'Login',
                userId: req.session.userId,
                message: {
                    type: 'danger',
                    text: 'An error occurred. Please try again.'
                }
            });
        }
    });

    // Render Register Page
    router.get('/register', (req, res) => {
        res.render('pages/register', {
            title: 'Register',
            userId: req.session.userId
        });
    });

    // Handle Register Form Submission
    router.post('/register', async (req, res) => {
        const { username, email, password, location } = req.body;

        if (!username || !email || !password || !location) {
            return res.render('pages/register', {
                title: 'Register',
                userId: req.session.userId,
                message: {
                    type: 'danger',
                    text: 'Username, email, location, and password are required.'
                }
            });
        }

        try {
            const hash = await bcrypt.hash(password, 10);

            const newUser = await db.one(
                'INSERT INTO users (username, email, password_hash, location) VALUES ($1, $2, $3, $4) RETURNING id, username',
                [username, email, hash, location]
            );

            req.session.userId = newUser.id;
            req.session.username = newUser.username;

            req.session.save((err) => {
                if (err) console.error('Session save error:', err);
                return res.redirect('/');
            });

        } catch (error) {
            console.error('Registration error:', error);
            return res.render('pages/register', {
                title: 'Register',
                userId: req.session.userId,
                message: {
                    type: 'danger',
                    text: 'Registration failed. Username or email may already be in use.'
                }
            });
        }
    });


    // Handle Logout
    router.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.log('Error destroying session:', err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    });


    return router;
};
