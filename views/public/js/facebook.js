let data
function displayData(data) {
    let table = $("<table></table>").attr("id", "table")
    $("#title").after(table)
    data.posts.sort((a, b) => a.date - b.date)
    data.followersHistory.sort((a, b) => a.date - b.date)
    let [firstDatePost, lastDatePost] = [data.posts[0].date, data.posts[data.posts.length - 1].date]
    let [firstDateFollowers, lastDateFollowers] = [data.followersHistory[0].date, data.followersHistory[data.followersHistory.length - 1].date]
    let firstDate = Math.min(firstDateFollowers, firstDatePost)
    let lastDate = Math.max(lastDateFollowers, lastDatePost)
    firstMonday = new Date(new Date(firstDate - (new Date(firstDate).getDay() - 1) * 1000 * 60 * 60 * 24).setHours(0, 0, 0))
    let everyMonday = []
    for (let i = firstMonday.getTime(); i < lastDate; i += 7 * 24 * 60 * 60 * 1000)everyMonday = [...everyMonday, new Date(i)]
    let [impressions, engagement, postNb, taux, followers] = [-1, -1, -1, -1, -1]
    let [red, green] = ["#FF5555", "#55FF55"]
    everyMonday.forEach(monday => {
        let [oldI, oldE, oldP, oldT, oldF] = [impressions, engagement, postNb, taux, followers]
        let line = $("<tr></tr>")
        //semaines
        line.append($("<td></td>").text(monday.toLocaleDateString()))
        //follows
        followers = valForWeek(monday, data.followersHistory, "followers")
        let evolF = oldF == -1 || followers == 0 ? 0 : followers - oldF
        line.append($("<td></td>").text(`${followers||""} ${evolF ? (evolF > 0 ? "(+" : "(") + evolF + ")" : ""}`).css("background-color", evolF > 0 ? green : evolF < 0 ? red : ""))
        if(followers==0)followers=oldF
        //posts
        let posts = []
        data.posts.forEach(e => {
            if (e.date >= monday.getTime() && e.date <= monday.getTime() + 7 * 24 * 60 * 60 * 1000) posts.push(e)
        })
        postNb = posts.length
        let afficherData = true
        if (postNb) {
            impressions = 0
            posts.forEach(post => impressions += post.impressions)
            engagement = 0
            posts.forEach(post => engagement += post.likes || 0 + post.comments || 0)   
            if(engagement > impressions) afficherData = false
            taux = !posts.find(e=>e.impressions) ? oldT : !!engagement && !!impressions ? engagement / impressions * 100 : 0
        }

        let evolP = oldP == -1 ? 0 : postNb - oldP
        line.append($("<td></td>").text(`${postNb}  ${evolP ? (evolP > 0 ? "(+" : "(") + evolP + ")" : ""}`).css("background-color", evolP > 0 ? green : evolP < 0 ? red : ""))
        //impressions
        let evolI = oldI == -1 ? 0 : impressions - oldI
        line.append($("<td></td>").text(`${(afficherData && postNb ? isNaN(impressions)?"":Math.floor(impressions / postNb) : "/")}  ${evolI  && afficherData ? (evolI > 0 ? "(+" : "(") + evolI + ")" : ""}`).css("background-color", evolI > 0 ? green : evolI < 0 ? red : ""))
        //engagement
        let evolE = oldE == -1 ? 0 : engagement - oldE
        line.append($("<td></td>").text(`${afficherData && postNb? Math.floor(engagement / postNb) : "/"}  ${evolE  && afficherData ? (evolE > 0 ? "(+" : "(") + evolE + ")" : ""}`).css("background-color", evolE > 0 ?
            green : evolE < 0 ? red : ""))
        //taux
        let evolT = oldT == -1 ? 0 : (taux - oldT).toFixed(2)
        line.append($("<td></td>").text(`${afficherData && postNb? isNaN(impressions)?"":taux.toFixed(2) : "/"}  ${evolT != "0.00" && afficherData ? (evolT > 0 ? "(+" : "(") + evolT + ")" : ""}`).css("background-color", evolT > 0 ? green : evolT < 0 ? red : ""))
        $("#table").prepend(line)
    })
    $("#table").prepend($("<tr></tr>").attr("id", "header"))
    let h = [
        $("<th></th>").text("Semaines"),
        $(`<th>Followers <br> (live:${data.followers})</th>`),
        //$("<tr></tr>").append($("<th></th>").text("Evolution")),
        $("<th></th>").text("Publications"),
        $("<th>Impressions <br> (moyenne par post)</th>"),
        $("<th>Engagements <br> (moyenne par post)</th>"),
        $("<th></th>").text("Taux d'engagement")
    ]
    h.forEach(collone => $("#header").append(collone))
}

function valForWeek(mondayDate, array, field, sum) {
    let [mTime, weekDuration] = [mondayDate.getTime(), 7 * 24 * 60 * 60 * 1000]
    let total = 0
    array.forEach(e => {
        if (e.date >= mTime && e.date <= mTime + weekDuration) {
            if (sum) total += e[field]
            else total = e[field]
        }
    })
    return total
}