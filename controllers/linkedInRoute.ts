import * as express from 'express';
import * as model from '../models/linkedin'


export const router = express.Router();

router.get('/table', async (req: express.Request, res: express.Response) => { //ancienne mise en forme
    res.render('table', { title: 'LinkedIn', networkName:  'linkedin', host:process.env.HOST })//JSON.stringify(stats)});
});
router.get('/data', async (req: express.Request, res: express.Response) => {
    res.send(await model.getCache().catch(e=>{
        if (e.msg && e.msg == "connectionError") return { error: 2, url: e.connectionUrl }
        return {error:1, data:e}
    }))
})

router.get("/login", async (req: express.Request, res: express.Response) => {
    if (parseInt(req.query.state as string) == model.state){
        if(await model.tokenChange(req.query.code as string))
            res.send("connnection effectuée, vous pouvez relancer le chargement")
        else
            res.send("erreur")
    }else{
        res.send("erreur, pas de connection demandée")
    }
})