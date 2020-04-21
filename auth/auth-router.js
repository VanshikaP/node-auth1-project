const bcrypt = require('bcryptjs');

const router = require('express').Router();

const rounds = process.env.HASHING_ROUNDS || 16;

const Users = require('../users/users-model.js');

router.post('/register', (req, res) => {
    const userInfo = req.body;

    const hash = bcrypt.hashSync(userInfo.password, rounds);

    userInfo.password = hash;

    Users.add(userInfo)
        .then(users => {
            res.json({ message: `Registration Successful for ${userInfo.username}`});
        })
        .catch(err => {
            res.status(500).json({ error: `Failed to register ${userInfo.username}`});
        }); 
});

router.post('/login', (req, res) => {
    const {username, password} = req.body;

    Users.findBy({username})
        .then(([user]) => {
            if (user && bcrypt.compareSync(password, user.password)) {
                // remember this client
                req.session.user = {
                    id: user.id,
                    username: user.username
                };
                res.status(200).json({ message: `Login Successful - ${user.username}`});
            } else {
                res.status(401).json({ message: 'Invalid Credentials' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: 'Error finding the user' });
        });
});

router.get('/logout', (req, res) => {
    if(req.session) {
        req.session.destroy(error => {
            if(error) {
                res.status(500).json({ error: 'Failed to Logout' });
            } else {
                res.status(200).json({ message: 'Successfully Logged Out' });
            }
        });
    }
});

module.exports = router;