import express from "express";
import multer from 'multer';
import { uuid } from "uuidv4";
import path from "path";
import Video from '../models/video.js'


const allowedExt = ['.mp4']
const router = express.Router();
var s = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, './uploads');    
    }, 
    filename: function (req, file, cb) { 
        const ext = path.extname(file.originalname);
        const originalname = `${uuid()}${ext}`
        
       cb(null , originalname);   
    }
 });
const upload = multer({storage:s})

 router.post('/upload' ,upload.single('video'),  (req,res)=>{
    const  file  = req.file;
    const  title  = req.body.title;
    if(!file || !title){
        return res.send({err:"Both the video file and the video title are mandatory!"})
    }
    if(allowedExt.indexOf(path.extname(file.originalname))<0){
        return res.send({err:"video has to be of format:"+allowedExt});
    }
    const { data, filename, encoding, mimetype, size } = file;
     Video.create({
      title: title,
      path: filename,
      size: size
    }).then(()=>{ // video saved both on disk storage and mongo
            //assuming video is 1080p for now



    })
    res.send("uploaded "+title)
})







export default router;