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
        const { username, email, password, location, autocomplete, latitude, longitude } = req.body;

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
            // Check if username already exists
            const existingUsername = await db.oneOrNone('SELECT id FROM users WHERE username = $1', [username]);
            if (existingUsername) {
                return res.render('pages/register', {
                    title: 'Register',
                    userId: req.session.userId,
                    message: {
                        type: 'danger',
                        text: 'This username is already taken. Please choose a different username.'
                    }
                });
            }

            // Check if email already exists
            const existingEmail = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
            if (existingEmail) {
                return res.render('pages/register', {
                    title: 'Register',
                    userId: req.session.userId,
                    message: {
                        type: 'danger',
                        text: 'This email is already registered. Please use a different email or try logging in.'
                    }
                });
            }

            const hash = await bcrypt.hash(password, 10);

            // Convert latitude and longitude to numbers, or null if not provided
            const lat = latitude ? parseFloat(latitude) : null;
            const lng = longitude ? parseFloat(longitude) : null;

            const newUser = await db.one(
                'INSERT INTO users (username, email, password_hash, location, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username',
                [username, email, hash, location, lat, lng]
            );

            req.session.userId = newUser.id;
            req.session.username = newUser.username;
            req.session.message = {
                type: 'success',
                text: 'Registration successful! Welcome to Alpine Edge!'
            };

            req.session.save((err) => {
                if (err) console.error('Session save error:', err);
                return res.redirect('/');
            });

        } catch (error) {
            let errorMessage = 'Registration failed. Please try again.';
            
            // Check for PostgreSQL unique violation error code (23505)
            // Also check for string version '23505' and numeric 23505
            const errorCode = error.code || error.errno || '';
            const constraintName = (error.constraint || '').toLowerCase();
            const errorDetail = (error.detail || error.message || '').toLowerCase();
            
            if (errorCode === '23505' || errorCode === 23505 || String(errorCode).includes('23505')) {
                if (constraintName.includes('username') || errorDetail.includes('username')) {
                    errorMessage = 'This username is already taken. Please choose a different username.';
                } else if (constraintName.includes('email') || errorDetail.includes('email')) {
                    errorMessage = 'This email is already registered. Please use a different email or try logging in.';
                } else if (errorDetail.includes('unique') || errorDetail.includes('duplicate')) {
                    errorMessage = 'Username or email is already in use. Please choose different values.';
                }
            }
            // Check error message for duplicate key hints (case-insensitive)
            else if (error.message && typeof error.message === 'string') {
                const lowerMessage = error.message.toLowerCase();
                if (lowerMessage.includes('username') && (lowerMessage.includes('unique') || lowerMessage.includes('duplicate') || lowerMessage.includes('already'))) {
                    errorMessage = 'This username is already taken. Please choose a different username.';
                } else if (lowerMessage.includes('email') && (lowerMessage.includes('unique') || lowerMessage.includes('duplicate') || lowerMessage.includes('already'))) {
                    errorMessage = 'This email is already registered. Please use a different email or try logging in.';
                }
            }
            
            return res.render('pages/register', {
                title: 'Register',
                userId: req.session.userId,
                message: {
                    type: 'danger',
                    text: errorMessage
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
