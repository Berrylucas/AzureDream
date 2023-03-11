const express = require('express');
var path = require('path');
const { readFile } = require('fs/promises');
var multer = require('multer');

const router = express.Router();

const pool = require('../db/db');

router.get('/fileList', (req, res, next) => {
    //解析请求字符串
    // res.status(200).json(req.query);
    let { contentType } = req.query;
    let sql = 'SELECT * FROM content_text WHERE is_hidden = \'0\' and content_type = ' + contentType;
    console.log(typeof contentType)
    if(contentType === '3'){//查询图片
        sql += '; SELECT * FROM images WHERE is_hidden = \'0\''
    }
    console.log("get fileList contentType: " + contentType);
    pool.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            let totalData = {}
            if(contentType === '3'){
                let fileResults = results[0];
                let imgResults = results[1];
                totalData = {
                    fileResults:fileResults,
                    imgResults:imgResults
                }
            }else{
                totalData = results;
            }
            res.status(200).json(totalData);
        }
    });
});

router.get('/managerList', (req, res, next) => {
    const contentSql = 'SELECT id, content_type,name,create_time,section,is_hidden FROM content_text';
    const imgSql = 'SELECT id, name, path, description, create_time, is_hidden FROM images';
    pool.query(contentSql, (err, cresults) => {
        if (err) {
            res.status(500).json({ message: "contentSql Error: " + err.message });
        } else {
            pool.query(imgSql, (err, iresults) => {
                if (err) {
                    res.status(500).json({ message: "imgSql Error:" + err.message });
                } else {
                    total = [...cresults, ...iresults];
                    res.status(200).json(total);
                }
            });
        }
    })
})

//存储文件，在content_text数据库中插入一条信息
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../files/document'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
})
var upload = multer({
    storage: storage,
    fileFilter(req, file, callback) {
        // 解决中文名乱码的问题
        file.originalname = Buffer.from(file.originalname, "latin1").toString(
          "utf8"
        );
        callback(null, true);
      }
}).single('file')
router.post('/admin/docupload', (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // 发生错误
            console.log("multer Error: " + err);
        } else if (err) {
            // 发生错误
            console.log("other Error: " + err);
        }
        console.log("everything is ok")
        //插入数据库
        console.log(req.file, req.body);
        let {docType, docContent, fileName, lables} = req.body;
        //D:DevProjectMyVscodewebProjectADfilesdocument1678244629569-被讨厌的勇气.md -- windows路径
        //数据库全部使用正斜杠存储，实际在windows再转为反斜杠
        let docPath = path.join('..\\files\\document',req.file.filename).replaceAll('\\','/');
        console.log(docPath);
        let createTime = new Date(Date.now()).toISOString().slice(0,19).replace('T', ' ');
        const contentSql = `INSERT INTO 
        content_text(content_type, name, path, create_time, section, is_hidden) 
        VALUES('${docContent}', '${fileName}', '${docPath}', '${createTime}', '${lables}', '0')`;
        pool.query(contentSql,(err,results)=>{
            if(err){
                res.status(500).json({ message: "insert Error:" + err.message });
            }else{
                res.status(200).json({code:'ok',results:results});
            }
        })
    })
})

//"删除"文件，仅将is_hidden设置为 -1
router.post('/admin/delete',(req,res,next)=>{
    updateContentAndImage(req,res, -1)
})

//隐藏文件，仅将is_hidden设置为 1
router.post('/admin/hidden',(req,res,next)=>{
    updateContentAndImage(req,res, 1)
})

//展示文件，仅将is_hidden设置为 0
router.post('/admin/show',(req,res,next)=>{
    updateContentAndImage(req,res, 0)
})

function updateContentAndImage(req, res, isHidden){
    let fileId = Array.from(req.body).map(item => parseInt(item));
    let contentId = fileId.filter(i=>{
        return i <= 1000
    });
    let imgId = fileId.filter(i=>{
        return i > 1000
    }).map(i => i - 1000);
    console.log(contentId,imgId)
    //修改表信息
    let msg = {
        state:'ok',
        message:'none'
    };
    let total = '';
    if(contentId.length !==0){
        const deleteDoc  = `UPDATE content_text SET is_hidden = '${isHidden}' WHERE id IN (${contentId.join(',')})`;
        total = deleteDoc;
        console.log(total);

    }
    if(imgId.length !==0){
        const deleteImg = `UPDATE images SET is_hidden = '${isHidden}' WHERE id IN (${imgId.join(',')})`;
        if(total.length > 10){
            total += ";"+deleteImg;
        }else{
            total = deleteImg;
        }
        console.log(total);
    }
    pool.query(total, (err, results)=>{
        if(err){
            msg.state = 'error';
            msg.message = err;
            res.status(500).json(msg);
        }else{
            msg.message = 'success';
            res.status(200).json(msg);
        }
    })
}

//读取文件
router.post('/file/readDoc',(req, res, next)=>{
    let finalPath = path.join(__dirname,req.body.docpath);
    console.log(finalPath);
    readFile(finalPath,'utf-8').then(data=>{
        res.set({
            'Content-Type':'text/plain',
            'chartset':'utf-8'
        });
        res.send(data);
    }).catch(err=>{
        res.status(500).json({
            code:'err',
            message:err
        })
    })
    // readFile('D:/DevProject/MyVscode/sources/notes.md','utf-8')
    // .then((data)=>{
    //     res.set({
    //         'Content-Type':'text/plain',
    //         'chartset':'utf-8'
    //     }); 
    //     res.end(data);
    // })
});

module.exports = router;