$('#dateDebut').datepicker({ format: "dd/mm/yyyy" });
$("#dateDebut")[0].value = moment().subtract(90, "days").format("DD/MM/YYYY")
$('#dateFin').datepicker({ format: "dd/mm/yyyy" });
$("#calDebut").on("click", () => { $('#dateDebut').focus() })
$("#calFin").on("click", () => { $('#dateFin').focus() })


let chargement = $("<div id=\"chargement\"></div>")
chargement.append($("<div class=loader></div>"))
chargement.append($("<p></p>").text("Chargement des données ..."))
$("#status").append(chargement);
let mychart, data, firstDateFollowers, firstDatePosts, ctx

(async () => {
    let reqs = await Promise.all([
        fetch(`${host}/instagram/data`),
        fetch(`${host}/facebook/data`),
        fetch(`${host}/twitter/data`),
        fetch(`${host}/linkedin/data`),
    ])
    data = await Promise.all(reqs.map(e => e.json()))
    data = { instagram: data[0], facebook: data[1], twitter: data[2], linkedin: data[3] }
    console.log(data)
    $("#status").remove();
    firstDateFollowers = moment()
    firstDatePosts = moment()
    for (let network in data) {
        let followsDate = data[network].followersHistory[0]
        if (followsDate && followsDate.date && moment(followsDate.date).isBefore(firstDateFollowers))
            firstDateFollowers = moment(followsDate.date).hour(0).minute(0).second(0).millisecond(0)
        let postsDate = data[network].posts[0]
        if (postsDate && postsDate.date && moment(postsDate.date).isBefore(firstDatePosts))
            firstDatePosts = moment(postsDate.date).hour(0).minute(0).second(0).millisecond(0)
    }
    //followers history ----------------------
    networkList.forEach(e => {
        let datesRow = data[e].followersHistory.map(e => e.date)
        let valuesRow = data[e].followersHistory.map(e => e.followers)
        // console.log(e)
        // let { dates, values } = addMissingData(datesRow, valuesRow, "days")
        datesRow = datesRow.map(e => moment(e))
        let dates = [], values = [], i = 0
        // console.log(veryFirstDate.format("DD/MM/YY"))
        for (let currDate = firstDateFollowers.clone(); currDate.isSameOrBefore(moment()); currDate.add(1, "days")) {
            // console.log(i)
            if (!moment(datesRow[i]).isBefore(currDate)) {
                dates.push(currDate.valueOf())

            } else {
                i++
                currDate.subtract(1, "days")
                continue
            }
            if (moment(datesRow[i]).hour(0).minute(0).second(0).millisecond(0).isSame(currDate)) {
                values.push(valuesRow[i])
                i++
            } else {
                values.push(null)
            }
        }
        data[e].followersHistory.values = values
        data[e].followersHistory.dates = dates
    });
    //posts details------------- ----------------------
    networkList.forEach(e => {
        if(e=="linkedin")return
        let datesRow = data[e].posts.map(e => e.date)
        let valuesRow = data[e].posts
        datesRow = datesRow.map(e => moment(e))
        let dates = [], values = [], i = 0
        for (let currDate = firstDatePosts.clone(); currDate.isSameOrBefore(moment()); currDate.add(1, "days")) {
            if (!moment(datesRow[i]).isBefore(currDate)) {
                dates.push(currDate.valueOf())

            } else {
                i++
                currDate.subtract(1, "days")
                continue
            }
            if (moment(datesRow[i]).hour(0).minute(0).second(0).millisecond(0).isSame(currDate)) {
                values.push(valuesRow[i])
                i++
            } else {
                values.push(null)
            }
        }
        data[e].postsDetails = {}
        data[e].postsDetails.values = values
        data[e].postsDetails.dates = dates
    });
    //linkedin insights -------------------------
    let datesRow = data.linkedin.insights.map(e => e.date)
    let valuesRow = data.linkedin.insights
    datesRow = datesRow.map(e => moment(e))
    let dates = [], values = [], i = 0
    for (let currDate = firstDatePosts.clone(); currDate.isSameOrBefore(moment()); currDate.add(1, "days")) {
        if (!moment(datesRow[i]).isBefore(currDate)) {
            dates.push(currDate.valueOf())

        } else {
            i++
            currDate.subtract(1, "days")
            continue
        }
        if (moment(datesRow[i]).hour(0).minute(0).second(0).millisecond(0).isSame(currDate)) {
            values.push(valuesRow[i])
            i++
        } else {
            values.push(null)
        }
    }
    data.linkedin.insights.values = values
    data.linkedin.insights.dates = dates
    //instagram stories ------------------
    datesRow = data.instagram.storiesHistory.map(e => e.date)
    valuesRow = data.instagram.storiesHistory.map(e => e.stories)
    // console.log(e)
    // let { dates, values } = addMissingData(datesRow, valuesRow, "days")
    datesRow = datesRow.map(e => moment(e))
    dates = [], values = [], i = 0
    // console.log(veryFirstDate.format("DD/MM/YY"))
    let firstDateStories = moment(data.instagram.storiesHistory[0].date).hour(0).minute(0).second(0).millisecond(0)
    for (let currDate = firstDateStories; currDate.isSameOrBefore(moment()); currDate.add(1, "days")) {
        // console.log(i)
        if (!moment(datesRow[i]).isBefore(currDate)) {
            dates.push(currDate.valueOf())

        } else {
            i++
            currDate.subtract(1, "days")
            continue
        }
        if (moment(datesRow[i]).hour(0).minute(0).second(0).millisecond(0).isSame(currDate)) {
            values.push(valuesRow[i])
            i++
        } else {
            values.push(null)
        }
    }
    data.instagram.storiesHistory.values = values
    data.instagram.storiesHistory.dates = dates
    //posts count-----------------------
    networkList.forEach(e => {
        let datesRow = data[e].posts.map(e => moment(e.date))
        // datesRow = datesRow.map(e => moment(e))
        let dates = [], values = [], i = 0
        // console.log(veryFirstDate.format("DD/MM/YY"))
        for (let currWeek = firstDatePosts.clone().day(1); currWeek.isSameOrBefore(moment()); currWeek.add(1, "weeks")) {
            dates.push(currWeek.valueOf())
            let currPostNumber = 0
            while (i < datesRow.length && datesRow[i].isBefore(currWeek.clone().add(1, "weeks"))) {
                currPostNumber += 1
                i++
            }
            values.push(currPostNumber)
        }
        data[e].posts.values = values
        data[e].posts.dates = dates
    })

    console.log(data)
    ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, chartOptions)
    myChart.canvas.parentNode.style.height = (window.innerHeight - 15) + "px"
    myChart.canvas.style.position = "absolute"
    myChart.canvas.style.left = "0"
    myChart.canvas.style.marginTop = "80px"
    $("#submit").on("click", updateChart)
    updateChart()
})()

let isVisible = { instagram: true, facebook: false, linkedin: false, twitter: false } //default
let isSelectable = { instagram: true, facebook: true, linkedin: true, twitter: true } //default
let select = "border border-primary border-5 rounded-circle"
let unselect = "border border-white border-5"
$(".mediaSelector").on("click", (e) => {
    let name = e.target.id
    if (!isSelectable[name]) return
    if (Object.values(isVisible).filter(e => e).length == 1 && isVisible[name]) return
    isVisible[name] = !isVisible[name]
    $(`#${name}`)[0].className = isVisible[name] ? select : unselect
})
$("#dataType").on("change", (e) => {
    // console.log(e.target.value)
    networkList.forEach(network=>{
        if(selectableMedias[e.target.value].includes(network)){
            $("#"+network)[0].style.filter = ""
            isSelectable[network] = true
        }else{
            $("#" + network)[0].style.filter = "grayscale(100%)"
            isSelectable[network] = false
            isVisible[network] = false
            $(`#${network}`)[0].className = unselect
        }
    })
})



function updateChart() {
    let mode = $("#dataType")[0].value
    let debut = moment($("#dateDebut")[0].value, "DD/MM/YYYY")
    debut = debut.isValid() ? debut : moment(0)
    let fin = moment($("#dateFin")[0].value, "DD/MM/YYYY")
    fin = fin.isValid() ? fin : moment()
    myChart.data.datasets = []
    let everyDates = [];
    if (mode == "follows") {
        networkList.forEach(e => {
            myChart.destroy()
            myChart = new Chart(ctx, { ...chartOptions, type: "line" })
            // console.log(e)
            if (!isVisible[e]) return
            let { dates, values } = computeData(data[e].followersHistory.dates, data[e].followersHistory.values, debut, fin)
            everyDates.push(dates)
            myChart.data.datasets.push({ ...defaultDataset, label: e, data: values, backgroundColor: colors[e], borderColor: colors[e] })
        })
        myChart.data.labels = everyDates[0].map(e => e.format("DD/MM/YYYY"))
    } else if (mode == "posts") {
        networkList.forEach(e => {
            myChart.destroy()
            myChart = new Chart(ctx, { ...chartOptions, type: "bar" })
            // console.log(e)
            if (!isVisible[e]) return
            let { dates, values } = computeData(data[e].posts.dates, data[e].posts.values, debut, fin)
            everyDates.push(dates)
            myChart.data.datasets.push({ ...defaultDataset, label: e, data: values, backgroundColor: colors[e], borderColor: colors[e], minBarLength: 3 })
        })
        myChart.data.labels = everyDates[0].map(e => e.format("DD/MM/YYYY"))
    } else if (mode == "impressions" || mode == "engagement" || mode == "engagementRate" || mode == "likes" || mode == "comments"){
        myChart.destroy()
        myChart = new Chart(ctx, { ...chartOptions, type: "bar" })
        if (mode == "engagementRate")
            myChart.options.scales.y.max = 1
        networkList.forEach(e => {
            // console.log(e)
            if (!isVisible[e]) return
            let dates, values
            if(e=="linkedin"){
                if(mode == "engagement"){
                    ({ dates, values } = computeData(data[e].insights.dates, data[e].insights.values.map(e => e?e.engagementRate * e.impressions:null), debut, fin))
                }else
                    ({ dates, values } = computeData(data[e].insights.dates, data[e].insights.values.map(e => e?e[mode]:null), debut, fin))
            }
            else{
                if(mode == "engagementRate")
                    ({ dates, values } = computeData(data[e].postsDetails.dates, data[e].postsDetails.values.map(e => e ? (e.likes + e.comments)/e.impressions : null), debut, fin))
                else if(mode == "engagement")
                    ({ dates, values } = computeData(data[e].postsDetails.dates, data[e].postsDetails.values.map(e => e ? e.likes + e.comments : null), debut, fin))
                else
                    ({ dates, values } = computeData(data[e].postsDetails.dates, data[e].postsDetails.values.map(e => e ? e[mode] : null), debut, fin))
            }
            everyDates.push(dates)
            myChart.data.datasets.push({ ...defaultDataset, label: e, data: values, backgroundColor: colors[e], borderColor: colors[e], minBarLength: 3 })
        })
        myChart.data.labels = everyDates[0].map(e => e.format("DD/MM/YYYY"))
    }else if (mode == "stories"){
        networkList.forEach(e => {
            myChart.destroy()
            myChart = new Chart(ctx, { ...chartOptions, type: "bar" })
            // console.log(e)
            if (!isVisible[e]) return
            let { dates, values } = computeData(data[e].storiesHistory.dates, data[e].storiesHistory.values, debut, fin)
            everyDates.push(dates)
            myChart.data.datasets.push({ ...defaultDataset, label: e, data: values, backgroundColor: colors[e], borderColor: colors[e], minBarLength: 3 })
        })
        myChart.data.labels = everyDates[0].map(e => e.format("DD/MM/YYYY"))
    }
    myChart.update()
}
function computeData(dates, values, dateMin, dateMax) { //dates:[unix], values[any], dateMin : dateMax : moment()
    let resDates = [], resValue = []
    dates.forEach((date, i) => {
        let currDate = moment(date), currVal = values[i]
        if (currDate.isAfter(dateMin) && currDate.isBefore(dateMax)) {
            resDates.push(currDate)
            resValue.push(currVal)
        }
    })
    return { dates: resDates, values: resValue }
}