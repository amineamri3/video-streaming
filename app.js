import express from 'express'
import Routes from './Routes/index.js'
import mongoose from 'mongoose'
import cors from 'cors';
import 'dotenv/config'



const app = express()
/*app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboyBodyParser({ limit: '300mb' }));*/
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST'],
	allowedHeaders:'*',
	credentials: true,
}));



app.use(Routes);





const PORT =  process.env.PORT || 3000
mongoose
	.connect("mongodb+srv://root:JNi60LITCV17nU1f@cluster0.u2ieu.mongodb.net/videostreaming?retryWrites=true&w=majority",)
	.then(() => {
        console.log("database connected ")
        app.listen(PORT ,()=>{
            console.log("server running on port "+PORT)
        })

    })

