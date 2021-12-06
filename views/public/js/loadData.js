console.log($("#title"))
let chargement = $("<div id=\"chargement\"></div>")
chargement.append($("<div class=loader></div>"))
chargement.append($("<p></p>").text("Chargement des données ..."))
$("#status").append(chargement);

(async ()=>{
    let req = await fetch(`${host}/${networkName}/data`)
    let data = await req.json()
    console.log(data)
    $("#status").remove()
    displayData(data)
})()

