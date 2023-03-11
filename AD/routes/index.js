var express = require('express');
var jwt = require('jsonwebtoken');
var pool = require('../db/db')

var router = express.Router();
const secretKey = 'My azureDream'

/* GET home page. */
router.get('/', function(req, res, next) {
  //"Content-Type, text/html; charset=utf-8"
  // res.set({
  //   'Content-Type':'text/html',
  //   'chartset':'utf-8'
  // }); 
  res.render("home");
});

router.get('/admin', (req, res, next)=>{
  //如果没有token首先重定向登录页
  res.render("login");
})

router.get('/root',(req,res,next)=>{
  res.render('admin');
})
//专用于token验证
router.get('/admin/manager', (req, res, next)=>{
  //如果没有token首先重定向登录页
  res.json({
    code:1,
    url:'/root'
  });
})

router.post('/admin/tologin', (req, res, next)=>{
  let {name, password} = req.body;
  //有效token直接通过
  //无token验证登录
  let sql = 'SELECT * FROM admin_info';
  pool.query(sql,(err, results)=>{
    if(err){
      res.status(500).json({message:err.message});
    }else{
      let admin = JSON.parse(JSON.stringify(results))[0];
      //成功返回码1，否则返回0
      if(name === admin.user_name && password === admin.password){
        const tokenStr = "Bearer "+ jwt.sign({name:name},secretKey,{expiresIn:'24h'});
        res.json({
          code:1,
          token:tokenStr,
          msg:'ok',
          url:'/root'
        }).end();
      }else{
        console.log('error');
        res.json({
          code:-1, 
          msg:'username or password error!'
        }).end();
      }
    }
  })
})

module.exports = router;
