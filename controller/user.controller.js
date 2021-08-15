var Users = require('../models/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
});

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
});

const addUser = (async (req, res) =>{
    
    // validaciones de usuario
    const { error } = schemaRegister.validate(req.body);

    if(error){
        return res.status(400).json({
            status: false,
            error: error.details[0].message
        })
    }

    const existeEmail = await Users.findOne({email: req.body.email});

    if(existeEmail) return res.status(400).json({status: true, message: 'Email ya registrado'});

    const saltos = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, saltos);

    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: password
    })

    try {
        const userDB = await user.save();
        res.status(200).json({
            status: true,
            data: userDB
        });

    } catch (error) {
        res.status(400).json({
            status: false,
            message: error
        })
    }
})

const login = async (req, res) =>{
    
    try {
    // validar los datos enviado por el req.
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })
    
    // validar si existe ese usuario
    const user = await Users.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    // validar password del req. con el de la BD
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'contraseña no válida' })
    
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET);
    // Si todo is OK 
    res.header('auth-token', token).json({
        status: true,
        data: {token}
    })
    } catch (error) {
        res.status(400).json({
            status: false,
            data: error
    })
    }
}

const list = async (req,res) => {
    res.json({
        status: true,
        data: {
            title: 'mi ruta protegida',
            user: req.user
        }
    })
}
module.exports = {
    addUser,
    login,
    list
}