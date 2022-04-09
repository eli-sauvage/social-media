$("#connect").on("click", (e)=>{
    e.preventDefault()
    location.href = "/connect/activate/"+$("#id")[0].value
})
