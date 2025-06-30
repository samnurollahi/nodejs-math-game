const {Router} = require("express")

const router = new Router()

// index
router.get("/", (req, res) => {
    res.render("index", {
        title: "game"
    })
})

module.exports = router