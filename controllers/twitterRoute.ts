import * as express from 'express';
import * as model from '../models/twitter'
export const router = express.Router();


router.get('/table', async (req: express.Request, res: express.Response) => { //ancienne mise en forme
    res.render('table', { title: 'Twitter', networkName:  'twitter', host:process.env.HOST })
});
router.get('/data', async (req: express.Request, res: express.Response) => {
    res.send(await model.getCache().catch(e=>{return {error:1, data:e.toString()||e}}))
})