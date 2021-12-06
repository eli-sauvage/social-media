console.log($("#title"))
let chargement = $("<div id=\"chargement\"></div>")
chargement.append($("<div class=loader></div>"))
chargement.append($("<p></p>").text("Chargement des données ..."))
$("#status").append(chargement);

(async ()=>{
    let req = await fetch(`http://127.0.0.1:1337/${networkName}/data`)
    let data = await req.json()
    console.log(data)
    $("#status").remove()
    displayData(data)
})()

