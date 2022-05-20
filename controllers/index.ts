/*
 * GET home page.
 */
import * as express from 'express';
import { unlinkSync } from "fs"
const router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.render("index", { host: process.env.HOST })
});

router.put('/forceReload', (req: express.Request, res: express.Response) => {
    console.log("recu")
    unlinkSync("cache/facebook.json")
    unlinkSync("cache/instagram.json")
    unlinkSync("cache/twitter.json")
    unlinkSync("cache/linkedin.json")
    res.send()
})

export default router;