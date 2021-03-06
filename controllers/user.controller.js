const bcrypt = require('bcrypt-nodejs');
const keys = require ("../config");
const jwt = require('jsonwebtoken');
// dependencies
const User = require('../sequelize').User;

module.exports.login = (req,res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (!user){
            res.status(404).json({success:false, token: null, error: 'Nom d\'utilsateur non trouvé.'});
        } else {
            bcrypt.compare(req.body.password,user.password, (err,result) => {
                if (result == true){
                    var token = jwt.sign(
                        {
                            _id: user._id,
                            username: user.username,
                            isAdmin: user.isAdmin
                        },
                        keys.secret,
                        {expiresIn: 3600}
                    );
                    res.status(200).json({success: true, token: token});
                } else {
                    res.status(401).json({success:false, token: null, error: 'Mot de passe invalide.'});
                }
            })
        }
    })
};

module.exports.userAddOne = (req,res) => {
    var newUser = {
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
        isAdmin: req.body.isAdmin
    }
    newUser.save().then(user => res.json(user)).catch(err => {
        console.log('error',err);
        res.status(409).json({error: err});
    });
}