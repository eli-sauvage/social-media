import * as express from 'express';
import * as model from '../models/instagram'

export const router = express.Router();

router.get('/table', async (req: express.Request, res: express.Response) => { //ancienne mise en forme
    res.render('table', { title: 'Instagram', networkName:  'instagram', host:process.env.HOST })//JSON.stringify(stats)});
});

router.get('/data', async (req: express.Request, res: express.Response) => {
    res.send(await model.getCache().catch(e=>{return {error:1, data:e}}))
})