import express from "express";
import multer from 'multer';
import { uuid } from "uuidv4";
import path from "path";
import Video from '../models/video.js'
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
const __dirname = path.resolve();
const allowedExt = ['.mp4']
const router = express.Router();
var s = multer.diskStorage({   
    destination: function(req, file, cb) { 
        var id = uuid()
        fs.mkdir(path.join(__dirname, '/uploads/'+id),(err)=>{
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        })
       cb(null, `./uploads/${id}`);    
    }, 
    filename: function (req, file, cb) { 
    // const ext = path.extname(file.originalname);
    //const originalname = `${uuid()}${ext}`
        
       cb(null , "1920x1080.mp4");   
    }
 });
const upload = multer({storage:s})

 router.post('/upload' ,upload.single('video'),  (req,res)=>{
    const  file  = req.file;
    const  title  = req.body.title;
    if(!file || !title){
        return res.send({err:"Both the video file and the video title are mandatory!"})
    }
    
    const { filename, destination, mimetype, size } = file;
    if(allowedExt.indexOf(path.extname(file.originalname))<0){
        return res.send({err:"video has to be of format:"+allowedExt});
    }
   
    var fname = path.basename(filename,path.extname(filename))
   
     Video.create({
      title: title,
      path: filename,
      size: size
    }).then(()=>{ // video saved both on disk storage and mongo
            //assuming video is 1080p for now
            //const encode = spawn('bash', ['encode.sh', path.basename(filename,path.extname(filename)), path.extname(filename), "/uploads/"+path.basename(filename,path.extname(filename))+"/"]);
            
            //var output_stream = fs.createWriteStream(path.join(__dirname,"/uploads/"+fname+"/" +  '1280x720.mp4'));

            ffmpeg(file.path)
            .output(path.join(__dirname,destination +"/"+ '1280x720.mp4'))
            .videoCodec('libx264')  
            .videoBitrate("2800k")
            .audioBitrate("128k")
            .size('1280x720')
            .output(path.join(__dirname,destination + "/"+ '842x480.mp4'))
            .videoCodec('libx264')  
            .videoBitrate("1400k")
            .audioBitrate("128k")
            .size('842x480')
            .output(path.join(__dirname,destination + "/"+ '640x360.mp4'))
            .videoCodec('libx264')  
            .videoBitrate("800k")
            .audioBitrate("96k")
            .size('426x240')
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);             
            })	
            .on('progress', function(progress) { 
                console.log('... frames: ' + progress.frames);      
            })
            .on('end', function() { 
                console.log('Finished processing');     
            })
            .run();
            

    })
    res.send("uploaded "+title)
})







export default router;