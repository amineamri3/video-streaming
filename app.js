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


app.use('/files',express.static('uploads'))

app.use(Routes);





const PORT =  process.env.PORT || 3000
mongoose
	.connect(process.env.DB_URL)
	.then(() => {
        console.log("database connected ")
        app.listen(PORT ,()=>{
            console.log("server running on port "+PORT)
        })

    })

