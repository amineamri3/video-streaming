import express from "express";
import multer from 'multer';
import { uuid } from "uuidv4";
import path from "path";
import Video from '../models/video.js'
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg'
import {Transcoder} from 'simple-hls'
import fs from 'fs'
import EventEmitter from "events";


const eventEmitter = new EventEmitter();
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
    console.log(file)
   
    if(!file || !title){
        return res.send({err:"Both the video file and the video title are mandatory!"})
    }
    
    const { filename, destination, mimetype, size } = file;
    if(allowedExt.indexOf(path.extname(file.originalname))<0){
        return res.send({err:"video has to be of format:"+allowedExt});
    }
   console.log(file)
    var fname = path.basename(filename,path.extname(filename))
    var prevFolder = path.basename(path.dirname(file.path));
     Video.create({
      title: title,
      path: prevFolder,
      size: size
    }).then(()=>{ // video saved both on disk storage and mongo
            //assuming video is 1080p for now
            //const encode = spawn('bash', ['encode.sh', path.basename(filename,path.extname(filename)), path.extname(filename), "/uploads/"+path.basename(filename,path.extname(filename))+"/"]);
            
            //var output_stream = fs.createWriteStream(path.join(__dirname,"/uploads/"+fname+"/" +  '1280x720.mp4'));

            /*ffmpeg(file.path)
            .output(path.join(__dirname,destination +"/"+ '1280x720.m3u8'))
            .videoCodec('libx264')  
            .videoBitrate("2800k")
            .audioBitrate("128k")
            .size('1280x720')
            .addOption('-hls_time', 4)
            .addOption('-hls_list_size',0)
            .addOption('-hls_playlist_type','2')
            .addOption('-master_pl_name','master.m3u8')
            .output(path.join(__dirname,destination + "/"+ '842x480.m3u8'))
            .videoCodec('libx264')  
            .videoBitrate("1400k")
            .audioBitrate("128k")
            .size('842x480')
            .addOption('-hls_time', 4)
            .addOption('-hls_list_size',0)
            .addOption('-hls_playlist_type','2')
            .addOption('-master_pl_name','master.m3u8')
            .output(path.join(__dirname,destination + "/"+ '640x360.m3u8'))
            .videoCodec('libx264')  
            .videoBitrate("800k")
            .audioBitrate("96k")
            .size('640x360')
            .addOption('-hls_time', 4)
            .addOption('-hls_list_size',0)
            .addOption('-hls_playlist_type','2')
            .addOption('-master_pl_name','master.m3u8')
            .map("v:0,a:0 v:1,a:1 v:2,a:2")*/


            /*.addOption('-filter_complex','[0:v]split=3[v1][v2][v3];[v1]copy[v1out]; [v2]scale=w=1280:h=720[v2out]; [v3]scale=w=640:h=360[v3out]')
            .addOption('-map','[v1out] -c:v:0 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:0 5M -maxrate:v:0 5M -minrate:v:0 5M -bufsize:v:0 10M -preset slow -g 48 -sc_threshold 0 -keyint_min 48')
            .addOption('-map','[v2out] -c:v:1 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:1 3M -maxrate:v:1 3M -minrate:v:1 3M -bufsize:v:1 3M -preset slow -g 48 -sc_threshold 0 -keyint_min 48')
            .addOption('-map','[v3out] -c:v:2 libx264 -x264-params "nal-hrd=cbr:force-cfr=1" -b:v:2 1M -maxrate:v:2 1M -minrate:v:2 1M -bufsize:v:2 1M -preset slow -g 48 -sc_threshold 0 -keyint_min 48')
            .addOption('-map','a:0 -c:a:0 aac -b:a:0 96k -ac 2')
            .addOption('-map','a:0 -c:a:1 aac -b:a:1 96k -ac 2')
            .addOption('-map','a:0 -c:a:2 aac -b:a:2 48k -ac 2')
            .addOption('-f','hls')
            .addOption('-hls_time','2')
            .addOption('-hls_playlist_type','2')
            .addOption('-hls_flags','independent_segments')
            .addOption('-hls_segment_type','mpegts')
            .addOption('-hls_segment_filename','stream_%v/data%02d.ts')
            .addOption('-master_pl_name','master.m3u8')
            .addOption('-var_stream_map','"v:0,a:0 v:1,a:1 v:2,a:2" stream_%v.m3u8')*/

            /*.output(path.join(__dirname,destination + "/"))
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);             
            })	
            .on('progress', function(progress) { 
                console.log('... frames: ' + progress.frames);      
            })
            .on('end', function() { 
                console.log('Finished processing');     
            })
            .run();*/

            transcodeVideo(file.path,path.join(__dirname,destination +"/"),prevFolder);
            

    })
    res.send({msg:"uploaded "+title,id:prevFolder})
})


async function transcodeVideo (input,outputDir,d) {
    const customRenditions = [
        {
       width: 640,
       height: 360,
       profile: 'main',
       hlsTime: '4',
       bv: '800k',
       maxrate: '856k',
       bufsize: '1200k',
       ba: '96k',
       ts_title: '360p',
       master_title: '360p'
   },
   {
       width: 842,
       height: 480,
       profile: 'main',
       hlsTime: '4',
       bv: '1400k',
       maxrate: '1498',
       bufsize: '2100k',
       ba: '128k',
       ts_title: '480p',
       master_title: '480p'
   },
   {
       width: 1280,
       height: 720,
       profile: 'main',
       hlsTime: '4',
       bv: '2800k',
       maxrate: '2996k',
       bufsize: '4200k',
       ba: '128k',
       ts_title: '720p',
       master_title: '720p' 
   },
   {
       width: 1920,
       height: 1080,
       profile: 'main',
       hlsTime: '4',
       bv: '5000k',
       maxrate: '5350k',
       bufsize: '7500k',
       ba: '192k',
       ts_title: '1080p',
       master_title: '1080p'
   }
];
    //First Parameter is the path to the video that you want to transcode
    //Second Parameter is the path to the folder/directory you would like the HLS Files Saved
    const t = new Transcoder(input, outputDir, {showLogs: true,renditions:customRenditions});
    try {
        const hlsPath = await t.transcode();
        console.log('Successfully Transcoded Video');
        //console.log("event emitted!")
        eventEmitter.emit("encodingFinished",d );
    } catch(e){
        console.log('Something went wrong');
    }
    
}



router.get('/recentuploads',(req,res)=>{
    Video.find().sort('-added').limit(10).exec((err,r)=>{
        res.send(r);
    })
})

router.get('/', (req,res)=>{
	res.sendFile(__dirname+'/index.html')
});
router.get('/watch', (req,res)=>{
	res.sendFile(__dirname+'/watch.html')
});
router.get('/upload', (req,res)=>{
	res.sendFile(__dirname+'/upload.html')
});
router.get('/listen', (req,res)=>{
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })
      eventEmitter.on('encodingFinished', id => {   
        //console.log(`event rec: ${id}`);
        res.write('data: '+id+'\n\n');
      });

})
export default router;