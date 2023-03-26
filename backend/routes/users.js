const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt= require('bcryptjs');
const jwt= require('jsonwebtoken');

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})
router.get(`/:id`, async (req, res) =>{
    const userList = await User.findById(req.params.id).select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.post('/',async (req,res)=>{
    let user= new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 7),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        appartment: req.body.appartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
        street: req.body.street 
    });
    user = await user.save();

    if(!user){
        return res.status(404).send('User can not be created!');
    }

    res.send(user);
})

router.put('/:id',async (req,res)=>{
    const userExist= await User.findById(req.params.id);
    let newPassword;
    if(req.body.password){
        newPassword=bcrypt.hashSync(req.body.password, 7);
    }else{
        newPassword=userExist.passwordHash;
    }
    const user= await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            appartment: req.body.appartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
            street: req.body.street
        },
        {new: true}
    )
    if(!user){
        return res.status(400).send('the category was not updated');
    }
    res.send(user);
})

router.post('/login', async (req,res)=>{
    const user= await User.findOne({email: req.body.email});
    const secret= process.env.secret;
    if(!user){
        return res.status(400).send('The user not found');
    }
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token= jwt.sign(
            {
                userId: user.id
            },
            secret,
            {expiresIn: '1d'}
        )
        res.status(200).send({user: user.email, token: token});
    }else{
        res.status(400).send('Password is wrong');
    }
})

module.exports =router;